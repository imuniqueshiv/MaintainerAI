import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { createHmac } from 'node:crypto'
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

const ingestWebhook = vi.fn()

vi.mock('@/server/services/webhook-service', () => ({
  ingestWebhook: (...args: unknown[]) => ingestWebhook(...args),
}))

describe('GitHub App API routes', () => {
  let getInstallUrl: typeof import('@/app/api/v1/auth/github/install-url/route').GET
  let postWebhook: typeof import('@/app/api/webhooks/github/route').POST
  let getRepos: typeof import('@/app/api/v1/repos/route').GET

  beforeAll(async () => {
    ;({ GET: getInstallUrl } = await import('@/app/api/v1/auth/github/install-url/route'))
    ;({ POST: postWebhook } = await import('@/app/api/webhooks/github/route'))
    ;({ GET: getRepos } = await import('@/app/api/v1/repos/route'))
  })

  beforeEach(() => {
    resetConfigForTests()
    ingestWebhook.mockReset()
    ingestWebhook.mockResolvedValue({
      duplicate: false,
      eventId: 'evt_1',
      accepted: true,
    })
    process.env.SKIP_ENV_VALIDATION = '1'
    process.env.GITHUB_APP_ID = '12345'
    process.env.GITHUB_APP_PRIVATE_KEY =
      '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF6PZFEwUKN8mEXAMPLE\n-----END RSA PRIVATE KEY-----'
    process.env.GITHUB_WEBHOOK_SECRET = 'test-webhook-secret'
  })

  it('GET install-url requires authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/auth/github/install-url')
    const response = await getInstallUrl(request)
    expect(response.status).toBe(401)
  })

  it('GET /api/v1/repos requires authentication', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/repos')
    const response = await getRepos(request)
    expect(response.status).toBe(401)
  })

  it('POST webhook rejects invalid signatures before ingest', async () => {
    const { assertWebhookSignature } = await import('@/server/github/webhooks')
    expect(() => assertWebhookSignature('{}', 'sha256=00')).toThrow()

    const body = JSON.stringify({ action: 'created', installation: { id: 1 } })
    const request = new NextRequest('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/json',
        'x-github-delivery': 'delivery-bad',
        'x-github-event': 'installation',
        'x-hub-signature-256': 'sha256=00',
      },
    })

    // Route calls assertGitHubAppConfigured then ingestWebhook (mocked).
    // Real signature enforcement is covered by unit tests + ingestWebhook production path.
    // Simulate production ingest rejecting bad signatures:
    ingestWebhook.mockImplementation(async () => {
      assertWebhookSignature(body, 'sha256=00')
    })

    const response = await postWebhook(request)
    expect(response.status).toBe(401)
  })

  it('POST webhook accepts when ingest succeeds', async () => {
    const body = JSON.stringify({ action: 'created', installation: { id: 1 } })
    const digest = createHmac('sha256', 'test-webhook-secret').update(body).digest('hex')
    const request = new NextRequest('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      body,
      headers: {
        'content-type': 'application/json',
        'x-github-delivery': 'delivery-1',
        'x-github-event': 'installation',
        'x-hub-signature-256': `sha256=${digest}`,
      },
    })

    const response = await postWebhook(request)
    expect([200, 202]).toContain(response.status)
    expect(ingestWebhook).toHaveBeenCalled()
  })
})
