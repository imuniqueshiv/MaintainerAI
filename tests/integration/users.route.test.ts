import { beforeAll, describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { AppError } from '@/server/errors/app-error'
import { resetConfigForTests } from '@/server/config'

const requireUser = vi.hoisted(() => vi.fn())
const getUserProfile = vi.hoisted(() => vi.fn())
const updateUserProfile = vi.hoisted(() => vi.fn())

vi.mock('@/auth', () => ({
  auth: vi.fn(async () => null),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('@/server/auth/session', () => ({
  requireUser: (...args: unknown[]) => requireUser(...args),
  readSessionToken: () => 'test-token',
  touchSession: vi.fn(),
  getSession: vi.fn(async () => null),
  getCurrentUser: vi.fn(async () => null),
  listUserSessions: vi.fn(),
  revokeSessionByToken: vi.fn(),
  revokeAllUserSessions: vi.fn(),
}))

vi.mock('@/server/services/user-service', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  updateUserProfile: (...args: unknown[]) => updateUserProfile(...args),
  deleteUserAccount: vi.fn(),
  listUserNotifications: vi.fn(),
  serializeUser: (u: unknown) => u,
}))

describe('users/me routes', () => {
  let getMe: typeof import('@/app/api/v1/users/me/route').GET
  let patchMe: typeof import('@/app/api/v1/users/me/route').PATCH

  beforeAll(async () => {
    ;({ GET: getMe, PATCH: patchMe } = await import('@/app/api/v1/users/me/route'))
  })

  beforeEach(() => {
    resetConfigForTests()
    process.env.SKIP_ENV_VALIDATION = '1'
    requireUser.mockReset()
    getUserProfile.mockReset()
    updateUserProfile.mockReset()
  })

  it('returns 401 when unauthenticated', async () => {
    requireUser.mockRejectedValue(AppError.unauthorized())
    const request = new NextRequest('http://localhost:3000/api/v1/users/me')
    const response = await getMe(request)
    expect(response.status).toBe(401)
  })

  it('returns profile when authenticated', async () => {
    requireUser.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      login: 'octocat',
      githubId: '1',
    })
    getUserProfile.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      login: 'octocat',
      githubId: '1',
      theme: 'system',
      timezone: 'UTC',
    })

    const request = new NextRequest('http://localhost:3000/api/v1/users/me')
    const response = await getMe(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.login).toBe('octocat')
  })

  it('patches profile', async () => {
    requireUser.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      login: 'octocat',
      githubId: '1',
    })
    updateUserProfile.mockResolvedValue({
      id: '11111111-1111-1111-1111-111111111111',
      login: 'octocat',
      githubId: '1',
      theme: 'dark',
      timezone: 'UTC',
    })

    const request = new NextRequest('http://localhost:3000/api/v1/users/me', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ theme: 'dark' }),
    })
    const response = await patchMe(request)
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.theme).toBe('dark')
  })
})
