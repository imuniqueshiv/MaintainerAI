import { SyncStatus, type SyncEntityType } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { JOB_NAMES, QUEUE_NAMES } from '@/server/constants'
import { getQueue } from '@/server/queue/queues'
import { writeAuditLog } from '@/server/services/audit-service'
import { createLogger } from '@/server/logger'
import * as jobs from '@/server/sync/jobs'
import type { CancelSyncInput, StartSyncInput, SyncEntityQueueMapping, SyncJobData, SyncMode } from '@/server/sync/types'
import { SYNC_ENTITIES } from '@/server/sync/types'

const log = createLogger({ component: 'sync.coordinator' })

/** Sync jobs retry harder than default queue jobs — GitHub rate limits are transient. */
const SYNC_JOB_OPTIONS = {
  attempts: 5,
  backoff: { type: 'exponential' as const, delay: 3_000 },
}

const ENTITY_QUEUE_MAP: Record<SyncEntityType, SyncEntityQueueMapping> = {
  repository: {
    entity: 'repository',
    queue: QUEUE_NAMES.SYNC_REPOSITORIES,
    jobName: JOB_NAMES.SYNC_REPOSITORY_RUN,
  },
  issues: {
    entity: 'issues',
    queue: QUEUE_NAMES.SYNC_ISSUES,
    jobName: JOB_NAMES.SYNC_ISSUES_RUN,
  },
  pull_requests: {
    entity: 'pull_requests',
    queue: QUEUE_NAMES.SYNC_PULL_REQUESTS,
    jobName: JOB_NAMES.SYNC_PULL_REQUESTS_RUN,
  },
  labels: {
    entity: 'labels',
    queue: QUEUE_NAMES.SYNC_LABELS,
    jobName: JOB_NAMES.SYNC_LABELS_RUN,
  },
  milestones: {
    entity: 'milestones',
    queue: QUEUE_NAMES.SYNC_MILESTONES,
    jobName: JOB_NAMES.SYNC_MILESTONES_RUN,
  },
  releases: {
    entity: 'releases',
    queue: QUEUE_NAMES.SYNC_RELEASES,
    jobName: JOB_NAMES.SYNC_RELEASES_RUN,
  },
  contributors: {
    entity: 'contributors',
    queue: QUEUE_NAMES.SYNC_CONTRIBUTORS,
    jobName: JOB_NAMES.SYNC_CONTRIBUTORS_RUN,
  },
  branches: {
    entity: 'branches',
    queue: QUEUE_NAMES.SYNC_BRANCHES,
    jobName: JOB_NAMES.SYNC_BRANCHES_RUN,
  },
  statistics: {
    entity: 'statistics',
    queue: QUEUE_NAMES.SYNC_STATISTICS,
    jobName: JOB_NAMES.SYNC_STATISTICS_RUN,
  },
}

/** Map inbound GitHub webhook event names to the sync entity they should refresh. */
export const WEBHOOK_EVENT_ENTITY: Record<string, SyncEntityType> = {
  issues: 'issues',
  pull_request: 'pull_requests',
  label: 'labels',
  milestone: 'milestones',
  release: 'releases',
  push: 'branches',
  member: 'contributors',
}

async function loadRepositoryOrThrow(repositoryId: string) {
  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, deletedAt: null },
  })
  if (!repo) throw AppError.notFound('Repository not found')
  return repo
}

/**
 * Create SyncJob ledger rows and enqueue BullMQ jobs for each requested
 * entity. Never performs GitHub calls inline — workers do all the fetching.
 */
export async function startRepositorySync(input: StartSyncInput) {
  const repo = await loadRepositoryOrThrow(input.repositoryId)
  const entities = input.entities?.length ? input.entities : SYNC_ENTITIES
  const active = await jobs.getActiveSyncJobs(repo.id)
  const activeEntities = new Set(active.map((j) => j.entity))

  const created = []
  for (const entity of entities) {
    // Avoid parallel checkpoint races for the same entity.
    if (activeEntities.has(entity)) {
      log.info({ repositoryId: repo.id, entity }, 'Skipping sync enqueue — entity already active')
      continue
    }
    const mapping = ENTITY_QUEUE_MAP[entity]
    const syncJob = await jobs.createSyncJob({
      repositoryId: repo.id,
      organizationId: repo.organizationId,
      entity,
      trigger: input.trigger,
      mode: input.mode,
      triggeredBy: input.actorUserId,
      metadata: input.ref !== undefined ? { ref: input.ref } : undefined,
    })

    const jobData: SyncJobData = {
      syncJobId: syncJob.id,
      repositoryId: repo.id,
      mode: input.mode,
      ref: input.ref,
    }

    const queue = getQueue(mapping.queue)
    const bullJob = await queue.add(mapping.jobName, jobData, {
      jobId: `${mapping.jobName}-${syncJob.id}`,
      ...SYNC_JOB_OPTIONS,
    })
    if (bullJob.id) {
      await jobs.attachBullJobId(syncJob.id, bullJob.id)
    }
    created.push(syncJob)
    activeEntities.add(entity)
  }

  if (created.length === 0) {
    return created
  }

  if (created.some((j) => j.entity === 'repository') || input.mode === 'full' || input.mode === 'incremental') {
    await prisma.repository.update({
      where: { id: repo.id },
      data: { syncStatus: SyncStatus.syncing, syncError: null },
    })
  }

  await writeAuditLog({
    action: 'sync.start',
    targetType: 'repository',
    targetId: repo.id,
    organizationId: repo.organizationId,
    actorUserId: input.actorUserId,
    metadata: { entities, mode: input.mode, trigger: input.trigger },
  }).catch((error) => log.warn({ err: error }, 'Failed to write sync.start audit log'))

  return created
}

/** Enqueue a single-entity sync — used by webhook delta handling and page continuations. */
export async function enqueueEntitySync(input: {
  repositoryId: string
  entity: SyncEntityType
  trigger: 'webhook' | 'system'
  mode?: SyncMode
  ref?: string | number
}) {
  return startRepositorySync({
    repositoryId: input.repositoryId,
    trigger: input.trigger,
    mode: input.mode ?? 'incremental',
    entities: [input.entity],
    ref: input.ref,
  })
}

/** Debounced statistics recompute — safe to call from every entity syncer on completion. */
export async function enqueueStatisticsSync(repositoryId: string): Promise<void> {
  const mapping = ENTITY_QUEUE_MAP.statistics
  const queue = getQueue(mapping.queue)
  const debounceJobId = `${mapping.jobName}-debounce-${repositoryId}`

  const existing = await queue.getJob(debounceJobId)
  if (existing) {
    const state = await existing.getState()
    if (state === 'waiting' || state === 'delayed' || state === 'active' || state === 'prioritized') {
      return
    }
    await existing.remove().catch(() => undefined)
  }

  const syncJob = await jobs.createSyncJob({
    repositoryId,
    entity: 'statistics',
    trigger: 'system',
    mode: 'incremental',
  })
  const jobData: SyncJobData = { syncJobId: syncJob.id, repositoryId, mode: 'incremental' }
  try {
    const bullJob = await queue.add(mapping.jobName, jobData, {
      jobId: debounceJobId,
      delay: 5_000,
      ...SYNC_JOB_OPTIONS,
    })
    if (bullJob.id) {
      await jobs.attachBullJobId(syncJob.id, bullJob.id)
    }
  } catch (error) {
    await jobs.markCancelled(syncJob.id)
    log.warn({ err: error, repositoryId }, 'Statistics debounce enqueue skipped')
  }
}

export async function cancelSync(input: CancelSyncInput) {
  const repo = await loadRepositoryOrThrow(input.repositoryId)

  const active = input.syncJobId
    ? (await jobs.getSyncJob(input.syncJobId))?.repositoryId === repo.id
      ? [await jobs.getSyncJob(input.syncJobId)].filter(Boolean)
      : []
    : await jobs.getActiveSyncJobs(repo.id)

  const targets = active.filter((j): j is NonNullable<typeof j> => Boolean(j))
  for (const syncJob of targets) {
    await jobs.markCancelled(syncJob.id)
    if (syncJob.bullJobId) {
      const mapping = ENTITY_QUEUE_MAP[syncJob.entity]
      const bullJob = await getQueue(mapping.queue).getJob(syncJob.bullJobId)
      if (bullJob) {
        await bullJob.remove().catch((error) =>
          log.warn({ err: error, syncJobId: syncJob.id }, 'Failed to remove BullMQ sync job'),
        )
      }
    }
  }

  await jobs.reconcileRepositorySyncStatus(repo.id).catch((error) =>
    log.warn({ err: error }, 'Failed to reconcile status after cancel'),
  )

  await writeAuditLog({
    action: 'sync.cancel',
    targetType: 'repository',
    targetId: repo.id,
    organizationId: repo.organizationId,
    actorUserId: input.actorUserId,
    metadata: { syncJobIds: targets.map((t) => t.id) },
  }).catch((error) => log.warn({ err: error }, 'Failed to write sync.cancel audit log'))

  return { cancelled: targets.map((t) => t.id) }
}

export { ENTITY_QUEUE_MAP }
