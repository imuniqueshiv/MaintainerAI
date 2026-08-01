import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { installationIdParamSchema } from '@/server/validation/github-schemas'
import { requireInstallationAccess } from '@/server/services/installation-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/github/installations/:id/permissions */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { id } = parseParams(params, installationIdParamSchema)
    const access = await requireInstallationAccess(id, user.id, 'github:read')
    const permissions = access.installation.permissions
    const list =
      permissions && typeof permissions === 'object'
        ? Object.entries(permissions as Record<string, string>).map(([name, accessLevel]) => ({
            name,
            access: String(accessLevel),
          }))
        : []

    return success({
      installationId: access.installation.id,
      permissions: list,
      webhookEvents: access.installation.webhookEvents,
      accountLogin: access.installation.accountLogin,
      accountType: access.installation.accountType,
    })
  })(request as never)
