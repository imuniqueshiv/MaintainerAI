import { withApi } from '@/server/middleware/with-api'
import { accepted, success } from '@/server/lib/api-response'
import { ingestWebhook } from '@/server/services/webhook-service'
import { AppError } from '@/server/errors/app-error'
import { assertGitHubAppConfigured } from '@/server/github'

/**
 * POST /api/webhooks/github — GitHub App webhook receiver (signature verified).
 */
export const POST = withApi(
  async ({ request }) => {
    assertGitHubAppConfigured()

    const deliveryId = request.headers.get('x-github-delivery')
    const event = request.headers.get('x-github-event')
    const signature = request.headers.get('x-hub-signature-256')
    const actionHeader = request.headers.get('x-github-hook-installation-target-id')

    if (!deliveryId || !event) {
      throw AppError.badRequest('Missing X-GitHub-Delivery or X-GitHub-Event headers')
    }

    const rawBody = await request.text()
    let action: string | null = null
    try {
      const parsed = JSON.parse(rawBody) as { action?: string }
      action = parsed.action ?? null
    } catch {
      action = null
    }

    const result = await ingestWebhook({
      rawBody,
      signature,
      deliveryId,
      event,
      action,
    })

    if (result.duplicate) {
      return success({
        accepted: true,
        duplicate: true,
        eventId: result.eventId,
        hookTarget: actionHeader,
      })
    }

    return accepted({
      accepted: true,
      duplicate: false,
      eventId: result.eventId,
      status: 'queued',
    })
  },
  { skipRateLimit: true },
)
