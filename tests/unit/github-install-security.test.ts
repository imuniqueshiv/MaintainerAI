import { describe, it, expect, beforeEach } from 'vitest'
import { resetConfigForTests } from '@/server/config'

describe('installation org resolution security', () => {
  beforeEach(() => {
    resetConfigForTests()
    process.env.SKIP_ENV_VALIDATION = '1'
  })

  it('githubInstallCallbackQuerySchema requires state', async () => {
    const { githubInstallCallbackQuerySchema } = await import(
      '@/server/validation/github-schemas'
    )
    const missing = githubInstallCallbackQuerySchema.safeParse({
      installation_id: '123',
    })
    expect(missing.success).toBe(false)

    const ok = githubInstallCallbackQuerySchema.safeParse({
      installation_id: '123',
      state: 'a'.repeat(24),
    })
    expect(ok.success).toBe(true)
  })

  it('connectRepositoriesSchema accepts replace flag', async () => {
    const { connectRepositoriesSchema } = await import('@/server/validation/github-schemas')
    const parsed = connectRepositoriesSchema.parse({
      installationId: '11111111-1111-4111-8111-111111111111',
      githubIds: [1, '2'],
      replace: true,
    })
    expect(parsed.replace).toBe(true)
    expect(parsed.githubIds).toEqual(['1', '2'])
  })
})

describe('webhook signature export', () => {
  it('exports assertWebhookSignature', async () => {
    process.env.GITHUB_APP_ID = '1'
    process.env.GITHUB_APP_PRIVATE_KEY =
      '-----BEGIN RSA PRIVATE KEY-----\nMIIE\n-----END RSA PRIVATE KEY-----'
    process.env.GITHUB_WEBHOOK_SECRET = 'sec'
    resetConfigForTests()
    const mod = await import('@/server/github/webhooks')
    expect(typeof mod.assertWebhookSignature).toBe('function')
  })
})
