import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams, parseSearchParams, paginationQuerySchema } from '@/server/validation'
import { orgIdParamSchema } from '@/server/validation/auth-schemas'
import { listOrgAuditLogs } from '@/server/services/audit-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/orgs/:orgId/audit-logs */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ request: req, org }) => {
      const { limit, cursor } = parseSearchParams(req, paginationQuerySchema)
      const result = await listOrgAuditLogs(org.organization.id, { limit, cursor })
      return success(result)
    },
    { permission: 'audit:read' },
  )(request as never, routeCtx)
