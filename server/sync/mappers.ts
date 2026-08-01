import { IssueState, PullRequestState, type Prisma } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import type { GitHubIssueDTO, GitHubLabelDTO, GitHubPullDTO, GitHubUserDTO } from '@/server/github'

/** GitHub issues only expose open/closed — richer states are set by product workflows, not sync. */
export function mapIssueState(issue: Pick<GitHubIssueDTO, 'state'>): IssueState {
  return issue.state === 'closed' ? IssueState.closed : IssueState.open
}

/** Map GitHub PR fields to the product PullRequestState enum. */
export function mapPullState(pr: Pick<GitHubPullDTO, 'state' | 'draft' | 'merged'>): PullRequestState {
  if (pr.merged) return PullRequestState.merged
  if (pr.state === 'closed') return PullRequestState.closed
  if (pr.draft) return PullRequestState.draft
  return PullRequestState.open
}

/**
 * Upsert a Contributor row from a GitHub user reference. Returns the local
 * contributor id, or null when no user is present (e.g. deleted accounts).
 */
export async function upsertContributorFromGitHubUser(
  user: GitHubUserDTO | null,
): Promise<string | null> {
  if (!user) return null
  const contributor = await prisma.contributor.upsert({
    where: { githubId: BigInt(user.githubId) },
    create: {
      githubId: BigInt(user.githubId),
      login: user.login,
      avatarUrl: user.avatarUrl,
      isBotAccount: user.isBot,
      lastActive: new Date(),
    },
    update: {
      login: user.login,
      avatarUrl: user.avatarUrl,
      isBotAccount: user.isBot,
      lastActive: new Date(),
    },
  })
  return contributor.id
}

/**
 * Find-or-create a Label by (repositoryId, name), backfilling `githubId` when known.
 * Idempotent — safe to call concurrently from issues/labels syncers.
 */
export async function upsertLabelByName(
  repositoryId: string,
  label: GitHubLabelDTO,
): Promise<string> {
  const existing = await prisma.label.findUnique({
    where: { repositoryId_name: { repositoryId, name: label.name } },
  })
  if (existing) {
    if (existing.color !== label.color || existing.description !== label.description || (label.githubId && !existing.githubId)) {
      await prisma.label.update({
        where: { id: existing.id },
        data: {
          color: label.color,
          description: label.description,
          githubId: label.githubId !== null ? BigInt(label.githubId) : existing.githubId,
        },
      })
    }
    return existing.id
  }

  const created = await prisma.label.create({
    data: {
      repositoryId,
      name: label.name,
      color: label.color,
      description: label.description,
      githubId: label.githubId !== null ? BigInt(label.githubId) : null,
    },
  })
  return created.id
}

export function issueCreateData(
  repositoryId: string,
  dto: GitHubIssueDTO,
  authorContributorId: string | null,
  milestoneId: string | null,
): Prisma.IssueUncheckedCreateInput {
  return {
    githubId: BigInt(dto.githubId),
    nodeId: dto.nodeId,
    repositoryId,
    number: dto.number,
    title: dto.title,
    description: dto.body,
    htmlUrl: dto.htmlUrl,
    state: mapIssueState(dto),
    locked: dto.locked,
    commentsCount: dto.commentsCount,
    authorContributorId,
    milestoneId,
    closedAt: dto.closedAt,
    githubCreatedAt: dto.githubCreatedAt,
    githubUpdatedAt: dto.githubUpdatedAt,
  }
}

export function issueUpdateData(
  dto: GitHubIssueDTO,
  authorContributorId: string | null,
  milestoneId: string | null,
): Prisma.IssueUncheckedUpdateInput {
  return {
    nodeId: dto.nodeId,
    title: dto.title,
    description: dto.body,
    htmlUrl: dto.htmlUrl,
    state: mapIssueState(dto),
    locked: dto.locked,
    commentsCount: dto.commentsCount,
    authorContributorId,
    milestoneId,
    closedAt: dto.closedAt,
    githubCreatedAt: dto.githubCreatedAt,
    githubUpdatedAt: dto.githubUpdatedAt,
  }
}

export function pullCreateData(
  repositoryId: string,
  dto: GitHubPullDTO,
  authorContributorId: string | null,
): Prisma.PullRequestUncheckedCreateInput {
  return {
    githubId: BigInt(dto.githubId),
    nodeId: dto.nodeId,
    repositoryId,
    number: dto.number,
    title: dto.title,
    description: dto.body,
    htmlUrl: dto.htmlUrl,
    state: mapPullState(dto),
    draft: dto.draft,
    merged: dto.merged,
    mergeCommitSha: dto.mergeCommitSha,
    baseRef: dto.baseRef,
    headRef: dto.headRef,
    authorContributorId,
    reviewRequests: dto.reviewRequests,
    mergedAt: dto.mergedAt,
    closedAt: dto.closedAt,
    githubCreatedAt: dto.githubCreatedAt,
    githubUpdatedAt: dto.githubUpdatedAt,
  }
}

export function pullUpdateData(
  dto: GitHubPullDTO,
  authorContributorId: string | null,
): Prisma.PullRequestUncheckedUpdateInput {
  return {
    nodeId: dto.nodeId,
    title: dto.title,
    description: dto.body,
    htmlUrl: dto.htmlUrl,
    state: mapPullState(dto),
    draft: dto.draft,
    merged: dto.merged,
    mergeCommitSha: dto.mergeCommitSha,
    baseRef: dto.baseRef,
    headRef: dto.headRef,
    authorContributorId,
    reviewRequests: dto.reviewRequests,
    mergedAt: dto.mergedAt,
    closedAt: dto.closedAt,
    githubCreatedAt: dto.githubCreatedAt,
    githubUpdatedAt: dto.githubUpdatedAt,
  }
}
