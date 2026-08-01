import { prisma } from '@/server/db/prisma'
import { listRepoReleases } from '@/server/github'
import { finishEntitySyncPages } from '@/server/sync/finish-pages'
import * as checkpoints from '@/server/sync/checkpoints'
import * as jobs from '@/server/sync/jobs'
import { loadSyncRepository } from '@/server/sync/repo'
import { SYNC_MAX_PAGES, type SyncJobData } from '@/server/sync/types'

const ENTITY = 'releases' as const

export async function runReleasesSync(data: SyncJobData): Promise<void> {
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

      const { items, hasNextPage } = await listRepoReleases(
        repo.owner,
        repo.name,
        repo.installation.githubInstallationId,
        { page },
      )
      pagesProcessed += 1
      hasMorePages = hasNextPage

      for (const r of items) {
        await prisma.release.upsert({
          where: { githubId: BigInt(r.githubId) },
          create: {
            githubId: BigInt(r.githubId),
            repositoryId: repo.id,
            tagName: r.tagName,
            name: r.name,
            body: r.body,
            draft: r.draft,
            prerelease: r.prerelease,
            htmlUrl: r.htmlUrl,
            publishedAt: r.publishedAt,
            githubCreatedAt: r.githubCreatedAt,
          },
          update: {
            name: r.name,
            body: r.body,
            draft: r.draft,
            prerelease: r.prerelease,
            htmlUrl: r.htmlUrl,
            publishedAt: r.publishedAt,
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
