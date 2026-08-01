import type { Prisma, SyncCheckpoint, SyncEntityType } from '@prisma/client'
import { prisma } from '@/server/db/prisma'

export async function getCheckpoint(
  repositoryId: string,
  entity: SyncEntityType,
): Promise<SyncCheckpoint | null> {
  return prisma.syncCheckpoint.findUnique({
    where: { repositoryId_entity: { repositoryId, entity } },
  })
}

/**
 * Ensure a checkpoint row exists, resetting cursor/page for full syncs so
 * pagination restarts from page 1 even if a previous run had completed.
 * Incomplete checkpoints are never reset — jobs resume after SYNC_MAX_PAGES chunks.
 */
export async function startCheckpoint(
  repositoryId: string,
  entity: SyncEntityType,
  options: { reset: boolean },
): Promise<SyncCheckpoint> {
  const existing = await getCheckpoint(repositoryId, entity)
  const reset = options.reset && (existing == null || existing.completed === true)

  return prisma.syncCheckpoint.upsert({
    where: { repositoryId_entity: { repositoryId, entity } },
    create: {
      repositoryId,
      entity,
      page: 1,
      completed: false,
    },
    update: reset
      ? { page: 1, cursor: null, completed: false }
      : { completed: false },
  })
}

export async function advanceCheckpoint(
  repositoryId: string,
  entity: SyncEntityType,
  data: { page: number; cursor?: string | null; since?: Date; metadata?: Prisma.InputJsonValue },
): Promise<void> {
  await prisma.syncCheckpoint.upsert({
    where: { repositoryId_entity: { repositoryId, entity } },
    create: {
      repositoryId,
      entity,
      page: data.page,
      cursor: data.cursor ?? null,
      since: data.since,
      metadata: data.metadata,
      lastSuccessAt: new Date(),
    },
    update: {
      page: data.page,
      cursor: data.cursor ?? undefined,
      since: data.since,
      metadata: data.metadata,
      lastSuccessAt: new Date(),
    },
  })
}

export async function completeCheckpoint(
  repositoryId: string,
  entity: SyncEntityType,
  since?: Date,
): Promise<void> {
  await prisma.syncCheckpoint.upsert({
    where: { repositoryId_entity: { repositoryId, entity } },
    create: {
      repositoryId,
      entity,
      page: 1,
      completed: true,
      since: since ?? new Date(),
      lastSuccessAt: new Date(),
    },
    update: {
      completed: true,
      since: since ?? new Date(),
      lastSuccessAt: new Date(),
    },
  })
}

export async function listCheckpoints(repositoryId: string): Promise<SyncCheckpoint[]> {
  return prisma.syncCheckpoint.findMany({
    where: { repositoryId },
    orderBy: { entity: 'asc' },
  })
}
