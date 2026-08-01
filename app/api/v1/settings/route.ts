import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody } from '@/server/validation'
import { updateSettingsSchema } from '@/server/validation/auth-schemas'
import { getUserSettings, updateUserSettings } from '@/server/services/settings-service'

/** GET /api/v1/settings — user settings */
export const GET = withAuth(async ({ user }) => {
  const settings = await getUserSettings(user.id)
  return success(settings)
})

/** PATCH /api/v1/settings — update user settings */
export const PATCH = withAuth(async ({ request, user }) => {
  const body = await parseJsonBody(request, updateSettingsSchema)
  const settings = await updateUserSettings(user.id, body)
  return success(settings)
})
