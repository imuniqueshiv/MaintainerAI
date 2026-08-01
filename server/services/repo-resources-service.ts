import { IssueState, PullRequestState, type Prisma } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'

export type ResourceListQuery = {
  page: number
  limit: number
  state?: string
  q?: string
}

function paginationSkip(query: ResourceListQuery): number {
  return (query.page - 1) * query.limit
}

function contributorSummary(
  contributor: { id: string; login: string; avatarUrl: string | null; isBotAccount: boolean } | null,
) {
  if (!contributor) return null
  return {
    id: contributor.id,
    login: contributor.login,
    avatarUrl: contributor.avatarUrl,
    isBot: contributor.isBotAccount,
  }
}

export async function listRepoIssues(repositoryId: string, query: ResourceListQuery) {
  const where: Prisma.IssueWhereInput = {
    repositoryId,
    ...(query.state ? { state: query.state as IssueState } : {}),
    ...(query.q
      ? { title: { contains: query.q, mode: 'insensitive' as const } }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      include: {
        author: true,
        milestone: true,
        labels: { include: { label: true } },
        assignees: { include: { contributor: true } },
      },
      orderBy: { githubUpdatedAt: 'desc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.issue.count({ where }),
  ])

  return {
    items: items.map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      description: issue.description,
      htmlUrl: issue.htmlUrl,
      state: issue.state,
      priority: issue.priority,
      locked: issue.locked,
      commentsCount: issue.commentsCount,
      author: contributorSummary(issue.author),
      assignees: issue.assignees.map((a) => contributorSummary(a.contributor)),
      labels: issue.labels.map((l) => ({ id: l.label.id, name: l.label.name, color: l.label.color })),
      milestone: issue.milestone ? { id: issue.milestone.id, title: issue.milestone.title } : null,
      closedAt: issue.closedAt,
      createdAt: issue.githubCreatedAt ?? issue.createdAt,
      updatedAt: issue.githubUpdatedAt ?? issue.updatedAt,
    })),
    total,
  }
}

export async function listRepoPulls(repositoryId: string, query: ResourceListQuery) {
  const where: Prisma.PullRequestWhereInput = {
    repositoryId,
    ...(query.state ? { state: query.state as PullRequestState } : {}),
    ...(query.q
      ? { title: { contains: query.q, mode: 'insensitive' as const } }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.pullRequest.findMany({
      where,
      include: { author: true },
      orderBy: { githubUpdatedAt: 'desc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.pullRequest.count({ where }),
  ])

  return {
    items: items.map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      description: pr.description,
      htmlUrl: pr.htmlUrl,
      state: pr.state,
      draft: pr.draft,
      merged: pr.merged,
      baseRef: pr.baseRef,
      headRef: pr.headRef,
      author: contributorSummary(pr.author),
      commentsCount: pr.commentsCount,
      reviewRequests: pr.reviewRequests,
      ciStatus: pr.ciStatus,
      mergedAt: pr.mergedAt,
      closedAt: pr.closedAt,
      createdAt: pr.githubCreatedAt ?? pr.createdAt,
      updatedAt: pr.githubUpdatedAt ?? pr.updatedAt,
    })),
    total,
  }
}

export async function listRepoContributors(repositoryId: string, query: ResourceListQuery) {
  const [items, total] = await Promise.all([
    prisma.repoContributor.findMany({
      where: { repositoryId },
      include: { contributor: true },
      orderBy: { contributions: 'desc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.repoContributor.count({ where: { repositoryId } }),
  ])

  return {
    items: items.map((rc) => ({
      id: rc.contributor.id,
      login: rc.contributor.login,
      name: rc.contributor.name,
      avatarUrl: rc.contributor.avatarUrl,
      isBot: rc.contributor.isBotAccount,
      contributions: rc.contributions,
      issuesOpened: rc.issuesOpened,
      issuesClosed: rc.issuesClosed,
      prOpened: rc.prOpened,
      prMerged: rc.prMerged,
      isMaintainer: rc.isMaintainer,
    })),
    total,
  }
}

export async function listRepoLabels(repositoryId: string, query: ResourceListQuery) {
  const where: Prisma.LabelWhereInput = {
    repositoryId,
    ...(query.q ? { name: { contains: query.q, mode: 'insensitive' as const } } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.label.findMany({
      where,
      orderBy: { name: 'asc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.label.count({ where }),
  ])
  return {
    items: items.map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
      description: l.description,
    })),
    total,
  }
}

export async function listRepoMilestones(repositoryId: string, query: ResourceListQuery) {
  const where: Prisma.MilestoneWhereInput = {
    repositoryId,
    ...(query.state ? { state: query.state } : {}),
  }
  const [items, total] = await Promise.all([
    prisma.milestone.findMany({
      where,
      orderBy: { number: 'desc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.milestone.count({ where }),
  ])
  return {
    items: items.map((m) => ({
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      state: m.state,
      dueOn: m.dueOn,
      closedAt: m.closedAt,
      htmlUrl: m.htmlUrl,
      openIssues: m.openIssues,
      closedIssues: m.closedIssues,
    })),
    total,
  }
}

export async function listRepoReleases(repositoryId: string, query: ResourceListQuery) {
  const [items, total] = await Promise.all([
    prisma.release.findMany({
      where: { repositoryId },
      orderBy: { publishedAt: 'desc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.release.count({ where: { repositoryId } }),
  ])
  return {
    items: items.map((r) => ({
      id: r.id,
      tagName: r.tagName,
      name: r.name,
      body: r.body,
      draft: r.draft,
      prerelease: r.prerelease,
      htmlUrl: r.htmlUrl,
      publishedAt: r.publishedAt,
    })),
    total,
  }
}

export async function listRepoBranches(repositoryId: string, query: ResourceListQuery) {
  const [items, total] = await Promise.all([
    prisma.branch.findMany({
      where: { repositoryId },
      orderBy: { name: 'asc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.branch.count({ where: { repositoryId } }),
  ])
  return {
    items: items.map((b) => ({
      id: b.id,
      name: b.name,
      sha: b.sha,
      protected: b.protected,
    })),
    total,
  }
}

export async function loadRepositoryForOrgAccess(repositoryId: string) {
  const repo = await prisma.repository.findFirst({ where: { id: repositoryId, deletedAt: null } })
  if (!repo) throw AppError.notFound('Repository not found')
  return repo
}

async function orgIdsForUser(userId: string): Promise<string[]> {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { organizationId: true },
  })
  return memberships.map((m) => m.organizationId)
}

/** Cross-repo issues for dashboard (user's org memberships). */
export async function listUserIssues(userId: string, query: ResourceListQuery) {
  const orgIds = await orgIdsForUser(userId)
  if (orgIds.length === 0) return { items: [], total: 0 }

  const where: Prisma.IssueWhereInput = {
    repository: { organizationId: { in: orgIds }, deletedAt: null },
    ...(query.state ? { state: query.state as IssueState } : {}),
    ...(query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.issue.findMany({
      where,
      include: {
        author: true,
        repository: { select: { id: true, name: true, fullName: true } },
        labels: { include: { label: true } },
      },
      orderBy: { githubUpdatedAt: 'desc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.issue.count({ where }),
  ])

  return {
    items: items.map((issue) => ({
      id: issue.id,
      number: issue.number,
      title: issue.title,
      description: issue.description ?? '',
      repository: issue.repository.name,
      repositoryId: issue.repository.id,
      status: issue.state,
      priority: issue.priority ?? 'medium',
      labels: issue.labels.map((l) => l.label.name),
      author: issue.author?.login ?? 'unknown',
      createdAt: issue.githubCreatedAt ?? issue.createdAt,
      comments: issue.commentsCount,
      aiGenerated: issue.aiGenerated,
      htmlUrl: issue.htmlUrl,
    })),
    total,
  }
}

export async function listUserPulls(userId: string, query: ResourceListQuery) {
  const orgIds = await orgIdsForUser(userId)
  if (orgIds.length === 0) return { items: [], total: 0 }

  const where: Prisma.PullRequestWhereInput = {
    repository: { organizationId: { in: orgIds }, deletedAt: null },
    ...(query.state ? { state: query.state as PullRequestState } : {}),
    ...(query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.pullRequest.findMany({
      where,
      include: {
        author: true,
        repository: { select: { id: true, name: true } },
      },
      orderBy: { githubUpdatedAt: 'desc' },
      skip: paginationSkip(query),
      take: query.limit,
    }),
    prisma.pullRequest.count({ where }),
  ])

  return {
    items: items.map((pr) => ({
      id: pr.id,
      number: pr.number,
      title: pr.title,
      description: pr.description ?? '',
      repository: pr.repository.name,
      repositoryId: pr.repository.id,
      status: pr.state,
      author: pr.author?.login ?? 'unknown',
      createdAt: pr.githubCreatedAt ?? pr.createdAt,
      additions: pr.additions,
      deletions: pr.deletions,
      comments: pr.commentsCount,
      reviewRequests: pr.reviewRequests,
      aiReviewCompleted: pr.aiReviewCompleted,
      htmlUrl: pr.htmlUrl,
      draft: pr.draft,
      merged: pr.merged,
    })),
    total,
  }
}

export async function listUserContributors(userId: string, query: ResourceListQuery) {
  const orgIds = await orgIdsForUser(userId)
  if (orgIds.length === 0) return { items: [], total: 0 }

  const rows = await prisma.repoContributor.findMany({
    where: { repository: { organizationId: { in: orgIds }, deletedAt: null } },
    include: { contributor: true },
  })

  const byLogin = new Map<
    string,
    {
      id: string
      login: string
      name: string | null
      avatar: string | null
      contributions: number
      isMainMaintainer: boolean
      openPRCount: number
      issuesSolved: number
      joinedAt: Date | null
      lastActive: Date | null
    }
  >()

  for (const row of rows) {
    const key = row.contributor.login
    const existing = byLogin.get(key)
    if (!existing) {
      byLogin.set(key, {
        id: row.contributor.id,
        login: row.contributor.login,
        name: row.contributor.name,
        avatar: row.contributor.avatarUrl,
        contributions: row.contributions,
        isMainMaintainer: row.isMaintainer,
        openPRCount: row.prOpened,
        issuesSolved: row.issuesClosed,
        joinedAt: row.contributor.joinedAt,
        lastActive: row.contributor.lastActive,
      })
    } else {
      existing.contributions += row.contributions
      existing.openPRCount += row.prOpened
      existing.issuesSolved += row.issuesClosed
      existing.isMainMaintainer = existing.isMainMaintainer || row.isMaintainer
    }
  }

  let items = [...byLogin.values()].sort((a, b) => b.contributions - a.contributions)
  if (query.q) {
    const q = query.q.toLowerCase()
    items = items.filter(
      (c) => c.login.toLowerCase().includes(q) || (c.name ?? '').toLowerCase().includes(q),
    )
  }
  const total = items.length
  items = items.slice(paginationSkip(query), paginationSkip(query) + query.limit)
  return { items, total }
}

/** Recent issue/PR activity for dashboard timeline. */
export async function listUserActivity(userId: string, limit = 20) {
  const orgIds = await orgIdsForUser(userId)
  if (orgIds.length === 0) return []

  const [issues, pulls] = await Promise.all([
    prisma.issue.findMany({
      where: { repository: { organizationId: { in: orgIds }, deletedAt: null } },
      include: {
        author: true,
        repository: { select: { name: true } },
      },
      orderBy: { githubUpdatedAt: 'desc' },
      take: limit,
    }),
    prisma.pullRequest.findMany({
      where: { repository: { organizationId: { in: orgIds }, deletedAt: null } },
      include: {
        author: true,
        repository: { select: { name: true } },
      },
      orderBy: { githubUpdatedAt: 'desc' },
      take: limit,
    }),
  ])

  const activities = [
    ...issues.map((i) => ({
      id: i.id,
      type: 'issue' as const,
      title: i.title,
      action: i.state === 'closed' ? 'closed' : 'updated',
      timestamp: i.githubUpdatedAt ?? i.updatedAt,
      repository: i.repository.name,
      author: i.author?.login ?? 'unknown',
    })),
    ...pulls.map((p) => ({
      id: p.id,
      type: 'pr' as const,
      title: p.title,
      action: p.merged ? 'merged' : p.state === 'closed' ? 'closed' : 'updated',
      timestamp: p.githubUpdatedAt ?? p.updatedAt,
      repository: p.repository.name,
      author: p.author?.login ?? 'unknown',
    })),
  ]

  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}
