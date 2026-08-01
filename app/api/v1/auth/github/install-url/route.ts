import { randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { buildInstallUrl, assertGitHubAppConfigured } from '@/server/github'
import { GITHUB_INSTALL_STATE_COOKIE } from '@/server/constants'
import { getConfig } from '@/server/config'

/**
 * GET /api/v1/auth/github/install-url — authenticated GitHub App install URL + CSRF state.
 */
export const GET = withAuth(async () => {
  assertGitHubAppConfigured()

  const state = randomBytes(24).toString('hex')
  const cookieStore = await cookies()
  cookieStore.set(GITHUB_INSTALL_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: getConfig().appEnv === 'production',
    path: '/',
    maxAge: 60 * 10,
  })

  const url = buildInstallUrl({ state })
  return success({ url, state })
})
