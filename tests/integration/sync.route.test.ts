import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
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

describe('Sync and resource API routes', () => {
  let getIssues: typeof import('@/app/api/v1/issues/route').GET
  let getPulls: typeof import('@/app/api/v1/pulls/route').GET
  let getContributors: typeof import('@/app/api/v1/contributors/route').GET
  let getActivity: typeof import('@/app/api/v1/activity/route').GET
  let getSyncStats: typeof import('@/app/api/v1/sync/statistics/route').GET
  let postRepoSync: typeof import('@/app/api/v1/repos/[repoId]/sync/route').POST

  beforeAll(async () => {
    ;({ GET: getIssues } = await import('@/app/api/v1/issues/route'))
    ;({ GET: getPulls } = await import('@/app/api/v1/pulls/route'))
    ;({ GET: getContributors } = await import('@/app/api/v1/contributors/route'))
    ;({ GET: getActivity } = await import('@/app/api/v1/activity/route'))
    ;({ GET: getSyncStats } = await import('@/app/api/v1/sync/statistics/route'))
    ;({ POST: postRepoSync } = await import('@/app/api/v1/repos/[repoId]/sync/route'))
  })

  beforeEach(() => {
    resetConfigForTests()
    process.env.SKIP_ENV_VALIDATION = '1'
  })

  it('requires auth for aggregate synced resource endpoints', async () => {
    const paths = [
      ['/api/v1/issues', getIssues],
      ['/api/v1/pulls', getPulls],
      ['/api/v1/contributors', getContributors],
      ['/api/v1/activity', getActivity],
      ['/api/v1/sync/statistics', getSyncStats],
    ] as const

    for (const [path, handler] of paths) {
      const response = await handler(new NextRequest(`http://localhost:3000${path}`))
      expect(response.status, path).toBe(401)
    }
  })

  it('requires auth to start repository sync', async () => {
    const response = await postRepoSync(
      new NextRequest('http://localhost:3000/api/v1/repos/00000000-0000-4000-8000-000000000001/sync', {
        method: 'POST',
        body: JSON.stringify({ mode: 'full' }),
        headers: { 'content-type': 'application/json' },
      }),
      { params: Promise.resolve({ repoId: '00000000-0000-4000-8000-000000000001' }) },
    )
    expect(response.status).toBe(401)
  })
})
