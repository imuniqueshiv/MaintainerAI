import {
  InstallationStatus,
  MembershipRole,
  OrganizationType,
  SyncStatus,
  type Installation,
  type Prisma,
} from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { getMembership } from '@/server/auth/guards'
import { assertPermission, type OrgMembershipContext } from '@/server/auth/rbac'
import type { Permission } from '@/server/auth/permissions'
import { writeAuditLog } from '@/server/services/audit-service'
import {
  fetchInstallation,
  listInstallationRepositories,
  fetchAppRateLimit,
  isGitHubAppReady,
  type GitHubRepoMetadata,
} from '@/server/github'
import { invalidateInstallationToken } from '@/server/github/tokens'
import { upsertRepositoryMetadata } from '@/server/services/repository-github-service'

export function serializeInstallation(installation: Installation) {
  return {
    ...installation,
    githubInstallationId: installation.githubInstallationId.toString(),
  }
}

async function resolveOrganizationForAccount(input: {
  accountLogin: string
  accountType: string
  accountGithubId: bigint
  actorUserId: string
}) {
  if (input.accountType.toLowerCase() === 'user') {
    const user = await prisma.user.findUnique({ where: { id: input.actorUserId } })
    if (!user) throw AppError.notFound('User not found')

    // Personal installs always bind to the actor's personal org (by owner or githubId).
    let org = await prisma.organization.findFirst({
      where: { type: OrganizationType.user, ownerUserId: input.actorUserId },
    })
    if (!org) {
      org = await prisma.organization.findUnique({ where: { githubId: user.githubId } })
    }
    if (!org) {
      org = await prisma.organization.create({
        data: {
          githubId: user.githubId,
          login: user.login,
          name: user.name ?? user.login,
          type: OrganizationType.user,
          avatarUrl: user.avatarUrl,
          ownerUserId: input.actorUserId,
        },
      })
      await prisma.membership.create({
        data: {
          userId: input.actorUserId,
          organizationId: org.id,
          role: MembershipRole.admin,
        },
      })
    }
    return org
  }

  // Organization installs: resolve ONLY by GitHub account id. Never rewrite a
  // synthetic/manual org that happens to share the same login slug.
  let org = await prisma.organization.findUnique({
    where: { githubId: input.accountGithubId },
  })

  if (!org) {
    const loginCollision = await prisma.organization.findUnique({
      where: { login: input.accountLogin.toLowerCase() },
    })
    if (loginCollision) {
      // Refuse to mutate synthetic (negative githubId) or mismatched orgs.
      throw AppError.conflict(
        `Organization login "${input.accountLogin}" is already used by another MaintainerAI organization. Rename that org or use a different GitHub account.`,
        {
          organizationId: loginCollision.id,
          githubId: loginCollision.githubId.toString(),
        },
      )
    }
    org = await prisma.organization.create({
      data: {
        githubId: input.accountGithubId,
        login: input.accountLogin.toLowerCase(),
        name: input.accountLogin,
        type: OrganizationType.organization,
        ownerUserId: input.actorUserId,
      },
    })
  }

  const existingMembership = await getMembership(input.actorUserId, org.id)
  if (!existingMembership) {
    // First successful installer for this GitHub org becomes admin; later
    // members must be invited (do not auto-admin on every reinstall).
    const memberCount = await prisma.membership.count({ where: { organizationId: org.id } })
    await prisma.membership.create({
      data: {
        userId: input.actorUserId,
        organizationId: org.id,
        role: memberCount === 0 ? MembershipRole.admin : MembershipRole.maintainer,
      },
    })
  }

  return org
}

/**
 * Persist a GitHub App installation after callback or webhook.
 */
export async function upsertInstallationFromGitHub(input: {
  githubInstallationId: number | bigint
  actorUserId: string
  seedRepositories?: boolean
}) {
  const gh = await fetchInstallation(input.githubInstallationId)
  const account = gh.data.account
  if (!account || !('login' in account)) {
    throw AppError.badRequest('GitHub installation has no account')
  }

  const accountLogin = account.login
  const accountType = 'type' in account && account.type ? String(account.type) : 'Organization'
  const accountGithubId = BigInt(account.id)

  const existing = await prisma.installation.findUnique({
    where: { githubInstallationId: BigInt(input.githubInstallationId) },
  })

  if (existing && existing.status !== InstallationStatus.deleted) {
    const membership = await getMembership(input.actorUserId, existing.organizationId)
    if (!membership) {
      throw AppError.forbidden(
        'This GitHub App installation is already linked to another organization',
      )
    }
  }

  const organization =
    existing && existing.status !== InstallationStatus.deleted
      ? await prisma.organization.findUniqueOrThrow({ where: { id: existing.organizationId } })
      : await resolveOrganizationForAccount({
          accountLogin,
          accountType,
          accountGithubId,
          actorUserId: input.actorUserId,
        })

  const permissions = (gh.data.permissions ?? {}) as Prisma.InputJsonValue
  const webhookEvents = Array.isArray(gh.data.events) ? gh.data.events.map(String) : []

  const installation = await prisma.installation.upsert({
    where: { githubInstallationId: BigInt(input.githubInstallationId) },
    create: {
      githubInstallationId: BigInt(input.githubInstallationId),
      organizationId: organization.id,
      status: InstallationStatus.active,
      permissions,
      webhookEvents,
      accountLogin,
      accountType,
      syncStatus: SyncStatus.idle,
    },
    update: {
      // Never reassign organizationId on active installs (prevents hijack).
      organizationId:
        existing?.status === InstallationStatus.deleted ? organization.id : undefined,
      status: InstallationStatus.active,
      permissions,
      webhookEvents,
      accountLogin,
      accountType,
      suspendedAt: null,
    },
  })

  await writeAuditLog({
    action: 'installation.upsert',
    targetType: 'installation',
    targetId: installation.id,
    organizationId: organization.id,
    actorUserId: input.actorUserId,
    metadata: {
      githubInstallationId: String(input.githubInstallationId),
      accountLogin,
      accountType,
    },
  })

  let repositories: Awaited<ReturnType<typeof upsertRepositoryMetadata>>[] = []
  if (input.seedRepositories !== false) {
    const remote = await listInstallationRepositories(input.githubInstallationId)
    repositories = []
    for (const meta of remote) {
      repositories.push(
        await upsertRepositoryMetadata({
          installationId: installation.id,
          organizationId: organization.id,
          meta,
          connect: true,
        }),
      )
    }
    await prisma.installation.update({
      where: { id: installation.id },
      data: { lastSyncAt: new Date(), syncStatus: SyncStatus.completed },
    })
  }

  return {
    installation: serializeInstallation(installation),
    organization,
    repositories,
  }
}

export async function listInstallationsForUser(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    select: { organizationId: true },
  })
  const orgIds = memberships.map((m) => m.organizationId)
  if (orgIds.length === 0) return []

  const rows = await prisma.installation.findMany({
    where: {
      organizationId: { in: orgIds },
      status: { not: InstallationStatus.deleted },
    },
    include: {
      organization: true,
      _count: {
        select: {
          repositories: { where: { deletedAt: null } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return rows.map((row) => ({
    ...serializeInstallation(row),
    organization: {
      ...row.organization,
      githubId: row.organization.githubId.toString(),
    },
    connectedRepositoryCount: row._count.repositories,
  }))
}

export async function getInstallationForOrg(installationId: string, organizationId: string) {
  const installation = await prisma.installation.findFirst({
    where: { id: installationId, organizationId },
    include: {
      organization: true,
      _count: { select: { repositories: { where: { deletedAt: null } } } },
    },
  })
  if (!installation) throw AppError.notFound('Installation not found')
  return {
    ...serializeInstallation(installation),
    organization: {
      ...installation.organization,
      githubId: installation.organization.githubId.toString(),
    },
    connectedRepositoryCount: installation._count.repositories,
  }
}

/**
 * Load installation and assert the user is an org member with optional permission.
 */
export async function requireInstallationAccess(
  installationId: string,
  userId: string,
  permission?: Permission,
) {
  const installation = await prisma.installation.findFirst({
    where: {
      id: installationId,
      status: { not: InstallationStatus.deleted },
    },
    include: {
      organization: true,
      _count: { select: { repositories: { where: { deletedAt: null } } } },
    },
  })
  if (!installation) throw AppError.notFound('Installation not found')

  const membershipRow = await getMembership(userId, installation.organizationId)
  if (!membershipRow) {
    throw AppError.forbidden('You are not a member of this installation organization')
  }

  const membership: OrgMembershipContext = {
    userId: membershipRow.userId,
    organizationId: membershipRow.organizationId,
    role: membershipRow.role,
  }
  if (permission) assertPermission(membership, permission)

  return {
    installation,
    membership,
    organization: installation.organization,
    connectedRepositoryCount: installation._count.repositories,
  }
}

export async function disconnectInstallation(installationId: string, actorUserId: string) {
  const { installation } = await requireInstallationAccess(
    installationId,
    actorUserId,
    'github:manage',
  )
  return markInstallationDeleted(installation.githubInstallationId, actorUserId)
}

export async function refreshInstallationMetadata(
  installationId: string,
  actorUserId: string,
) {
  const installation = await prisma.installation.findUnique({ where: { id: installationId } })
  if (!installation) throw AppError.notFound('Installation not found')

  await prisma.installation.update({
    where: { id: installationId },
    data: { syncStatus: SyncStatus.syncing },
  })

  try {
    const result = await upsertInstallationFromGitHub({
      githubInstallationId: installation.githubInstallationId,
      actorUserId,
      seedRepositories: true,
    })

    try {
      const rate = await fetchAppRateLimit(installation.githubInstallationId)
      await prisma.installation.update({
        where: { id: installationId },
        data: {
          rateLimitRemaining: rate.rate.remaining,
          rateLimitLimit: rate.rate.limit,
        },
      })
    } catch {
      /* non-fatal */
    }

    return result
  } catch (error) {
    await prisma.installation.update({
      where: { id: installationId },
      data: { syncStatus: SyncStatus.failed },
    })
    throw error
  }
}

export async function markInstallationDeleted(
  githubInstallationId: number | bigint,
  actorUserId?: string,
) {
  const installation = await prisma.installation.findUnique({
    where: { githubInstallationId: BigInt(githubInstallationId) },
  })
  if (!installation) return null

  await prisma.$transaction([
    prisma.installation.update({
      where: { id: installation.id },
      data: { status: InstallationStatus.deleted },
    }),
    prisma.repository.updateMany({
      where: { installationId: installation.id, deletedAt: null },
      data: { deletedAt: new Date() },
    }),
  ])

  await invalidateInstallationToken(githubInstallationId)
  await writeAuditLog({
    action: 'installation.delete',
    targetType: 'installation',
    targetId: installation.id,
    organizationId: installation.organizationId,
    actorUserId,
    metadata: { githubInstallationId: String(githubInstallationId) },
  })

  return installation
}

export async function getAppSummaryForUser(userId: string) {
  const configured = isGitHubAppReady()
  const installations = configured ? await listInstallationsForUser(userId) : []
  const active = installations.filter((i) => i.status === InstallationStatus.active)
  const primary = active[0]

  const permissions =
    primary && primary.permissions && typeof primary.permissions === 'object'
      ? Object.entries(primary.permissions as Record<string, string>).map(([name, access]) => ({
          name,
          access: String(access),
        }))
      : []

  return {
    name: 'MaintainerAI',
    configured,
    status: primary?.status ?? (configured ? 'inactive' : 'unconfigured'),
    installationId: primary?.id ?? null,
    githubInstallationId: primary?.githubInstallationId ?? null,
    accountLogin: primary?.accountLogin ?? null,
    accountType: primary?.accountType ?? null,
    installationCount: active.length,
    installedRepositories: active.reduce((sum, i) => sum + i.connectedRepositoryCount, 0),
    permissions,
    webhookEvents: primary?.webhookEvents ?? [],
    webhookStatus: configured ? 'active' : 'unconfigured',
    rateLimit: {
      remaining: primary?.rateLimitRemaining ?? null,
      limit: primary?.rateLimitLimit ?? null,
    },
    lastSync: primary?.lastSyncAt ?? null,
    syncStatus: primary?.syncStatus ?? null,
    primary: primary ?? null,
    installations: active,
  }
}

export type { GitHubRepoMetadata }
