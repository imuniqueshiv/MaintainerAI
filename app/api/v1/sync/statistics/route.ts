import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseSearchParams } from '@/server/validation'
import { syncStatisticsQuerySchema } from '@/server/validation/sync-schemas'
import { requireOrgAccess } from '@/server/auth/guards'
import { getSyncStatisticsForUser } from '@/server/services/sync-status-service'

/** GET /api/v1/sync/statistics — org/user aggregate repository sync stats. */
export const GET = withAuth(async ({ request, user }) => {
  const { orgId } = parseSearchParams(request, syncStatisticsQuerySchema)
  if (orgId) {
    await requireOrgAccess(orgId, { permission: 'repos:read' })
  }
  const stats = await getSyncStatisticsForUser(user.id, orgId)
  return success(stats)
})
