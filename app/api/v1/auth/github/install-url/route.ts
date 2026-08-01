import { withApi } from '@/server/middleware/with-api'
import { failure } from '@/server/lib/api-response'
import { AppError } from '@/server/errors/app-error'

/**
 * GET /api/v1/auth/github/install-url — GitHub App install URL (Phase 3).
 */
export const GET = withApi(async ({ requestId }) => {
  return failure(
    AppError.serviceUnavailable(
      'GitHub App installation is part of Phase 3. Configure GITHUB_APP_* and implement install flow then.',
      { phase: 3 },
    ),
    requestId,
  )
})
