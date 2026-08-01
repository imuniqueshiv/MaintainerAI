import { describe, it, expect, beforeEach, vi } from 'vitest'
import { resetConfigForTests } from '@/server/config'
import { resetGitHubAppForTests } from '@/server/github/client'

vi.mock('@octokit/auth-app', () => ({
  createAppAuth: () => async (options: { type: string }) => {
    if (options.type === 'app') {
      return { token: 'jwt-token', type: 'app' }
    }
    return {
      token: 'install-token',
      type: 'token',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }
  },
}))

vi.mock('@/server/cache/redis', () => ({
  cache: {
    get: vi.fn(async () => null),
    set: vi.fn(async () => undefined),
    del: vi.fn(async () => undefined),
  },
}))

describe('GitHub token helpers', () => {
  beforeEach(() => {
    resetConfigForTests()
    resetGitHubAppForTests()
    process.env.SKIP_ENV_VALIDATION = '1'
    process.env.GITHUB_APP_ID = '12345'
    process.env.GITHUB_APP_PRIVATE_KEY =
      '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF6PZFEwUKN8mEXAMPLE\n-----END RSA PRIVATE KEY-----'
    process.env.GITHUB_WEBHOOK_SECRET = 'webhook-secret'
    process.env.GITHUB_APP_CLIENT_ID = 'client-id'
    process.env.GITHUB_APP_CLIENT_SECRET = 'client-secret'
  })

  it('createAppJwt returns a token without logging secrets', async () => {
    const { createAppJwt } = await import('@/server/github/tokens')
    const token = await createAppJwt()
    expect(token).toBe('jwt-token')
  })

  it('getInstallationToken caches via redis helper', async () => {
    const { getInstallationToken } = await import('@/server/github/tokens')
    const result = await getInstallationToken(99)
    expect(result.token).toBe('install-token')
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now())
  })

  it('buildInstallUrl includes slug and state', async () => {
    const { buildInstallUrl } = await import('@/server/github/client')
    const url = buildInstallUrl({ state: 'abc123' })
    expect(url).toContain('https://github.com/apps/maintainerai/installations/new')
    expect(url).toContain('state=abc123')
  })
})
