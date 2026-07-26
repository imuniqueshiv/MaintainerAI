import { withApi } from '@/server/middleware/with-api'
import { success, failure } from '@/server/lib/api-response'
import { AppError } from '@/server/errors/app-error'
import { getReadiness } from '@/server/services/health-service'

/**
 * GET /api/ready — readiness probe (DB + Redis + queue must be healthy).
 */
export const GET = withApi(
  async ({ requestId }) => {
    const { ready, report } = await getReadiness()
    if (!ready) {
      return failure(AppError.serviceUnavailable('Service not ready', report.checks), requestId)
    }
    return success({ ready: true, report })
  },
  { skipRateLimit: true },
)
