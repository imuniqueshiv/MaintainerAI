import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { revokeAllUserSessions, revokeSessionByToken } from '@/server/auth/session'
import { parseJsonBody } from '@/server/validation'
import { z } from 'zod'
import { signOut } from '@/auth'

const logoutBodySchema = z.object({
  everywhere: z.boolean().optional().default(false),
})

/**
 * POST /api/v1/auth/logout — invalidate current session (or all sessions).
 */
export const POST = withAuth(async ({ request, user, sessionToken }) => {
  const body = await parseJsonBody(request, logoutBodySchema).catch(() => ({
    everywhere: false,
  }))

  if (body.everywhere) {
    await revokeAllUserSessions(user.id)
  } else if (sessionToken) {
    await revokeSessionByToken(sessionToken)
  }

  // Clear Auth.js cookies via signOut (redirect: false for API clients).
  await signOut({ redirect: false })

  return success({ loggedOut: true, everywhere: body.everywhere })
})
