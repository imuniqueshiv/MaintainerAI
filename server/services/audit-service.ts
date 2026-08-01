import { prisma } from '@/server/db/prisma'
import type { Prisma } from '@prisma/client'

export async function writeAuditLog(input: {
  action: string
  targetType: string
  targetId: string
  organizationId?: string | null
  actorUserId?: string | null
  metadata?: Prisma.InputJsonValue
  ip?: string | null
}) {
  return prisma.auditLog.create({
    data: {
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      organizationId: input.organizationId ?? null,
      actorUserId: input.actorUserId ?? null,
      metadata: input.metadata ?? undefined,
      ip: input.ip ?? null,
    },
  })
}

export async function listOrgAuditLogs(
  organizationId: string,
  options: { limit: number; cursor?: string },
) {
  const rows = await prisma.auditLog.findMany({
    where: { organizationId },
    take: options.limit + 1,
    ...(options.cursor
      ? { cursor: { id: options.cursor }, skip: 1 }
      : {}),
    orderBy: { createdAt: 'desc' },
    include: {
      actor: {
        select: { id: true, login: true, name: true, avatarUrl: true },
      },
    },
  })

  const hasMore = rows.length > options.limit
  const items = hasMore ? rows.slice(0, options.limit) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined

  return { items, nextCursor }
}
