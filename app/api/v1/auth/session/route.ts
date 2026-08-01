import { withApi } from '@/server/middleware/with-api'
import { success } from '@/server/lib/api-response'
import { getCurrentUser, getSession } from '@/server/auth/session'
import { getConfig } from '@/server/config'

/**
 * GET /api/v1/auth/session — current Auth.js session + user profile summary.
 */
export const GET = withApi(async () => {
  const config = getConfig()
  const session = await getSession()
  const user = await getCurrentUser()

  return success({
    authenticated: Boolean(user),
    authConfigured: config.auth.configured,
    session: session
      ? {
          expires: session.expires,
        }
      : null,
    user,
  })
})
