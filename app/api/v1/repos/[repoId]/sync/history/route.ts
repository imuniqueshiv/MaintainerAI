import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams, parseSearchParams } from '@/server/validation'
import { repositoryIdParamSchema } from '@/server/validation/github-schemas'
import { syncHistoryQuerySchema } from '@/server/validation/sync-schemas'
import { requireRepoAccess } from '@/server/auth/guards'
import { getRepositorySyncHistory } from '@/server/services/sync-status-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/repos/:repoId/sync/history — recent SyncJob ledger entries. */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ request }) => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    await requireRepoAccess(repoId, 'repos:read')
    const { limit } = parseSearchParams(request, syncHistoryQuerySchema)
    const history = await getRepositorySyncHistory(repoId, limit)
    return success({ history })
  })(request as never)
