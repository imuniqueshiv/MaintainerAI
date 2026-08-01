import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody } from '@/server/validation'
import { updateProfileSchema } from '@/server/validation/auth-schemas'
import {
  deleteUserAccount,
  getUserProfile,
  updateUserProfile,
} from '@/server/services/user-service'

/**
 * GET /api/v1/users/me
 * PATCH /api/v1/users/me
 * DELETE /api/v1/users/me
 */
export const GET = withAuth(async ({ user }) => {
  const profile = await getUserProfile(user.id)
  return success(profile)
})

export const PATCH = withAuth(async ({ request, user }) => {
  const body = await parseJsonBody(request, updateProfileSchema)
  const profile = await updateUserProfile(user.id, body)
  return success(profile)
})

export const DELETE = withAuth(async ({ user }) => {
  await deleteUserAccount(user.id)
  return success({ deleted: true })
})
