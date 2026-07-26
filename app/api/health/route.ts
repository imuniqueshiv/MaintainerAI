import { withApi } from '@/server/middleware/with-api'
import { success } from '@/server/lib/api-response'
import { getHealthReport } from '@/server/services/health-service'

/**
 * GET /api/health — aggregate application + dependency health.
 */
export const GET = withApi(
  async () => {
    const report = await getHealthReport()
    const status = report.status === 'ok' ? 200 : report.status === 'degraded' ? 200 : 503
    return success(report, { status })
  },
  { skipRateLimit: true },
)
