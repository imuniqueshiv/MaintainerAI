import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { listInstallationsForUser } from '@/server/services/installation-service'
import { fetchAppRateLimit, assertGitHubAppConfigured } from '@/server/github'
import { AppError } from '@/server/errors/app-error'
import { prisma } from '@/server/db/prisma'

/** GET /api/v1/github/rate-limit — rate limit for the user's primary installation. */
export const GET = withAuth(async ({ user }) => {
  assertGitHubAppConfigured()
  const installations = await listInstallationsForUser(user.id)
  const primary = installations[0]
  if (!primary) {
    throw AppError.notFound('No GitHub App installation found')
  }

  const githubInstallationId = BigInt(primary.githubInstallationId)

  try {
    const rate = await fetchAppRateLimit(githubInstallationId)
    await prisma.installation.update({
      where: { id: primary.id },
      data: {
        rateLimitRemaining: rate.rate.remaining,
        rateLimitLimit: rate.rate.limit,
      },
    })
    return success({
      installationId: primary.id,
      resources: rate.resources,
      rate: rate.rate,
    })
  } catch {
    return success({
      installationId: primary.id,
      rate: {
        remaining: primary.rateLimitRemaining,
        limit: primary.rateLimitLimit,
      },
      cached: true,
    })
  }
})
