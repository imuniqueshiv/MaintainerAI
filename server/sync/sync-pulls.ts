import { prisma } from '@/server/db/prisma'
import { listRepoPulls } from '@/server/github'
import { pullCreateData, pullUpdateData, upsertContributorFromGitHubUser } from '@/server/sync/mappers'
import { enqueueStatisticsSync } from '@/server/sync/coordinator'
import { finishEntitySyncPages } from '@/server/sync/finish-pages'
import * as checkpoints from '@/server/sync/checkpoints'
import * as jobs from '@/server/sync/jobs'
import { loadSyncRepository } from '@/server/sync/repo'
import { SYNC_MAX_PAGES, type SyncJobData } from '@/server/sync/types'

const ENTITY = 'pull_requests' as const

export async function runPullsSync(data: SyncJobData): Promise<void> {
  const started = await jobs.markRunning(data.syncJobId)
  if (!started) return

  const repo = await loadSyncRepository(data.repositoryId)

  try {
    const checkpoint = await checkpoints.startCheckpoint(repo.id, ENTITY, {
      reset: data.mode === 'full',
    })
    let page = checkpoint.page
    const since = data.mode === 'incremental' ? checkpoint.since ?? undefined : undefined
    let processed = 0
    let pagesProcessed = 0
    let hasMorePages = false
    const syncStartedAt = new Date()

    for (let i = 0; i < SYNC_MAX_PAGES; i++) {
      if (await jobs.isCancelled(data.syncJobId)) {
        await jobs.markCancelled(data.syncJobId)
        return
      }

      const { items, hasNextPage } = await listRepoPulls(
        repo.owner,
        repo.name,
        repo.installation.githubInstallationId,
        { page, since, state: 'all' },
      )
      pagesProcessed += 1
      hasMorePages = hasNextPage

      for (const pr of items) {
        const authorContributorId = await upsertContributorFromGitHubUser(pr.author)
        await prisma.pullRequest.upsert({
          where: { githubId: BigInt(pr.githubId) },
          create: pullCreateData(repo.id, pr, authorContributorId),
          update: pullUpdateData(pr, authorContributorId),
        })
        processed += 1
      }

      await checkpoints.advanceCheckpoint(repo.id, ENTITY, { page: page + 1 })
      await jobs.markProgress(data.syncJobId, { processedItems: processed })

      if (!hasNextPage) break
      page += 1
    }

    await finishEntitySyncPages({
      data,
      entity: ENTITY,
      repositoryId: repo.id,
      syncStartedAt,
      hasMorePages,
      pagesProcessed,
    })
    if (!hasMorePages || pagesProcessed < SYNC_MAX_PAGES) {
      await enqueueStatisticsSync(repo.id)
    }
  } catch (error) {
    // Permanent failure is recorded by the worker DLQ handler after retries exhaust.
    throw error
  }
}
