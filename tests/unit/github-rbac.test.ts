import { describe, it, expect } from 'vitest'
import { roleHasPermission, permissionsForRole } from '@/server/auth/permissions'

describe('Phase 3 GitHub RBAC permissions', () => {
  it('grants github/repos read to viewers', () => {
    expect(roleHasPermission('viewer', 'github:read')).toBe(true)
    expect(roleHasPermission('viewer', 'repos:read')).toBe(true)
    expect(roleHasPermission('viewer', 'github:manage')).toBe(false)
    expect(roleHasPermission('viewer', 'repos:manage')).toBe(false)
  })

  it('grants manage permissions to maintainers and admins', () => {
    expect(roleHasPermission('maintainer', 'github:manage')).toBe(true)
    expect(roleHasPermission('maintainer', 'repos:manage')).toBe(true)
    expect(roleHasPermission('admin', 'repos:manage')).toBe(true)
    expect(permissionsForRole('admin')).toEqual(
      expect.arrayContaining(['github:read', 'github:manage', 'repos:read', 'repos:manage']),
    )
  })
})
