import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams, parseJsonBody } from '@/server/validation'
import { repositoryIdParamSchema } from '@/server/validation/github-schemas'
import { cancelSyncBodySchema } from '@/server/validation/sync-schemas'
import { requireRepoAccess } from '@/server/auth/guards'
import { cancelSync } from '@/server/sync/coordinator'

type RouteCtx = { params: Promise<Record<string, string>> }

/** POST /api/v1/repos/:repoId/sync/cancel — cancel active sync job(s). */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ request: req, user }) => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    const repo = await requireRepoAccess(repoId, 'repos:manage')
    const body = await parseJsonBody(req, cancelSyncBodySchema)

    const result = await cancelSync({
      repositoryId: repo.id,
      syncJobId: body.syncJobId,
      actorUserId: user.id,
    })

    return success(result)
  })(request as never)
