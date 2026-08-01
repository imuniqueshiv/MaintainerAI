import { MembershipRole, OrganizationType, type Organization } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { writeAuditLog } from '@/server/services/audit-service'
import { allocateSyntheticGithubId } from '@/server/utils/tokens'

export { allocateSyntheticGithubId } from '@/server/utils/tokens'

export function serializeOrganization(org: Organization) {
  return {
    ...org,
    githubId: org.githubId.toString(),
  }
}

/**
 * Ensure the user has a personal organization (type=user) with admin membership.
 * Called on Auth.js createUser / signIn events.
 */
export async function ensurePersonalOrganization(userId: string): Promise<Organization> {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw AppError.notFound('User not found')

  const existing = await prisma.organization.findFirst({
    where: {
      type: OrganizationType.user,
      ownerUserId: userId,
    },
  })
  if (existing) {
    await prisma.membership.upsert({
      where: {
        userId_organizationId: { userId, organizationId: existing.id },
      },
      create: {
        userId,
        organizationId: existing.id,
        role: MembershipRole.admin,
      },
      update: {},
    })
    return existing
  }

  // Prefer matching by GitHub user id (personal org mirrors GitHub user account).
  const byGithub = await prisma.organization.findUnique({
    where: { githubId: user.githubId },
  })
  if (byGithub) {
    if (!byGithub.ownerUserId) {
      await prisma.organization.update({
        where: { id: byGithub.id },
        data: { ownerUserId: userId },
      })
    }
    await prisma.membership.upsert({
      where: {
        userId_organizationId: { userId, organizationId: byGithub.id },
      },
      create: {
        userId,
        organizationId: byGithub.id,
        role: MembershipRole.admin,
      },
      update: {},
    })
    return byGithub
  }

  return prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        githubId: user.githubId,
        login: user.login,
        name: user.name ?? user.login,
        type: OrganizationType.user,
        avatarUrl: user.avatarUrl,
        ownerUserId: userId,
      },
    })
    await tx.membership.create({
      data: {
        userId,
        organizationId: org.id,
        role: MembershipRole.admin,
      },
    })
    return org
  })
}

export async function listUserOrganizations(userId: string) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: 'asc' },
  })

  return memberships.map((m) => ({
    role: m.role,
    joinedAt: m.createdAt,
    organization: serializeOrganization(m.organization),
  }))
}

export async function getOrganizationForUser(userId: string, organizationId: string) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
    include: { organization: true },
  })
  if (!membership) throw AppError.forbidden('You are not a member of this organization')

  return {
    role: membership.role,
    organization: serializeOrganization(membership.organization),
  }
}

export async function createOrganization(
  userId: string,
  input: { name: string; login: string; avatarUrl?: string },
) {
  const login = input.login.toLowerCase()

  try {
    const org = await prisma.$transaction(async (tx) => {
      const created = await tx.organization.create({
        data: {
          githubId: allocateSyntheticGithubId(),
          login,
          name: input.name,
          type: OrganizationType.organization,
          avatarUrl: input.avatarUrl,
          ownerUserId: userId,
        },
      })
      await tx.membership.create({
        data: {
          userId,
          organizationId: created.id,
          role: MembershipRole.admin,
        },
      })
      return created
    })

    await writeAuditLog({
      action: 'org.create',
      targetType: 'organization',
      targetId: org.id,
      organizationId: org.id,
      actorUserId: userId,
      metadata: { login },
    })

    return serializeOrganization(org)
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      throw AppError.conflict('Organization login already exists')
    }
    throw error
  }
}

export async function updateOrganization(
  actorUserId: string,
  organizationId: string,
  input: { name?: string; login?: string; avatarUrl?: string | null },
) {
  try {
    const org = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        name: input.name,
        login: input.login?.toLowerCase(),
        avatarUrl: input.avatarUrl === undefined ? undefined : input.avatarUrl,
      },
    })

    await writeAuditLog({
      action: 'org.update',
      targetType: 'organization',
      targetId: organizationId,
      organizationId,
      actorUserId,
      metadata: { fields: Object.keys(input) },
    })

    return serializeOrganization(org)
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      throw AppError.conflict('Organization login already exists')
    }
    throw error
  }
}

export async function deleteOrganization(actorUserId: string, organizationId: string) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) throw AppError.notFound('Organization not found')

  if (org.type === OrganizationType.user) {
    throw AppError.badRequest('Personal organizations cannot be deleted')
  }

  await prisma.organization.delete({ where: { id: organizationId } })
  await writeAuditLog({
    action: 'org.delete',
    targetType: 'organization',
    targetId: organizationId,
    actorUserId,
    metadata: { login: org.login },
  })
}

export async function transferOrganizationOwnership(
  actorUserId: string,
  organizationId: string,
  newOwnerUserId: string,
) {
  if (actorUserId === newOwnerUserId) {
    throw AppError.badRequest('You already own this organization')
  }

  const orgRow = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!orgRow) throw AppError.notFound('Organization not found')
  if (orgRow.ownerUserId !== actorUserId) {
    throw AppError.forbidden('Only the organization owner can transfer ownership')
  }

  const newOwnerMembership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: { userId: newOwnerUserId, organizationId },
    },
  })
  if (!newOwnerMembership) {
    throw AppError.badRequest('New owner must be an organization member')
  }

  const org = await prisma.$transaction(async (tx) => {
    await tx.membership.update({
      where: {
        userId_organizationId: { userId: newOwnerUserId, organizationId },
      },
      data: { role: MembershipRole.admin },
    })
    return tx.organization.update({
      where: { id: organizationId },
      data: { ownerUserId: newOwnerUserId },
    })
  })

  await writeAuditLog({
    action: 'org.ownership.transfer',
    targetType: 'organization',
    targetId: organizationId,
    organizationId,
    actorUserId,
    metadata: { newOwnerUserId },
  })

  return serializeOrganization(org)
}

export async function leaveOrganization(userId: string, organizationId: string) {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } })
  if (!org) throw AppError.notFound('Organization not found')

  if (org.ownerUserId === userId) {
    throw AppError.badRequest('Transfer ownership before leaving as owner')
  }

  if (org.type === OrganizationType.user && org.ownerUserId === userId) {
    throw AppError.badRequest('Cannot leave personal organization')
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
  })
  if (!membership) throw AppError.notFound('Membership not found')

  if (membership.role === MembershipRole.admin) {
    const adminCount = await prisma.membership.count({
      where: { organizationId, role: MembershipRole.admin },
    })
    if (adminCount <= 1) {
      throw AppError.badRequest('Cannot leave as the last admin')
    }
  }

  await prisma.membership.delete({
    where: { userId_organizationId: { userId, organizationId } },
  })

  await writeAuditLog({
    action: 'org.member.leave',
    targetType: 'membership',
    targetId: `${userId}:${organizationId}`,
    organizationId,
    actorUserId: userId,
  })
}

export async function getOrgDashboardStats(organizationId: string) {
  const [memberCount, invitationCount, repositoryCount] = await Promise.all([
    prisma.membership.count({ where: { organizationId } }),
    prisma.invitation.count({
      where: { organizationId, status: 'pending' },
    }),
    prisma.repository.count({ where: { organizationId } }),
  ])

  return {
    members: memberCount,
    pendingInvitations: invitationCount,
    repositories: repositoryCount,
    // Phase 3+ will fill real aggregates; keep stable shape for UI.
    teams: 0,
  }
}
