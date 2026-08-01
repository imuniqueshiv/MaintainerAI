import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { listUserNotifications } from '@/server/services/user-service'
import { parseSearchParams, paginationQuerySchema } from '@/server/validation'

/** GET /api/v1/users/me/notifications */
export const GET = withAuth(async ({ request, user }) => {
  const { limit } = parseSearchParams(request, paginationQuerySchema)
  const notifications = await listUserNotifications(user.id, limit)
  return success({ notifications })
})
