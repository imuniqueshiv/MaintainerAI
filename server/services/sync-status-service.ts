import { SyncJobStatus } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { listRecentSyncJobs, getActiveSyncJobs } from '@/server/sync/jobs'
import { listCheckpoints } from '@/server/sync/checkpoints'

function serializeSyncJob(job: {
  id: string
  entity: string
  trigger: string
  status: string
  mode: string
  progress: number
  totalItems: number | null
  processedItems: number
  error: string | null
  startedAt: Date | null
  finishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}) {
  return {
    id: job.id,
    entity: job.entity,
    trigger: job.trigger,
    status: job.status,
    mode: job.mode,
    progress: job.progress,
    totalItems: job.totalItems,
    processedItems: job.processedItems,
    error: job.error,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  }
}

export async function getRepositorySyncStatus(repositoryId: string) {
  const [repo, activeJobs, recentJobs] = await Promise.all([
    prisma.repository.findUnique({
      where: { id: repositoryId },
      select: {
        syncStatus: true,
        lastFullSyncAt: true,
        lastIncrementalSyncAt: true,
        syncError: true,
      },
    }),
    getActiveSyncJobs(repositoryId),
    listRecentSyncJobs(repositoryId, 9),
  ])

  return {
    syncStatus: activeJobs.length > 0 ? 'syncing' : (repo?.syncStatus ?? 'idle'),
    lastFullSyncAt: repo?.lastFullSyncAt ?? null,
    lastIncrementalSyncAt: repo?.lastIncrementalSyncAt ?? null,
    syncError: activeJobs.length > 0 ? null : (repo?.syncError ?? null),
    activeJobs: activeJobs.map(serializeSyncJob),
    recentJobs: recentJobs.map(serializeSyncJob),
  }
}

export async function getRepositorySyncHistory(repositoryId: string, limit: number) {
  const jobs = await listRecentSyncJobs(repositoryId, limit)
  return jobs.map(serializeSyncJob)
}

export async function getRepositorySyncCheckpoints(repositoryId: string) {
  const checkpoints = await listCheckpoints(repositoryId)
  return checkpoints.map((c) => ({
    entity: c.entity,
    page: c.page,
    cursor: c.cursor,
    since: c.since,
    completed: c.completed,
    lastSuccessAt: c.lastSuccessAt,
  }))
}

export async function getSyncStatisticsForUser(userId: string, organizationId?: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { organizationId: true },
  })
  const orgIds = organizationId ? [organizationId] : memberships.map((m) => m.organizationId)
  if (orgIds.length === 0) {
    return {
      totalRepositories: 0,
      syncingRepositories: 0,
      completedRepositories: 0,
      failedRepositories: 0,
      idleRepositories: 0,
      totalIssues: 0,
      totalPullRequests: 0,
      totalContributors: 0,
      activeSyncJobs: 0,
      lastSyncAt: null as Date | null,
    }
  }

  const repos = await prisma.repository.findMany({
    where: { organizationId: { in: orgIds }, deletedAt: null },
    select: { id: true, syncStatus: true, lastFullSyncAt: true, lastIncrementalSyncAt: true },
  })
  const repoIds = repos.map((r) => r.id)

  const [totalIssues, totalPullRequests, totalContributors, activeSyncJobs] = await Promise.all([
    repoIds.length ? prisma.issue.count({ where: { repositoryId: { in: repoIds } } }) : 0,
    repoIds.length ? prisma.pullRequest.count({ where: { repositoryId: { in: repoIds } } }) : 0,
    repoIds.length
      ? prisma.repoContributor.groupBy({ by: ['contributorId'], where: { repositoryId: { in: repoIds } } })
      : [],
    repoIds.length
      ? prisma.syncJob.count({
          where: {
            repositoryId: { in: repoIds },
            status: { in: [SyncJobStatus.queued, SyncJobStatus.running] },
          },
        })
      : 0,
  ])

  const lastSyncAt = repos.reduce<Date | null>((latest, repo) => {
    const candidate = repo.lastIncrementalSyncAt ?? repo.lastFullSyncAt
    if (!candidate) return latest
    if (!latest || candidate > latest) return candidate
    return latest
  }, null)

  return {
    totalRepositories: repos.length,
    syncingRepositories: repos.filter((r) => r.syncStatus === 'syncing').length,
    completedRepositories: repos.filter((r) => r.syncStatus === 'completed').length,
    failedRepositories: repos.filter((r) => r.syncStatus === 'failed').length,
    idleRepositories: repos.filter((r) => r.syncStatus === 'idle').length,
    totalIssues,
    totalPullRequests,
    totalContributors: Array.isArray(totalContributors) ? totalContributors.length : 0,
    activeSyncJobs,
    lastSyncAt,
  }
}
