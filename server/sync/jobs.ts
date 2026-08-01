import { SyncJobStatus, SyncStatus, type Prisma, type SyncEntityType, type SyncJob, type SyncTrigger } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { writeAuditLog } from '@/server/services/audit-service'
import { createLogger } from '@/server/logger'

const log = createLogger({ component: 'sync.jobs' })

export async function createSyncJob(input: {
  repositoryId: string
  organizationId?: string | null
  entity: SyncEntityType
  trigger: SyncTrigger
  mode: string
  triggeredBy?: string | null
  metadata?: Record<string, unknown>
}): Promise<SyncJob> {
  return prisma.syncJob.create({
    data: {
      repositoryId: input.repositoryId,
      organizationId: input.organizationId ?? null,
      entity: input.entity,
      trigger: input.trigger,
      mode: input.mode,
      status: SyncJobStatus.queued,
      triggeredBy: input.triggeredBy ?? null,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
    },
  })
}

export async function attachBullJobId(syncJobId: string, bullJobId: string): Promise<void> {
  await prisma.syncJob.update({ where: { id: syncJobId }, data: { bullJobId } })
}

export async function markRunning(syncJobId: string): Promise<SyncJob | null> {
  const existing = await prisma.syncJob.findUnique({ where: { id: syncJobId } })
  if (!existing) return null
  if (existing.status === SyncJobStatus.cancelled) return null

  return prisma.syncJob.update({
    where: { id: syncJobId },
    data: {
      status: SyncJobStatus.running,
      startedAt: existing.startedAt ?? new Date(),
      error: null,
    },
  })
}

export async function markProgress(
  syncJobId: string,
  data: { processedItems: number; totalItems?: number },
): Promise<void> {
  const progress =
    data.totalItems && data.totalItems > 0
      ? Math.min(99, Math.round((data.processedItems / data.totalItems) * 100))
      : undefined
  await prisma.syncJob.update({
    where: { id: syncJobId },
    data: {
      processedItems: data.processedItems,
      totalItems: data.totalItems,
      progress,
    },
  })
}

export async function markCompleted(syncJobId: string): Promise<void> {
  const job = await prisma.syncJob.update({
    where: { id: syncJobId },
    data: { status: SyncJobStatus.completed, progress: 100, finishedAt: new Date() },
  })
  await writeAuditLog({
    action: 'sync.complete',
    targetType: 'sync_job',
    targetId: job.id,
    organizationId: job.organizationId,
    actorUserId: job.triggeredBy,
    metadata: { entity: job.entity, repositoryId: job.repositoryId },
  }).catch((error) => log.warn({ err: error }, 'Failed to write sync.complete audit log'))
  await reconcileRepositorySyncStatus(job.repositoryId).catch((error) =>
    log.warn({ err: error }, 'Failed to reconcile repository sync status after complete'),
  )
}

export async function markFailed(syncJobId: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : 'Sync job failed'
  const job = await prisma.syncJob.update({
    where: { id: syncJobId },
    data: { status: SyncJobStatus.failed, error: message, finishedAt: new Date() },
  })
  await writeAuditLog({
    action: 'sync.fail',
    targetType: 'sync_job',
    targetId: job.id,
    organizationId: job.organizationId,
    actorUserId: job.triggeredBy,
    metadata: { entity: job.entity, repositoryId: job.repositoryId, error: message },
  }).catch((err) => log.warn({ err }, 'Failed to write sync.fail audit log'))
  await reconcileRepositorySyncStatus(job.repositoryId).catch((err) =>
    log.warn({ err }, 'Failed to reconcile repository sync status after fail'),
  )
}

export async function markCancelled(syncJobId: string): Promise<void> {
  const existing = await prisma.syncJob.findUnique({ where: { id: syncJobId } })
  await prisma.syncJob.updateMany({
    where: { id: syncJobId, status: { in: [SyncJobStatus.queued, SyncJobStatus.running] } },
    data: { status: SyncJobStatus.cancelled, finishedAt: new Date() },
  })
  if (existing) {
    await reconcileRepositorySyncStatus(existing.repositoryId).catch((error) =>
      log.warn({ err: error }, 'Failed to reconcile repository sync status after cancel'),
    )
  }
}

/** Cooperative cancel check — call between pages in every entity syncer. */
export async function isCancelled(syncJobId: string): Promise<boolean> {
  const job = await prisma.syncJob.findUnique({
    where: { id: syncJobId },
    select: { status: true },
  })
  return job?.status === SyncJobStatus.cancelled
}

export async function listRecentSyncJobs(
  repositoryId: string,
  limit = 25,
): Promise<SyncJob[]> {
  return prisma.syncJob.findMany({
    where: { repositoryId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getActiveSyncJobs(repositoryId: string): Promise<SyncJob[]> {
  return prisma.syncJob.findMany({
    where: { repositoryId, status: { in: [SyncJobStatus.queued, SyncJobStatus.running] } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getSyncJob(syncJobId: string): Promise<SyncJob | null> {
  return prisma.syncJob.findUnique({ where: { id: syncJobId } })
}

/**
 * Roll up Repository.syncStatus from ledger jobs so metadata completion
 * does not mark the whole repository "completed" while issues/PRs still run.
 */
export async function reconcileRepositorySyncStatus(repositoryId: string): Promise<void> {
  const active = await getActiveSyncJobs(repositoryId)
  if (active.length > 0) {
    await prisma.repository.update({
      where: { id: repositoryId },
      data: { syncStatus: SyncStatus.syncing, syncError: null },
    })
    return
  }

  const latestFailed = await prisma.syncJob.findFirst({
    where: { repositoryId, status: SyncJobStatus.failed },
    orderBy: { finishedAt: 'desc' },
  })
  const latestCompleted = await prisma.syncJob.findFirst({
    where: { repositoryId, status: SyncJobStatus.completed },
    orderBy: { finishedAt: 'desc' },
  })

  if (
    latestFailed?.finishedAt &&
    (!latestCompleted?.finishedAt || latestFailed.finishedAt > latestCompleted.finishedAt)
  ) {
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        syncStatus: SyncStatus.failed,
        syncError: latestFailed.error ?? 'Sync failed',
      },
    })
    return
  }

  if (latestCompleted) {
    await prisma.repository.update({
      where: { id: repositoryId },
      data: {
        syncStatus: SyncStatus.completed,
        syncError: null,
        lastIncrementalSyncAt: latestCompleted.finishedAt ?? new Date(),
      },
    })
  }
}
