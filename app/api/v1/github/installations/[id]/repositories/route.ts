import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams, parseJsonBody } from '@/server/validation'
import {
  installationIdParamSchema,
  githubIdsSchema,
} from '@/server/validation/github-schemas'
import { requireInstallationAccess } from '@/server/services/installation-service'
import {
  discoverInstallationRepositories,
  connectRepositories,
} from '@/server/services/repository-github-service'
import { z } from 'zod'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/github/installations/:id/repositories — discover accessible repos (metadata). */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { id } = parseParams(params, installationIdParamSchema)
    await requireInstallationAccess(id, user.id, 'repos:read')
    const repositories = await discoverInstallationRepositories(id)
    return success({ repositories })
  })(request as never)

const connectBodySchema = z.object({
  githubIds: githubIdsSchema,
})

/** POST /api/v1/github/installations/:id/repositories — connect selected repos. */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ request: req, user }) => {
    const params = await routeCtx.params
    const { id } = parseParams(params, installationIdParamSchema)
    await requireInstallationAccess(id, user.id, 'repos:manage')
    const body = await parseJsonBody(req, connectBodySchema)
    const repositories = await connectRepositories({
      installationId: id,
      githubIds: body.githubIds,
      actorUserId: user.id,
    })
    return success({ repositories }, { status: 201 })
  })(request as never)
