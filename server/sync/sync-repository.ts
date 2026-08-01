import { SyncStatus } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { fetchRepository } from '@/server/github'
import { upsertRepositoryMetadata } from '@/server/services/repository-github-service'
import { createLogger } from '@/server/logger'
import * as jobs from '@/server/sync/jobs'
import type { SyncJobData } from '@/server/sync/types'

const log = createLogger({ component: 'sync.repository' })

/** Repository entity sync — refreshes core metadata only (issue/PR counters come from sync.statistics). */
export async function runRepositorySync(data: SyncJobData): Promise<void> {
  const started = await jobs.markRunning(data.syncJobId)
  if (!started) return

  const repo = await prisma.repository.findFirst({
    where: { id: data.repositoryId, deletedAt: null },
    include: { installation: true },
  })
  if (!repo) throw AppError.notFound('Repository not found')

  try {
    if (await jobs.isCancelled(data.syncJobId)) {
      await jobs.markCancelled(data.syncJobId)
      return
    }

    const meta = await fetchRepository(repo.installation.githubInstallationId, repo.owner, repo.name)
    await upsertRepositoryMetadata({
      installationId: repo.installationId,
      organizationId: repo.organizationId,
      meta,
      connect: true,
    })

    const now = new Date()
    // Do not flip Repository.syncStatus to completed here — other entity jobs may still
    // be running. Timestamps + reconcile happen via jobs.markCompleted.
    await prisma.repository.update({
      where: { id: repo.id },
      data: {
        syncError: null,
        ...(data.mode === 'full' ? { lastFullSyncAt: now } : { lastIncrementalSyncAt: now }),
        // Keep syncing if a fan-out is in progress; solo metadata refresh reconciles below.
        syncStatus: SyncStatus.syncing,
      },
    })

    await jobs.markCompleted(data.syncJobId)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Repository sync failed'
    await prisma.repository
      .update({ where: { id: repo.id }, data: { syncError: message } })
      .catch((err) => log.warn({ err }, 'Failed to persist repository sync failure state'))
    // Leave SyncJob status to BullMQ permanent-failure handler so retries stay accurate.
    throw error
  }
}
