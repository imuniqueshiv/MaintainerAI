import { withAuth } from '@/server/middleware/with-auth'
import { paginated } from '@/server/lib/api-response'
import { parseParams, parseSearchParams } from '@/server/validation'
import { repositoryIdParamSchema } from '@/server/validation/github-schemas'
import { resourceListQuerySchema } from '@/server/validation/sync-schemas'
import { requireRepoAccess } from '@/server/auth/guards'
import { listRepoContributors } from '@/server/services/repo-resources-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/repos/:repoId/contributors — synced contributors (DB-backed). */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ request: req }) => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    await requireRepoAccess(repoId, 'repos:read')
    const query = parseSearchParams(req, resourceListQuerySchema)
    const { items, total } = await listRepoContributors(repoId, query)
    const hasNextPage = query.page * query.limit < total
    return paginated(items, { nextCursor: null, hasNextPage, total })
  })(request as never)
