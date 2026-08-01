import type { Installation, Repository } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'

export type SyncRepository = Repository & { installation: Installation }

/** Load a connected repository with its installation, or throw not-found. */
export async function loadSyncRepository(repositoryId: string): Promise<SyncRepository> {
  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, deletedAt: null },
    include: { installation: true },
  })
  if (!repo) throw AppError.notFound('Repository not found')
  return repo
}
