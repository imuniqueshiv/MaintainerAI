import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody, parseParams } from '@/server/validation'
import {
  orgIdParamSchema,
  updateOrganizationSchema,
} from '@/server/validation/auth-schemas'
import {
  deleteOrganization,
  leaveOrganization,
  serializeOrganization,
  updateOrganization,
} from '@/server/services/organization-service'
import { assertPermission } from '@/server/auth/rbac'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/orgs/:orgId */
export const GET = withOrgAuth(
  (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
  async ({ org }) => {
    return success({
      organization: serializeOrganization(org.organization),
      role: org.membership.role,
    })
  },
  { permission: 'org:read' },
)

/** PATCH /api/v1/orgs/:orgId */
export const PATCH = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ request: req, user, org }) => {
      const body = await parseJsonBody(req, updateOrganizationSchema)
      const organization = await updateOrganization(user.id, org.organization.id, body)
      return success({ organization })
    },
    { permission: 'org:update' },
  )(request as never, routeCtx)

/**
 * DELETE /api/v1/orgs/:orgId
 * - `?leave=true` — any member may leave (org:read)
 * - otherwise — requires org:delete (admin)
 */
export const DELETE = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ request: req, user, org }) => {
      const url = new URL(req.url)
      const leave = url.searchParams.get('leave') === 'true'

      if (leave) {
        await leaveOrganization(user.id, org.organization.id)
        return success({ left: true })
      }

      assertPermission(org.membership, 'org:delete')
      await deleteOrganization(user.id, org.organization.id)
      return success({ deleted: true })
    },
    { permission: 'org:read' },
  )(request as never, routeCtx)
