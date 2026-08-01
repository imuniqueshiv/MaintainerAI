import type { Prisma } from '@prisma/client'
import { getUserProfile, updateUserProfile } from '@/server/services/user-service'
import { updateOrganization } from '@/server/services/organization-service'

export async function getUserSettings(userId: string) {
  const user = await getUserProfile(userId)
  return {
    theme: user.theme,
    timezone: user.timezone,
    notificationPrefs: user.notificationPrefs ?? {
      email: true,
      inApp: true,
      marketing: false,
      security: true,
    },
    profile: {
      id: user.id,
      login: user.login,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
    },
  }
}

export async function updateUserSettings(
  userId: string,
  data: {
    theme?: string
    timezone?: string
    notificationPrefs?: Prisma.InputJsonValue
  },
) {
  const user = await updateUserProfile(userId, data)
  return getUserSettings(user.id)
}

export async function updateOrganizationSettings(
  actorUserId: string,
  organizationId: string,
  data: { name?: string; avatarUrl?: string | null },
) {
  return updateOrganization(actorUserId, organizationId, data)
}
