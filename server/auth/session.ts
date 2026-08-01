import { auth } from '@/auth'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import type { AuthUser } from '@/server/auth/rbac'
import { sessionCookieName } from '@/server/auth/cookies'
import type { NextRequest } from 'next/server'

export async function getSession() {
  return auth()
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      login: true,
      email: true,
      name: true,
      avatarUrl: true,
      githubId: true,
    },
  })

  if (!user) return null

  return {
    id: user.id,
    login: user.login,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    githubId: user.githubId.toString(),
  }
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) throw AppError.unauthorized()
  return user
}

/** Read raw session token from request cookies (for logout-all / session listing). */
export function readSessionToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get(sessionCookieName())?.value ??
    request.cookies.get('authjs.session-token')?.value ??
    request.cookies.get('__Secure-authjs.session-token')?.value
  )
}

export async function listUserSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      sessionToken: true,
      expires: true,
    },
    orderBy: { expires: 'desc' },
  })
}

export async function revokeSessionByToken(sessionToken: string): Promise<void> {
  await prisma.session.deleteMany({ where: { sessionToken } })
}

export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.session.deleteMany({ where: { userId } })
  return result.count
}

/** Sliding session extension: bump expiry when more than halfway through TTL. */
export async function touchSession(sessionToken: string, maxAgeSeconds: number): Promise<void> {
  const session = await prisma.session.findUnique({ where: { sessionToken } })
  if (!session) return

  const now = Date.now()
  const expiresAt = session.expires.getTime()
  if (expiresAt <= now) return

  const remaining = expiresAt - now
  const half = (maxAgeSeconds * 1000) / 2
  if (remaining > half) return

  await prisma.session.update({
    where: { sessionToken },
    data: { expires: new Date(now + maxAgeSeconds * 1000) },
  })
}
