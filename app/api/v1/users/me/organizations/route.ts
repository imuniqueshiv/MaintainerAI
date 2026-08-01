import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { listUserOrganizations } from '@/server/services/organization-service'

/** GET /api/v1/users/me/organizations */
export const GET = withAuth(async ({ user }) => {
  const organizations = await listUserOrganizations(user.id)
  return success({ organizations })
})
