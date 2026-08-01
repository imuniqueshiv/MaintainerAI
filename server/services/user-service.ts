import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import type { Prisma } from '@prisma/client'
import { writeAuditLog } from '@/server/services/audit-service'
import { revokeAllUserSessions } from '@/server/auth/session'

const userPublicSelect = {
  id: true,
  login: true,
  name: true,
  email: true,
  emailVerified: true,
  avatarUrl: true,
  githubId: true,
  theme: true,
  timezone: true,
  notificationPrefs: true,
  isBot: true,
  createdAt: true,
  updatedAt: true,
} as const

export function serializeUser<T extends { githubId: bigint }>(user: T) {
  return {
    ...user,
    githubId: user.githubId.toString(),
  }
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userPublicSelect,
  })
  if (!user) throw AppError.notFound('User not found')
  return serializeUser(user)
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string
    theme?: string
    timezone?: string
    notificationPrefs?: Prisma.InputJsonValue
    avatarUrl?: string | null
  },
) {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        theme: data.theme,
        timezone: data.timezone,
        notificationPrefs: data.notificationPrefs,
        avatarUrl: data.avatarUrl === undefined ? undefined : data.avatarUrl,
      },
      select: userPublicSelect,
    })

    await writeAuditLog({
      action: 'user.profile.update',
      targetType: 'user',
      targetId: userId,
      actorUserId: userId,
      metadata: { fields: Object.keys(data) },
    })

    return serializeUser(user)
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      throw AppError.conflict('Profile update conflict')
    }
    throw error
  }
}

export async function deleteUserAccount(userId: string) {
  await revokeAllUserSessions(userId)
  await prisma.user.delete({ where: { id: userId } })
  await writeAuditLog({
    action: 'user.account.delete',
    targetType: 'user',
    targetId: userId,
    actorUserId: userId,
  })
}

export async function listUserNotifications(userId: string, limit = 25) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
