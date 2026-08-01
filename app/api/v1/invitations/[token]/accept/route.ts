import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { invitationTokenParamSchema } from '@/server/validation/auth-schemas'
import { acceptInvitation } from '@/server/services/invitation-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** POST /api/v1/invitations/:token/accept */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const { token } = parseParams(await routeCtx.params, invitationTokenParamSchema)
    const result = await acceptInvitation(user.id, token)
    return success(result)
  })(request as never)
