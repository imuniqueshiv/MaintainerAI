import { describe, it, expect } from 'vitest'
import { createCsrfToken, hashCsrfToken, verifyCsrfToken } from '@/server/auth/csrf'
import { allocateSyntheticGithubId, createOpaqueToken } from '@/server/utils/tokens'
import { updateProfileSchema, createOrganizationSchema } from '@/server/validation/auth-schemas'

describe('auth utilities', () => {
  it('creates and verifies CSRF tokens', () => {
    const token = createCsrfToken()
    const hash = hashCsrfToken(token)
    expect(verifyCsrfToken(token, hash)).toBe(true)
    expect(verifyCsrfToken('wrong', hash)).toBe(false)
  })

  it('creates opaque tokens', () => {
    const a = createOpaqueToken()
    const b = createOpaqueToken()
    expect(a).toHaveLength(64)
    expect(a).not.toEqual(b)
  })

  it('allocates negative synthetic GitHub ids', () => {
    const id = allocateSyntheticGithubId()
    expect(id < BigInt(0)).toBe(true)
  })

  it('validates profile updates', () => {
    expect(updateProfileSchema.parse({ theme: 'dark', name: 'Ada' })).toMatchObject({
      theme: 'dark',
      name: 'Ada',
    })
    expect(() => updateProfileSchema.parse({ theme: 'neon' })).toThrow()
  })

  it('validates organization login slug', () => {
    expect(createOrganizationSchema.parse({ name: 'Acme', login: 'acme-inc' }).login).toBe(
      'acme-inc',
    )
    expect(() => createOrganizationSchema.parse({ name: 'Acme', login: 'BAD LOGIN' })).toThrow()
  })
})
