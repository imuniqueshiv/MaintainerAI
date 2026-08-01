import { InvitationStatus } from '@prisma/client'
import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody, parseParams, parseSearchParams } from '@/server/validation'
import {
  createInvitationSchema,
  orgIdParamSchema,
} from '@/server/validation/auth-schemas'
import { createInvitation, listInvitations } from '@/server/services/invitation-service'
import { z } from 'zod'

const listQuerySchema = z.object({
  status: z.nativeEnum(InvitationStatus).optional(),
})

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/orgs/:orgId/invitations */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ request: req, org }) => {
      const { status } = parseSearchParams(req, listQuerySchema)
      const invitations = await listInvitations(org.organization.id, status)
      return success({ invitations })
    },
    { permission: 'invitations:manage' },
  )(request as never, routeCtx)

/** POST /api/v1/orgs/:orgId/invitations */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ request: req, org }) => {
      const body = await parseJsonBody(req, createInvitationSchema)
      const invitation = await createInvitation(org.membership, body)
      return success({ invitation }, { status: 201 })
    },
    { permission: 'members:invite' },
  )(request as never, routeCtx)
