import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { orgIdParamSchema } from '@/server/validation/auth-schemas'
import {
  getOrgDashboardStats,
  serializeOrganization,
} from '@/server/services/organization-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/orgs/:orgId/dashboard */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ org }) => {
      const stats = await getOrgDashboardStats(org.organization.id)
      return success({
        organization: serializeOrganization(org.organization),
        role: org.membership.role,
        stats,
      })
    },
    { permission: 'org:read' },
  )(request as never, routeCtx)
