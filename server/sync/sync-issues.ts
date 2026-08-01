import { prisma } from '@/server/db/prisma'
import { listRepoIssues } from '@/server/github'
import { issueCreateData, issueUpdateData, upsertContributorFromGitHubUser, upsertLabelByName } from '@/server/sync/mappers'
import { enqueueStatisticsSync } from '@/server/sync/coordinator'
import { finishEntitySyncPages } from '@/server/sync/finish-pages'
import * as checkpoints from '@/server/sync/checkpoints'
import * as jobs from '@/server/sync/jobs'
import { loadSyncRepository } from '@/server/sync/repo'
import { SYNC_MAX_PAGES, type SyncJobData } from '@/server/sync/types'

const ENTITY = 'issues' as const

async function upsertIssue(repositoryId: string, dto: Awaited<ReturnType<typeof listRepoIssues>>['items'][number]) {
  const authorContributorId = await upsertContributorFromGitHubUser(dto.author)

  let milestoneId: string | null = null
  if (dto.milestoneNumber !== null) {
    const milestone = await prisma.milestone.findUnique({
      where: { repositoryId_number: { repositoryId, number: dto.milestoneNumber } },
    })
    milestoneId = milestone?.id ?? null
  }

  const issue = await prisma.issue.upsert({
    where: { githubId: BigInt(dto.githubId) },
    create: issueCreateData(repositoryId, dto, authorContributorId, milestoneId),
    update: issueUpdateData(dto, authorContributorId, milestoneId),
  })

  const labelIds: string[] = []
  for (const label of dto.labels) {
    labelIds.push(await upsertLabelByName(repositoryId, label))
  }
  await prisma.issueLabel.deleteMany({ where: { issueId: issue.id } })
  if (labelIds.length > 0) {
    await prisma.issueLabel.createMany({
      data: labelIds.map((labelId) => ({ issueId: issue.id, labelId })),
      skipDuplicates: true,
    })
  }

  const assigneeIds: string[] = []
  for (const assignee of dto.assignees) {
    const id = await upsertContributorFromGitHubUser(assignee)
    if (id) assigneeIds.push(id)
  }
  await prisma.issueAssignee.deleteMany({ where: { issueId: issue.id } })
  if (assigneeIds.length > 0) {
    await prisma.issueAssignee.createMany({
      data: assigneeIds.map((contributorId) => ({ issueId: issue.id, contributorId })),
      skipDuplicates: true,
    })
  }
}

export async function runIssuesSync(data: SyncJobData): Promise<void> {
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

      const { items, hasNextPage } = await listRepoIssues(
        repo.owner,
        repo.name,
        repo.installation.githubInstallationId,
        { page, since, state: 'all' },
      )
      pagesProcessed += 1
      hasMorePages = hasNextPage

      for (const issue of items) {
        await upsertIssue(repo.id, issue)
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
