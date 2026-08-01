import { prisma } from '@/server/db/prisma'
import { listRepoLabels } from '@/server/github'
import { finishEntitySyncPages } from '@/server/sync/finish-pages'
import * as checkpoints from '@/server/sync/checkpoints'
import * as jobs from '@/server/sync/jobs'
import { loadSyncRepository } from '@/server/sync/repo'
import { SYNC_MAX_PAGES, type SyncJobData } from '@/server/sync/types'

const ENTITY = 'labels' as const

export async function runLabelsSync(data: SyncJobData): Promise<void> {
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

      const { items, hasNextPage } = await listRepoLabels(
        repo.owner,
        repo.name,
        repo.installation.githubInstallationId,
        { page },
      )
      pagesProcessed += 1
      hasMorePages = hasNextPage

      for (const label of items) {
        await prisma.label.upsert({
          where: { repositoryId_name: { repositoryId: repo.id, name: label.name } },
          create: {
            repositoryId: repo.id,
            name: label.name,
            color: label.color,
            description: label.description,
            githubId: label.githubId !== null ? BigInt(label.githubId) : null,
          },
          update: {
            color: label.color,
            description: label.description,
            githubId: label.githubId !== null ? BigInt(label.githubId) : undefined,
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
