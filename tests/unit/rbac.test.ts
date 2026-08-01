import { describe, it, expect } from 'vitest'
import {
  canAssignRole,
  canRemoveMember,
  permissionsForRole,
  roleAtLeast,
  roleHasPermission,
  roleRank,
} from '@/server/auth/permissions'
import {
  assertCanAssignRole,
  assertCanRemoveMember,
  assertMinRole,
  assertPermission,
} from '@/server/auth/rbac'
import { AppError } from '@/server/errors/app-error'

describe('RBAC permissions', () => {
  it('ranks roles correctly', () => {
    expect(roleRank('viewer')).toBeLessThan(roleRank('developer'))
    expect(roleRank('developer')).toBeLessThan(roleRank('maintainer'))
    expect(roleRank('maintainer')).toBeLessThan(roleRank('admin'))
    expect(roleAtLeast('admin', 'viewer')).toBe(true)
    expect(roleAtLeast('viewer', 'admin')).toBe(false)
  })

  it('grants admin all permissions', () => {
    const perms = permissionsForRole('admin')
    expect(perms).toContain('org:delete')
    expect(perms).toContain('ownership:transfer')
    expect(roleHasPermission('admin', 'members:update_role')).toBe(true)
  })

  it('denies viewer destructive permissions', () => {
    expect(roleHasPermission('viewer', 'org:delete')).toBe(false)
    expect(roleHasPermission('viewer', 'members:invite')).toBe(false)
    expect(roleHasPermission('viewer', 'org:read')).toBe(true)
  })

  it('restricts role assignment by actor rank', () => {
    expect(canAssignRole('admin', 'maintainer')).toBe(true)
    expect(canAssignRole('admin', 'admin')).toBe(true)
    expect(canAssignRole('maintainer', 'viewer')).toBe(true)
    expect(canAssignRole('maintainer', 'developer')).toBe(true)
    expect(canAssignRole('maintainer', 'maintainer')).toBe(false)
    expect(canAssignRole('maintainer', 'admin')).toBe(false)
    expect(canAssignRole('developer', 'viewer')).toBe(false)
  })

  it('prevents maintainers from removing admins', () => {
    expect(canRemoveMember('maintainer', 'admin')).toBe(false)
    expect(canRemoveMember('maintainer', 'developer')).toBe(true)
    expect(canRemoveMember('admin', 'admin')).toBe(true)
  })

  it('assert helpers throw AppError', () => {
    const membership = {
      userId: 'u1',
      organizationId: 'o1',
      role: 'viewer' as const,
    }
    expect(() => assertPermission(membership, 'org:delete')).toThrow(AppError)
    expect(() => assertMinRole(membership, 'admin')).toThrow(AppError)
    expect(() => assertCanAssignRole(membership, 'developer')).toThrow(AppError)
    expect(() => assertCanRemoveMember(membership, 'viewer')).toThrow(AppError)
  })
})
