import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { listInstallationsForUser } from '@/server/services/installation-service'
import { assertGitHubAppConfigured } from '@/server/github'

/** GET /api/v1/github/installations */
export const GET = withAuth(async ({ user }) => {
  assertGitHubAppConfigured()
  const installations = await listInstallationsForUser(user.id)
  return success({ installations })
})
