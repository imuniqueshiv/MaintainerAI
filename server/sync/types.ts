import type { SyncEntityType, SyncTrigger } from '@prisma/client'

/** Sync run mode — determines pagination/`since` strategy. */
export type SyncMode = 'full' | 'incremental' | 'delta'

/** Max pages fetched per entity per job run (safety cap for huge repos). */
export const SYNC_MAX_PAGES = 40

/** BullMQ job payload shared by every sync.* queue. */
export type SyncJobData = {
  syncJobId: string
  repositoryId: string
  mode: SyncMode
  /** Optional single-resource ref for webhook delta jobs (issue/PR number, branch/tag name). */
  ref?: string | number
}

/** All syncable entities, in dependency-friendly fan-out order. */
export const SYNC_ENTITIES: SyncEntityType[] = [
  'repository',
  'labels',
  'milestones',
  'issues',
  'pull_requests',
  'contributors',
  'releases',
  'branches',
  'statistics',
]

export type SyncEntityQueueMapping = {
  entity: SyncEntityType
  queue: string
  jobName: string
}

export type StartSyncInput = {
  repositoryId: string
  trigger: SyncTrigger
  mode: SyncMode
  actorUserId?: string | null
  /** Restrict fan-out to a subset of entities (defaults to all). */
  entities?: SyncEntityType[]
  ref?: string | number
}

export type CancelSyncInput = {
  repositoryId: string
  syncJobId?: string
  actorUserId?: string | null
}
