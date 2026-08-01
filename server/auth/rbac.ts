import type { MembershipRole } from '@prisma/client'
import { AppError } from '@/server/errors/app-error'
import {
  canAssignRole,
  canRemoveMember,
  roleAtLeast,
  roleHasPermission,
  type Permission,
} from '@/server/auth/permissions'

export type AuthUser = {
  id: string
  login: string
  email?: string | null
  name?: string | null
  avatarUrl?: string | null
  githubId: string
}

export type OrgMembershipContext = {
  userId: string
  organizationId: string
  role: MembershipRole
}

export function assertPermission(
  membership: OrgMembershipContext,
  permission: Permission,
  message = 'Insufficient permissions',
): void {
  if (!roleHasPermission(membership.role, permission)) {
    throw AppError.forbidden(message)
  }
}

export function assertMinRole(
  membership: OrgMembershipContext,
  minimum: MembershipRole,
  message = 'Insufficient role',
): void {
  if (!roleAtLeast(membership.role, minimum)) {
    throw AppError.forbidden(message)
  }
}

export function assertCanAssignRole(actor: OrgMembershipContext, targetRole: MembershipRole): void {
  if (!canAssignRole(actor.role, targetRole)) {
    throw AppError.forbidden('You cannot assign this role')
  }
}

export function assertCanRemoveMember(
  actor: OrgMembershipContext,
  targetRole: MembershipRole,
): void {
  if (!canRemoveMember(actor.role, targetRole)) {
    throw AppError.forbidden('You cannot remove this member')
  }
}
