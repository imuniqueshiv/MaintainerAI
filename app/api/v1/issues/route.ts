import { withAuth } from '@/server/middleware/with-auth'
import { paginated } from '@/server/lib/api-response'
import { parseSearchParams } from '@/server/validation'
import { resourceListQuerySchema } from '@/server/validation/sync-schemas'
import { listUserIssues } from '@/server/services/repo-resources-service'

/** GET /api/v1/issues — synced issues across the user's organizations. */
export const GET = withAuth(async ({ request, user }) => {
  const query = parseSearchParams(request, resourceListQuerySchema)
  const { items, total } = await listUserIssues(user.id, query)
  const hasNextPage = query.page * query.limit < total
  return paginated(items, { nextCursor: null, hasNextPage, total })
})
