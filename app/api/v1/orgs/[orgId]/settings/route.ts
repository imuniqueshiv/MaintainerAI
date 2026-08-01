import { withOrgAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody, parseParams } from '@/server/validation'
import {
  orgIdParamSchema,
  updateOrgSettingsSchema,
} from '@/server/validation/auth-schemas'
import { updateOrganizationSettings } from '@/server/services/settings-service'
import { serializeOrganization } from '@/server/services/organization-service'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/orgs/:orgId/settings */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ org }) => {
      return success({
        organization: serializeOrganization(org.organization),
        role: org.membership.role,
      })
    },
    { permission: 'settings:read' },
  )(request as never, routeCtx)

/** PATCH /api/v1/orgs/:orgId/settings */
export const PATCH = (request: Request, routeCtx: RouteCtx) =>
  withOrgAuth(
    (_ctx, params) => parseParams(params, orgIdParamSchema).orgId,
    async ({ request: req, user, org }) => {
      const body = await parseJsonBody(req, updateOrgSettingsSchema)
      const organization = await updateOrganizationSettings(
        user.id,
        org.organization.id,
        body,
      )
      return success({ organization })
    },
    { permission: 'settings:update' },
  )(request as never, routeCtx)
