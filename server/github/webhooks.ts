import { createHmac, timingSafeEqual } from 'node:crypto'
import { AppError } from '@/server/errors/app-error'
import { assertGitHubAppConfigured } from '@/server/github/config'

/**
 * Verify `X-Hub-Signature-256` using the configured webhook secret.
 */
export function verifyWebhookSignature(rawBody: string | Buffer, signatureHeader: string | null): boolean {
  const { webhookSecret } = assertGitHubAppConfigured()
  if (!signatureHeader?.startsWith('sha256=')) return false

  const expected = createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
  const provided = signatureHeader.slice('sha256='.length)

  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(provided, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export function assertWebhookSignature(rawBody: string | Buffer, signatureHeader: string | null): void {
  if (!verifyWebhookSignature(rawBody, signatureHeader)) {
    throw AppError.unauthorized('Invalid GitHub webhook signature')
  }
}
