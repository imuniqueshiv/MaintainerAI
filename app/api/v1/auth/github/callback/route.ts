import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { withAuth } from '@/server/middleware/with-auth'
import { parseSearchParams } from '@/server/validation'
import { githubInstallCallbackQuerySchema } from '@/server/validation/github-schemas'
import { upsertInstallationFromGitHub } from '@/server/services/installation-service'
import { assertGitHubAppConfigured, userCanAccessInstallation } from '@/server/github'
import { GITHUB_INSTALL_STATE_COOKIE } from '@/server/constants'
import { AppError } from '@/server/errors/app-error'
import { getConfig } from '@/server/config'
import { createLogger } from '@/server/logger'
import { prisma } from '@/server/db/prisma'

const log = createLogger({ component: 'github.install-callback' })

/**
 * GET /api/v1/auth/github/callback — GitHub App installation callback (browser redirect).
 */
export const GET = withAuth(async ({ request, user }) => {
  assertGitHubAppConfigured()

  const query = parseSearchParams(request, githubInstallCallbackQuerySchema)
  const cookieStore = await cookies()
  const expectedState = cookieStore.get(GITHUB_INSTALL_STATE_COOKIE)?.value

  if (!query.state || !expectedState || query.state !== expectedState) {
    cookieStore.delete(GITHUB_INSTALL_STATE_COOKIE)
    throw AppError.forbidden('Invalid or missing installation state')
  }

  cookieStore.delete(GITHUB_INSTALL_STATE_COOKIE)

  const account = await prisma.account.findFirst({
    where: { userId: user.id, provider: 'github' },
    select: { access_token: true },
  })
  if (!account?.access_token) {
    throw AppError.forbidden(
      'GitHub OAuth token unavailable. Sign out and sign in again, then reinstall.',
    )
  }

  const allowed = await userCanAccessInstallation(account.access_token, query.installation_id)
  if (!allowed) {
    throw AppError.forbidden('You do not have access to this GitHub App installation')
  }

  const result = await upsertInstallationFromGitHub({
    githubInstallationId: query.installation_id,
    actorUserId: user.id,
    seedRepositories: true,
  })

  log.info(
    {
      installationId: result.installation.id,
      githubInstallationId: String(query.installation_id),
      repoCount: result.repositories.length,
    },
    'GitHub App installation completed',
  )

  const base = getConfig().app.url.replace(/\/$/, '')
  const redirectTo = `${base}/onboarding/select-repositories?installationId=${result.installation.id}`
  return NextResponse.redirect(redirectTo)
})
