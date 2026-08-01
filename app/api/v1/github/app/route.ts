import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { getAppSummaryForUser } from '@/server/services/installation-service'
import { isGitHubAppReady } from '@/server/github'

/** GET /api/v1/github/app — GitHub App + primary installation summary for the user. */
export const GET = withAuth(async ({ user }) => {
  if (!isGitHubAppReady()) {
    return success({
      name: 'MaintainerAI',
      configured: false,
      status: 'unconfigured',
      installationId: null,
      githubInstallationId: null,
      installedRepositories: 0,
      permissions: [],
      webhookEvents: [],
      webhookStatus: 'unconfigured',
      rateLimit: { remaining: null, limit: null },
      lastSync: null,
      syncStatus: null,
      installations: [],
    })
  }

  const summary = await getAppSummaryForUser(user.id)
  return success(summary)
})
