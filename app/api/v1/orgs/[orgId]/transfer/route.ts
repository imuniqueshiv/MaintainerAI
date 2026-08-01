import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody, parseParams } from '@/server/validation'
import {
  orgIdParamSchema,
  transferOwnershipSchema,
} from '@/server/validation/auth-schemas'
import { transferOrganizationOwnership } from '@/server/services/organization-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** POST /api/v1/orgs/:orgId/transfer */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ request: req, user, org }) => {
      const body = await parseJsonBody(req, transferOwnershipSchema)
      const organization = await transferOrganizationOwnership(
        user.id,
        org.organization.id,
        body.newOwnerUserId,
      )
      return success({ organization })
    },
    { permission: 'ownership:transfer' },
  )(request as never, routeCtx)
