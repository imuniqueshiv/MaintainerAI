import type { SyncEntityType } from '@prisma/client'
import { enqueueEntitySync } from '@/server/sync/coordinator'
import * as checkpoints from '@/server/sync/checkpoints'
import * as jobs from '@/server/sync/jobs'
import { SYNC_MAX_PAGES, type SyncJobData, type SyncMode } from '@/server/sync/types'

/**
 * Finalize an entity sync run.
 * - If GitHub still has pages beyond SYNC_MAX_PAGES, leave the checkpoint
 *   incomplete and enqueue a continuation (does not reset page on resume).
 * - Otherwise mark the checkpoint complete.
 */
export async function finishEntitySyncPages(input: {
  data: SyncJobData
  entity: SyncEntityType
  repositoryId: string
  syncStartedAt: Date
  /** True when the last fetched page reported hasNextPage. */
  hasMorePages: boolean
  /** Number of pages processed in this job (1..SYNC_MAX_PAGES). */
  pagesProcessed: number
}): Promise<void> {
  const truncated = input.hasMorePages && input.pagesProcessed >= SYNC_MAX_PAGES

  if (truncated) {
    // Complete this chunk first so the concurrency guard allows the continuation.
    await jobs.markCompleted(input.data.syncJobId)
    await enqueueEntitySync({
      repositoryId: input.repositoryId,
      entity: input.entity,
      trigger: 'system',
      mode: input.data.mode === 'delta' ? 'incremental' : input.data.mode,
    })
    return
  }

  await checkpoints.completeCheckpoint(input.repositoryId, input.entity, input.syncStartedAt)
  await jobs.markCompleted(input.data.syncJobId)
}

export function shouldResetCheckpoint(mode: SyncMode, completed: boolean | undefined): boolean {
  // Resume incomplete runs even when mode is `full`.
  if (mode === 'full') return completed !== false
  return false
}
