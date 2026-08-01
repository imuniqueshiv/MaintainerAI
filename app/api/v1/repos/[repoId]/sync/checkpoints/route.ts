import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { repositoryIdParamSchema } from '@/server/validation/github-schemas'
import { requireRepoAccess } from '@/server/auth/guards'
import { getRepositorySyncCheckpoints } from '@/server/services/sync-status-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/repos/:repoId/sync/checkpoints — per-entity pagination cursors. */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async () => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    await requireRepoAccess(repoId, 'repos:read')
    const checkpoints = await getRepositorySyncCheckpoints(repoId)
    return success({ checkpoints })
  })(request as never)
