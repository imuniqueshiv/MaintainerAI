import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import {
  listUserSessions,
  revokeAllUserSessions,
  revokeSessionByToken,
} from '@/server/auth/session'
import { createHash } from 'node:crypto'
import { signOut } from '@/auth'

function fingerprint(token: string): string {
  return createHash('sha256').update(token).digest('hex').slice(0, 12)
}

/** GET /api/v1/users/me/sessions — list sessions (token fingerprints only). */
export const GET = withAuth(async ({ user, sessionToken }) => {
  const sessions = await listUserSessions(user.id)
  return success({
    sessions: sessions.map((s) => ({
      id: s.id,
      expires: s.expires,
      current: sessionToken ? s.sessionToken === sessionToken : false,
      fingerprint: fingerprint(s.sessionToken),
    })),
  })
})

/** DELETE /api/v1/users/me/sessions — logout everywhere + clear Auth.js cookies. */
export const DELETE = withAuth(async ({ user, sessionToken }) => {
  const count = await revokeAllUserSessions(user.id)
  if (sessionToken) {
    await revokeSessionByToken(sessionToken).catch(() => undefined)
  }
  await signOut({ redirect: false })
  return success({ revoked: count })
})
