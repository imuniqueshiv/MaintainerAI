import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { orgIdParamSchema } from '@/server/validation/auth-schemas'
import { listMembers } from '@/server/services/membership-service'

/** GET /api/v1/orgs/:orgId/members */
export const GET = (
  request: Request,
  routeCtx: { params: Promise<Record<string, string>> },
) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ org }) => {
      const members = await listMembers(org.organization.id)
      return success({ members })
    },
    { permission: 'members:read' },
  )(request as never, routeCtx)
