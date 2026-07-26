import { withApi } from '@/server/middleware/with-api'
import { success } from '@/server/lib/api-response'
import { getLiveness } from '@/server/services/health-service'

/**
 * GET /api/live — liveness probe (process is up).
 */
export const GET = withApi(
  async () => {
    return success(getLiveness())
  },
  { skipRateLimit: true },
)
