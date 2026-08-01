import type { Prisma, Repository } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { writeAuditLog } from '@/server/services/audit-service'
import {
  fetchRepository,
  listInstallationRepositories,
  type GitHubRepoMetadata,
} from '@/server/github'

export function serializeRepository(repo: Repository) {
  return {
    ...repo,
    githubId: repo.githubId.toString(),
    id: repo.id,
  }
}

/** Dashboard-friendly shape compatible with previous mock consumers. */
export function toDashboardRepository(repo: Repository) {
  return {
    id: repo.id,
    githubId: repo.githubId.toString(),
    name: repo.name,
    owner: repo.owner,
    fullName: repo.fullName,
    description: repo.description,
    stars: repo.stars,
    forks: repo.forks,
    openIssues: repo.openIssues,
    openPRs: repo.openPRs,
    url: repo.url,
    language: repo.language,
    defaultBranch: repo.defaultBranch,
    lastUpdated: repo.lastUpdatedGitHub ?? repo.updatedAt,
    healthScore: repo.healthScore ?? 0,
    automationEnabled: repo.automationEnabled,
    automationIssuesResolved: repo.automationIssuesResolved,
    automationPRsMerged: repo.automationPRsMerged,
    collaborators: repo.collaborators,
    topics: repo.topics,
    isPrivate: repo.isPrivate,
    archived: repo.archived,
    disabled: repo.disabled,
    connectedAt: repo.connectedAt,
    installationId: repo.installationId,
    organizationId: repo.organizationId,
  }
}

export async function upsertRepositoryMetadata(input: {
  installationId: string
  organizationId: string
  meta: GitHubRepoMetadata
  connect?: boolean
}) {
  const now = new Date()
  const data = {
    installationId: input.installationId,
    organizationId: input.organizationId,
    nodeId: input.meta.nodeId,
    name: input.meta.name,
    owner: input.meta.owner,
    fullName: input.meta.fullName,
    description: input.meta.description,
    url: input.meta.url,
    language: input.meta.language,
    defaultBranch: input.meta.defaultBranch,
    isPrivate: input.meta.isPrivate,
    archived: input.meta.archived,
    disabled: input.meta.disabled,
    stars: input.meta.stars,
    forks: input.meta.forks,
    openIssues: input.meta.openIssues,
    topics: input.meta.topics,
    permissions: (input.meta.permissions ?? undefined) as Prisma.InputJsonValue | undefined,
    lastUpdatedGitHub: input.meta.lastUpdatedGitHub,
    deletedAt: null as Date | null,
    connectedAt: input.connect === false ? undefined : now,
  }

  return prisma.repository.upsert({
    where: { githubId: input.meta.githubId },
    create: {
      githubId: input.meta.githubId,
      ...data,
      connectedAt: now,
    },
    update: {
      ...data,
      connectedAt: input.connect === false ? undefined : now,
    },
  })
}

export async function listConnectedRepositories(organizationId?: string) {
  const repos = await prisma.repository.findMany({
    where: {
      deletedAt: null,
      ...(organizationId ? { organizationId } : {}),
    },
    orderBy: { fullName: 'asc' },
  })
  return repos.map(toDashboardRepository)
}

export async function listConnectedRepositoriesForUser(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { organizationId: true },
  })
  const orgIds = memberships.map((m) => m.organizationId)
  if (orgIds.length === 0) return []

  const repos = await prisma.repository.findMany({
    where: { deletedAt: null, organizationId: { in: orgIds } },
    orderBy: { fullName: 'asc' },
  })
  return repos.map(toDashboardRepository)
}

export async function discoverInstallationRepositories(installationId: string) {
  const installation = await prisma.installation.findUnique({ where: { id: installationId } })
  if (!installation) throw AppError.notFound('Installation not found')

  const remote = await listInstallationRepositories(installation.githubInstallationId)
  const connected = await prisma.repository.findMany({
    where: { installationId, deletedAt: null },
    select: { githubId: true, id: true },
  })
  const connectedIds = new Set(connected.map((c) => c.githubId.toString()))

  return remote.map((meta) => ({
    ...meta,
    githubId: meta.githubId.toString(),
    connected: connectedIds.has(meta.githubId.toString()),
  }))
}

export async function connectRepositories(input: {
  installationId: string
  githubIds: string[]
  actorUserId: string
  /** When true, soft-disconnect connected repos not in githubIds. */
  replace?: boolean
}) {
  const installation = await prisma.installation.findUnique({
    where: { id: input.installationId },
  })
  if (!installation) throw AppError.notFound('Installation not found')

  const remote = await listInstallationRepositories(installation.githubInstallationId)
  const wanted = new Set(input.githubIds)
  const selected = remote.filter((r) => wanted.has(r.githubId.toString()))
  if (selected.length === 0) {
    throw AppError.badRequest('No matching repositories found for this installation')
  }

  const results = []
  for (const meta of selected) {
    const repo = await upsertRepositoryMetadata({
      installationId: installation.id,
      organizationId: installation.organizationId,
      meta,
      connect: true,
    })
    results.push(toDashboardRepository(repo))
  }

  if (input.replace) {
    const connected = await prisma.repository.findMany({
      where: { installationId: installation.id, deletedAt: null },
      select: { id: true, githubId: true },
    })
    const disconnectIds = connected
      .filter((r) => !wanted.has(r.githubId.toString()))
      .map((r) => r.id)
    if (disconnectIds.length > 0) {
      await prisma.repository.updateMany({
        where: { id: { in: disconnectIds } },
        data: { deletedAt: new Date() },
      })
    }
  }

  await writeAuditLog({
    action: 'repository.connect',
    targetType: 'installation',
    targetId: installation.id,
    organizationId: installation.organizationId,
    actorUserId: input.actorUserId,
    metadata: {
      count: results.length,
      githubIds: input.githubIds,
      replace: Boolean(input.replace),
    },
  })

  return results
}

export async function disconnectRepository(input: {
  repositoryId: string
  organizationId: string
  actorUserId: string
}) {
  const repo = await prisma.repository.findFirst({
    where: { id: input.repositoryId, organizationId: input.organizationId, deletedAt: null },
  })
  if (!repo) throw AppError.notFound('Repository not found')

  const updated = await prisma.repository.update({
    where: { id: repo.id },
    data: { deletedAt: new Date() },
  })

  await writeAuditLog({
    action: 'repository.disconnect',
    targetType: 'repository',
    targetId: repo.id,
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
    metadata: { fullName: repo.fullName },
  })

  return serializeRepository(updated)
}

export async function refreshRepositoryMetadata(input: {
  repositoryId: string
  organizationId: string
  actorUserId: string
}) {
  const repo = await prisma.repository.findFirst({
    where: { id: input.repositoryId, organizationId: input.organizationId, deletedAt: null },
    include: { installation: true },
  })
  if (!repo) throw AppError.notFound('Repository not found')

  const meta = await fetchRepository(
    repo.installation.githubInstallationId,
    repo.owner,
    repo.name,
  )
  const updated = await upsertRepositoryMetadata({
    installationId: repo.installationId,
    organizationId: repo.organizationId,
    meta,
    connect: true,
  })

  await writeAuditLog({
    action: 'repository.refresh',
    targetType: 'repository',
    targetId: repo.id,
    organizationId: input.organizationId,
    actorUserId: input.actorUserId,
  })

  return toDashboardRepository(updated)
}
