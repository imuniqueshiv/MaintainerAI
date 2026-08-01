import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { invitationParamsSchema } from '@/server/validation/auth-schemas'
import { revokeInvitation } from '@/server/services/invitation-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** DELETE /api/v1/orgs/:orgId/invitations/:invitationId */
export const DELETE = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, invitationParamsSchema).orgId,
    async ({ org }) => {
      const { invitationId } = parseParams(await routeCtx.params, invitationParamsSchema)
      const invitation = await revokeInvitation(org.membership, invitationId)
      return success({ invitation })
    },
    { permission: 'invitations:manage' },
  )(request as never, routeCtx)
