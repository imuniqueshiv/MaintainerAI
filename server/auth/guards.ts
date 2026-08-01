import type { Membership, MembershipRole, Organization } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { assertMinRole, assertPermission, type AuthUser, type OrgMembershipContext } from '@/server/auth/rbac'
import type { Permission } from '@/server/auth/permissions'
import { requireUser } from '@/server/auth/session'

export type OrgAccess = {
  user: AuthUser
  organization: Organization
  membership: OrgMembershipContext
}

export async function getMembership(
  userId: string,
  organizationId: string,
): Promise<(Membership & { organization: Organization }) | null> {
  return prisma.membership.findUnique({
    where: {
      userId_organizationId: { userId, organizationId },
    },
    include: { organization: true },
  })
}

export async function requireOrgAccess(
  organizationId: string,
  options?: { minRole?: MembershipRole; permission?: Permission },
): Promise<OrgAccess> {
  const user = await requireUser()
  const row = await getMembership(user.id, organizationId)
  if (!row) {
    throw AppError.forbidden('You are not a member of this organization')
  }

  const membership: OrgMembershipContext = {
    userId: row.userId,
    organizationId: row.organizationId,
    role: row.role,
  }

  if (options?.minRole) {
    assertMinRole(membership, options.minRole)
  }
  if (options?.permission) {
    assertPermission(membership, options.permission)
  }

  return {
    user,
    organization: row.organization,
    membership,
  }
}
