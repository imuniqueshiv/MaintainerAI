import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody, parseParams } from '@/server/validation'
import {
  memberParamsSchema,
  updateMemberRoleSchema,
} from '@/server/validation/auth-schemas'
import { removeMember, updateMemberRole } from '@/server/services/membership-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** PATCH /api/v1/orgs/:orgId/members/:userId */
export const PATCH = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, memberParamsSchema).orgId,
    async ({ request: req, org }) => {
      const { userId } = parseParams(await routeCtx.params, memberParamsSchema)
      const body = await parseJsonBody(req, updateMemberRoleSchema)
      const membership = await updateMemberRole(org.membership, userId, body.role)
      return success({ membership })
    },
    { permission: 'members:update_role' },
  )(request as never, routeCtx)

/** DELETE /api/v1/orgs/:orgId/members/:userId */
export const DELETE = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, memberParamsSchema).orgId,
    async ({ org }) => {
      const { userId } = parseParams(await routeCtx.params, memberParamsSchema)
      await removeMember(org.membership, userId)
      return success({ removed: true })
    },
    { permission: 'members:remove' },
  )(request as never, routeCtx)
