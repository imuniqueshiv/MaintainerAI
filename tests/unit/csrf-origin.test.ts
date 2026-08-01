import { describe, it, expect, beforeEach } from 'vitest'
import { assertMutatingRequestOrigin } from '@/server/auth/csrf'
import { getConfig, resetConfigForTests } from '@/server/config'
import { AppError } from '@/server/errors/app-error'

describe('mutating origin CSRF guard', () => {
  beforeEach(() => {
    process.env.SKIP_ENV_VALIDATION = '1'
    process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
    process.env.AUTH_CSRF_PROTECT = 'true'
    process.env.CORS_ORIGIN = 'http://localhost:3000'
    resetConfigForTests()
  })

  it('allows same-origin mutating requests', () => {
    getConfig() // warm cache after env
    const request = new Request('http://localhost:3000/api/v1/users/me', {
      method: 'PATCH',
      headers: { origin: 'http://localhost:3000' },
    })
    expect(() => assertMutatingRequestOrigin(request)).not.toThrow()
  })

  it('blocks cross-origin mutating requests when CSRF protect is on', () => {
    getConfig()
    const request = new Request('http://localhost:3000/api/v1/users/me', {
      method: 'PATCH',
      headers: { origin: 'https://evil.example' },
    })
    expect(() => assertMutatingRequestOrigin(request)).toThrow(AppError)
  })

  it('ignores GET requests', () => {
    getConfig()
    const request = new Request('http://localhost:3000/api/v1/users/me', {
      method: 'GET',
      headers: { origin: 'https://evil.example' },
    })
    expect(() => assertMutatingRequestOrigin(request)).not.toThrow()
  })
})
