import { withApi } from '@/server/middleware/with-api'
import { failure } from '@/server/lib/api-response'
import { AppError } from '@/server/errors/app-error'

/**
 * GET /api/v1/auth/github/callback — GitHub App install callback (Phase 3).
 */
export const GET = withApi(async ({ requestId }) => {
  return failure(
    AppError.serviceUnavailable(
      'GitHub App installation callback is part of Phase 3.',
      { phase: 3 },
    ),
    requestId,
  )
})
