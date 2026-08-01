import { IssueState, PullRequestState } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import * as jobs from '@/server/sync/jobs'
import { loadSyncRepository } from '@/server/sync/repo'
import type { SyncJobData } from '@/server/sync/types'

/** Recount denormalized Repository counters from already-synced local data. No GitHub calls. */
export async function runStatisticsSync(data: SyncJobData): Promise<void> {
  const started = await jobs.markRunning(data.syncJobId)
  if (!started) return

  const repo = await loadSyncRepository(data.repositoryId)

  try {
    const [openIssues, openPRs, collaborators] = await Promise.all([
      prisma.issue.count({
        where: { repositoryId: repo.id, state: { not: IssueState.closed } },
      }),
      prisma.pullRequest.count({
        where: { repositoryId: repo.id, state: { notIn: [PullRequestState.merged, PullRequestState.closed] } },
      }),
      prisma.repoContributor.count({ where: { repositoryId: repo.id } }),
    ])

    await prisma.repository.update({
      where: { id: repo.id },
      data: { openIssues, openPRs, collaborators },
    })

    await jobs.markProgress(data.syncJobId, { processedItems: 3, totalItems: 3 })
    await jobs.markCompleted(data.syncJobId)
  } catch (error) {
    // Permanent failure is recorded by the worker DLQ handler after retries exhaust.
    throw error
  }
}
