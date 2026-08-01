import { withAuth } from '@/server/middleware/with-auth'
import { success, noContent } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { installationIdParamSchema } from '@/server/validation/github-schemas'
import {
  requireInstallationAccess,
  serializeInstallation,
  disconnectInstallation,
  refreshInstallationMetadata,
} from '@/server/services/installation-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/github/installations/:id */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { id } = parseParams(params, installationIdParamSchema)
    const access = await requireInstallationAccess(id, user.id, 'github:read')
    return success({
      ...serializeInstallation(access.installation),
      organization: {
        ...access.organization,
        githubId: access.organization.githubId.toString(),
      },
      connectedRepositoryCount: access.connectedRepositoryCount,
      role: access.membership.role,
    })
  })(request as never)

/** POST /api/v1/github/installations/:id — refresh installation metadata (not issue/PR sync). */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { id } = parseParams(params, installationIdParamSchema)
    await requireInstallationAccess(id, user.id, 'github:manage')
    const result = await refreshInstallationMetadata(id, user.id)
    return success(result)
  })(request as never)

/** DELETE /api/v1/github/installations/:id — local disconnect. */
export const DELETE = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { id } = parseParams(params, installationIdParamSchema)
    await disconnectInstallation(id, user.id)
    return noContent()
  })(request as never)
