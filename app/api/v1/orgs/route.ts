import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody } from '@/server/validation'
import { createOrganizationSchema } from '@/server/validation/auth-schemas'
import {
  createOrganization,
  listUserOrganizations,
} from '@/server/services/organization-service'

/** GET /api/v1/orgs — list orgs for current user */
export const GET = withAuth(async ({ user }) => {
  const organizations = await listUserOrganizations(user.id)
  return success({ organizations })
})

/** POST /api/v1/orgs — create organization */
export const POST = withAuth(async ({ request, user }) => {
  const body = await parseJsonBody(request, createOrganizationSchema)
  const organization = await createOrganization(user.id, body)
  return success({ organization }, { status: 201 })
})
