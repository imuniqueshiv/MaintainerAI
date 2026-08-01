import { describe, it, expect, beforeEach } from 'vitest'
import { createHmac } from 'node:crypto'
import { resetConfigForTests } from '@/server/config'

describe('GitHub webhook signature verification', () => {
  beforeEach(() => {
    resetConfigForTests()
    process.env.SKIP_ENV_VALIDATION = '1'
    process.env.GITHUB_APP_ID = '12345'
    process.env.GITHUB_APP_PRIVATE_KEY =
      '-----BEGIN RSA PRIVATE KEY-----\\nMIIEowIBAAKCAQEA0Z3VS5JJcds3xfn/ygWyF6PZFEwUKN8mEXAMPLE\\n-----END RSA PRIVATE KEY-----'
    process.env.GITHUB_WEBHOOK_SECRET = 'test-webhook-secret'
    process.env.GITHUB_APP_SLUG = 'maintainerai'
  })

  it('accepts a valid sha256 signature', async () => {
    const { verifyWebhookSignature } = await import('@/server/github/webhooks')
    const body = '{"action":"created"}'
    const digest = createHmac('sha256', 'test-webhook-secret').update(body).digest('hex')
    expect(verifyWebhookSignature(body, `sha256=${digest}`)).toBe(true)
  })

  it('rejects invalid signatures', async () => {
    const { verifyWebhookSignature } = await import('@/server/github/webhooks')
    const body = '{"action":"created"}'
    expect(verifyWebhookSignature(body, 'sha256=deadbeef')).toBe(false)
    expect(verifyWebhookSignature(body, null)).toBe(false)
    expect(verifyWebhookSignature(body, 'md5=abc')).toBe(false)
  })

  it('assertWebhookSignature throws unauthorized on failure', async () => {
    const { assertWebhookSignature } = await import('@/server/github/webhooks')
    expect(() => assertWebhookSignature('{}', 'sha256=00')).toThrow(/Invalid GitHub webhook signature/)
  })
})
