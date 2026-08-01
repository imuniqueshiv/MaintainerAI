import { prisma } from '@/server/db/prisma'
import { listRepoContributors } from '@/server/github'
import { enqueueStatisticsSync } from '@/server/sync/coordinator'
import { finishEntitySyncPages } from '@/server/sync/finish-pages'
import * as checkpoints from '@/server/sync/checkpoints'
import * as jobs from '@/server/sync/jobs'
import { loadSyncRepository } from '@/server/sync/repo'
import { SYNC_MAX_PAGES, type SyncJobData } from '@/server/sync/types'

const ENTITY = 'contributors' as const

export async function runContributorsSync(data: SyncJobData): Promise<void> {
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

      const { items, hasNextPage } = await listRepoContributors(
        repo.owner,
        repo.name,
        repo.installation.githubInstallationId,
        { page },
      )
      pagesProcessed += 1
      hasMorePages = hasNextPage

      for (const c of items) {
        const contributor = await prisma.contributor.upsert({
          where: { githubId: BigInt(c.githubId) },
          create: {
            githubId: BigInt(c.githubId),
            login: c.login,
            avatarUrl: c.avatarUrl,
            isBotAccount: c.isBot,
            lastActive: new Date(),
          },
          update: {
            login: c.login,
            avatarUrl: c.avatarUrl,
            isBotAccount: c.isBot,
            lastActive: new Date(),
          },
        })

        await prisma.repoContributor.upsert({
          where: {
            repositoryId_contributorId: { repositoryId: repo.id, contributorId: contributor.id },
          },
          create: {
            repositoryId: repo.id,
            contributorId: contributor.id,
            contributions: c.contributions,
          },
          update: {
            contributions: c.contributions,
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
    if (!hasMorePages || pagesProcessed < SYNC_MAX_PAGES) {
      await enqueueStatisticsSync(repo.id)
    }
  } catch (error) {
    throw error
  }
}
