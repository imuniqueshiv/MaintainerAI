import type { MembershipRole } from '@prisma/client'

/**
 * Code-level permission identifiers for Phase 2 RBAC.
 * Roles are stored in Prisma (`MembershipRole`); permissions are not DB rows.
 */
export const PERMISSIONS = [
  'org:read',
  'org:update',
  'org:delete',
  'members:read',
  'members:invite',
  'members:update_role',
  'members:remove',
  'invitations:manage',
  'audit:read',
  'settings:read',
  'settings:update',
  'ownership:transfer',
] as const

export type Permission = (typeof PERMISSIONS)[number]

const ROLE_RANK: Record<MembershipRole, number> = {
  viewer: 1,
  developer: 2,
  maintainer: 3,
  admin: 4,
}

/** Permissions granted to each membership role (inclusive of lower roles via rank checks elsewhere). */
const ROLE_PERMISSIONS: Record<MembershipRole, readonly Permission[]> = {
  viewer: ['org:read', 'members:read', 'settings:read'],
  developer: ['org:read', 'members:read', 'settings:read'],
  maintainer: [
    'org:read',
    'org:update',
    'members:read',
    'members:invite',
    'members:remove',
    'invitations:manage',
    'audit:read',
    'settings:read',
    'settings:update',
  ],
  admin: [
    'org:read',
    'org:update',
    'org:delete',
    'members:read',
    'members:invite',
    'members:update_role',
    'members:remove',
    'invitations:manage',
    'audit:read',
    'settings:read',
    'settings:update',
    'ownership:transfer',
  ],
}

export function roleRank(role: MembershipRole): number {
  return ROLE_RANK[role]
}

export function roleAtLeast(role: MembershipRole, minimum: MembershipRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minimum]
}

export function permissionsForRole(role: MembershipRole): readonly Permission[] {
  return ROLE_PERMISSIONS[role]
}

export function roleHasPermission(role: MembershipRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Whether `actor` may assign/invite a membership with `targetRole`.
 * Admins may assign any role. Maintainers may invite developer/viewer only.
 */
export function canAssignRole(actorRole: MembershipRole, targetRole: MembershipRole): boolean {
  if (actorRole === 'admin') return true
  if (actorRole === 'maintainer') {
    return ROLE_RANK[targetRole] < ROLE_RANK.maintainer
  }
  return false
}

/**
 * Whether `actor` may remove a member with `targetRole`.
 * Maintainers cannot remove admins; admins can remove anyone except enforced last-admin rules in services.
 */
export function canRemoveMember(actorRole: MembershipRole, targetRole: MembershipRole): boolean {
  if (actorRole === 'admin') return true
  if (actorRole === 'maintainer') return ROLE_RANK[targetRole] < ROLE_RANK.admin
  return false
}
