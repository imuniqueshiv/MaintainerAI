import { beforeAll, describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { resetConfigForTests } from '@/server/config'

vi.mock('@/auth', () => ({
  auth: vi.fn(async () => null),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/server/auth/session', () => ({
  getSession: vi.fn(async () => null),
  getCurrentUser: vi.fn(async () => null),
  requireUser: vi.fn(async () => {
    const { AppError } = await import('@/server/errors/app-error')
    throw AppError.unauthorized('Authentication required')
  }),
  readSessionToken: vi.fn(),
  touchSession: vi.fn(),
  listUserSessions: vi.fn(),
  revokeSessionByToken: vi.fn(),
  revokeAllUserSessions: vi.fn(),
}))

describe('auth routes (unauthenticated)', () => {
  let getSessionRoute: typeof import('@/app/api/v1/auth/session/route').GET
  let getInstallUrl: typeof import('@/app/api/v1/auth/github/install-url/route').GET

  beforeAll(async () => {
    ;({ GET: getSessionRoute } = await import('@/app/api/v1/auth/session/route'))
    ;({ GET: getInstallUrl } = await import('@/app/api/v1/auth/github/install-url/route'))
  })

  beforeEach(() => {
    resetConfigForTests()
    process.env.SKIP_ENV_VALIDATION = '1'
  })

  it('GET /api/v1/auth/session returns authenticated=false', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/auth/session')
    const response = await getSessionRoute(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.authenticated).toBe(false)
    expect(body.data.user).toBeNull()
  })

  it('GET /api/v1/auth/github/install-url requires authentication (Phase 3)', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/auth/github/install-url')
    const response = await getInstallUrl(request)
    expect(response.status).toBe(401)
  })
})
