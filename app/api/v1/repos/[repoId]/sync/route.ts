import { withAuth } from '@/server/middleware/with-auth'
import { accepted, success } from '@/server/lib/api-response'
import { parseParams, parseJsonBody } from '@/server/validation'
import { repositoryIdParamSchema } from '@/server/validation/github-schemas'
import { startSyncBodySchema } from '@/server/validation/sync-schemas'
import { requireRepoAccess } from '@/server/auth/guards'
import { startRepositorySync } from '@/server/sync/coordinator'
import { getRepositorySyncStatus } from '@/server/services/sync-status-service'
import { getConfig } from '@/server/config'
import { AppError } from '@/server/errors/app-error'

type RouteCtx = { params: Promise<Record<string, string>> }

function assertSyncRuntimeReady() {
  const config = getConfig()
  if (!config.features.repositorySync) {
    throw AppError.serviceUnavailable('GitHub App is not configured — repository sync unavailable')
  }
  if (!config.redis.configured) {
    throw AppError.serviceUnavailable('Redis is required for repository synchronization')
  }
}

/** POST /api/v1/repos/:repoId/sync — start a full/incremental sync. */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ request: req, user }) => {
    assertSyncRuntimeReady()
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    const repo = await requireRepoAccess(repoId, 'repos:manage')
    const body = await parseJsonBody(req, startSyncBodySchema)

    const jobs = await startRepositorySync({
      repositoryId: repo.id,
      trigger: 'manual',
      mode: body.mode,
      actorUserId: user.id,
      entities: body.entities,
    })

    return accepted({
      status: 'queued',
      jobs: jobs.map((j) => ({ id: j.id, entity: j.entity, status: j.status })),
    })
  })(request as never)

/** GET /api/v1/repos/:repoId/sync — current sync status + progress. */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async () => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    await requireRepoAccess(repoId, 'repos:read')
    const status = await getRepositorySyncStatus(repoId)
    return success(status)
  })(request as never)
