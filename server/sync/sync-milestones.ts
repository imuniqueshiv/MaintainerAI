import { prisma } from '@/server/db/prisma'
import { listRepoMilestones } from '@/server/github'
import { finishEntitySyncPages } from '@/server/sync/finish-pages'
import * as checkpoints from '@/server/sync/checkpoints'
import * as jobs from '@/server/sync/jobs'
import { loadSyncRepository } from '@/server/sync/repo'
import { SYNC_MAX_PAGES, type SyncJobData } from '@/server/sync/types'

const ENTITY = 'milestones' as const

export async function runMilestonesSync(data: SyncJobData): Promise<void> {
  const started = await jobs.markRunning(data.syncJobId)
  if (!started) return

  const repo = await loadSyncRepository(data.repositoryId)

  try {
    const checkpoint = await checkpoints.startCheckpoint(repo.id, ENTITY, {
      reset: data.mode === 'full',
    })
    let page = checkpoint.page
    let processed = 0
    let pagesProcessed = 0
    let hasMorePages = false
    const syncStartedAt = new Date()

    for (let i = 0; i < SYNC_MAX_PAGES; i++) {
      if (await jobs.isCancelled(data.syncJobId)) {
        await jobs.markCancelled(data.syncJobId)
        return
      }

      const { items, hasNextPage } = await listRepoMilestones(
        repo.owner,
        repo.name,
        repo.installation.githubInstallationId,
        { page, state: 'all' },
      )
      pagesProcessed += 1
      hasMorePages = hasNextPage

      for (const m of items) {
        await prisma.milestone.upsert({
          where: { githubId: BigInt(m.githubId) },
          create: {
            githubId: BigInt(m.githubId),
            repositoryId: repo.id,
            number: m.number,
            title: m.title,
            description: m.description,
            state: m.state,
            dueOn: m.dueOn,
            closedAt: m.closedAt,
            htmlUrl: m.htmlUrl,
            openIssues: m.openIssues,
            closedIssues: m.closedIssues,
            githubCreatedAt: m.githubCreatedAt,
            githubUpdatedAt: m.githubUpdatedAt,
          },
          update: {
            title: m.title,
            description: m.description,
            state: m.state,
            dueOn: m.dueOn,
            closedAt: m.closedAt,
            htmlUrl: m.htmlUrl,
            openIssues: m.openIssues,
            closedIssues: m.closedIssues,
            githubUpdatedAt: m.githubUpdatedAt,
          },
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
  } catch (error) {
    throw error
  }
}
