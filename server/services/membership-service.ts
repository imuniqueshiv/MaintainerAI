import { MembershipRole } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import {
  assertCanAssignRole,
  assertCanRemoveMember,
  type OrgMembershipContext,
} from '@/server/auth/rbac'
import { writeAuditLog } from '@/server/services/audit-service'

export async function listMembers(organizationId: string) {
  const rows = await prisma.membership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          login: true,
          name: true,
          email: true,
          avatarUrl: true,
          githubId: true,
        },
      },
    },
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map((row) => ({
    role: row.role,
    joinedAt: row.createdAt,
    user: {
      ...row.user,
      githubId: row.user.githubId.toString(),
    },
  }))
}

export async function updateMemberRole(
  actor: OrgMembershipContext,
  targetUserId: string,
  role: MembershipRole,
) {
  assertCanAssignRole(actor, role)

  if (actor.userId === targetUserId && role !== MembershipRole.admin) {
    const adminCount = await prisma.membership.count({
      where: { organizationId: actor.organizationId, role: MembershipRole.admin },
    })
    if (adminCount <= 1) {
      throw AppError.badRequest('Cannot demote the last admin')
    }
  }

  const target = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: targetUserId,
        organizationId: actor.organizationId,
      },
    },
  })
  if (!target) throw AppError.notFound('Member not found')

  if (target.role === MembershipRole.admin && role !== MembershipRole.admin) {
    const adminCount = await prisma.membership.count({
      where: { organizationId: actor.organizationId, role: MembershipRole.admin },
    })
    if (adminCount <= 1) {
      throw AppError.badRequest('Cannot demote the last admin')
    }
  }

  const updated = await prisma.membership.update({
    where: {
      userId_organizationId: {
        userId: targetUserId,
        organizationId: actor.organizationId,
      },
    },
    data: { role },
  })

  await writeAuditLog({
    action: 'org.member.role_update',
    targetType: 'membership',
    targetId: `${targetUserId}:${actor.organizationId}`,
    organizationId: actor.organizationId,
    actorUserId: actor.userId,
    metadata: { from: target.role, to: role },
  })

  return updated
}

export async function removeMember(actor: OrgMembershipContext, targetUserId: string) {
  const org = await prisma.organization.findUnique({
    where: { id: actor.organizationId },
  })
  if (!org) throw AppError.notFound('Organization not found')

  if (org.ownerUserId === targetUserId) {
    throw AppError.badRequest('Transfer ownership before removing the owner')
  }

  const target = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: targetUserId,
        organizationId: actor.organizationId,
      },
    },
  })
  if (!target) throw AppError.notFound('Member not found')

  assertCanRemoveMember(actor, target.role)

  if (target.role === MembershipRole.admin) {
    const adminCount = await prisma.membership.count({
      where: { organizationId: actor.organizationId, role: MembershipRole.admin },
    })
    if (adminCount <= 1) {
      throw AppError.badRequest('Cannot remove the last admin')
    }
  }

  await prisma.membership.delete({
    where: {
      userId_organizationId: {
        userId: targetUserId,
        organizationId: actor.organizationId,
      },
    },
  })

  await writeAuditLog({
    action: 'org.member.remove',
    targetType: 'membership',
    targetId: `${targetUserId}:${actor.organizationId}`,
    organizationId: actor.organizationId,
    actorUserId: actor.userId,
    metadata: { role: target.role },
  })
}
