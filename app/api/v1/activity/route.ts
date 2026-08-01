import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { listUserActivity } from '@/server/services/repo-resources-service'

/** GET /api/v1/activity — recent synced issue/PR activity. */
export const GET = withAuth(async ({ user }) => {
  const activities = await listUserActivity(user.id, 30)
  return success({ activities })
})
