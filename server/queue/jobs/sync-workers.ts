import type { Job } from 'bullmq'
import { Worker } from 'bullmq'
import { getConfig } from '@/server/config'
import { JOB_NAMES, QUEUE_NAMES } from '@/server/constants'
import { getQueueConnection } from '@/server/queue/connection'
import { getQueue } from '@/server/queue/queues'
import { createLogger } from '@/server/logger'
import * as jobs from '@/server/sync/jobs'
import type { SyncJobData } from '@/server/sync/types'
import { runRepositorySync } from '@/server/sync/sync-repository'
import { runIssuesSync } from '@/server/sync/sync-issues'
import { runPullsSync } from '@/server/sync/sync-pulls'
import { runLabelsSync } from '@/server/sync/sync-labels'
import { runMilestonesSync } from '@/server/sync/sync-milestones'
import { runReleasesSync } from '@/server/sync/sync-releases'
import { runContributorsSync } from '@/server/sync/sync-contributors'
import { runBranchesSync } from '@/server/sync/sync-branches'
import { runStatisticsSync } from '@/server/sync/sync-statistics'

const log = createLogger({ component: 'sync.workers' })

type SyncQueueDefinition = {
  queue: string
  jobName: string
  concurrency: number
  handler: (data: SyncJobData) => Promise<void>
}

const SYNC_QUEUE_DEFINITIONS: SyncQueueDefinition[] = [
  {
    queue: QUEUE_NAMES.SYNC_REPOSITORIES,
    jobName: JOB_NAMES.SYNC_REPOSITORY_RUN,
    concurrency: 3,
    handler: runRepositorySync,
  },
  {
    queue: QUEUE_NAMES.SYNC_ISSUES,
    jobName: JOB_NAMES.SYNC_ISSUES_RUN,
    concurrency: 2,
    handler: runIssuesSync,
  },
  {
    queue: QUEUE_NAMES.SYNC_PULL_REQUESTS,
    jobName: JOB_NAMES.SYNC_PULL_REQUESTS_RUN,
    concurrency: 2,
    handler: runPullsSync,
  },
  {
    queue: QUEUE_NAMES.SYNC_LABELS,
    jobName: JOB_NAMES.SYNC_LABELS_RUN,
    concurrency: 2,
    handler: runLabelsSync,
  },
  {
    queue: QUEUE_NAMES.SYNC_MILESTONES,
    jobName: JOB_NAMES.SYNC_MILESTONES_RUN,
    concurrency: 2,
    handler: runMilestonesSync,
  },
  {
    queue: QUEUE_NAMES.SYNC_RELEASES,
    jobName: JOB_NAMES.SYNC_RELEASES_RUN,
    concurrency: 2,
    handler: runReleasesSync,
  },
  {
    queue: QUEUE_NAMES.SYNC_CONTRIBUTORS,
    jobName: JOB_NAMES.SYNC_CONTRIBUTORS_RUN,
    concurrency: 1,
    handler: runContributorsSync,
  },
  {
    queue: QUEUE_NAMES.SYNC_BRANCHES,
    jobName: JOB_NAMES.SYNC_BRANCHES_RUN,
    concurrency: 1,
    handler: runBranchesSync,
  },
  {
    queue: QUEUE_NAMES.SYNC_STATISTICS,
    jobName: JOB_NAMES.SYNC_STATISTICS_RUN,
    concurrency: 3,
    handler: runStatisticsSync,
  },
]

let workers: Worker<SyncJobData>[] = []

function buildWorker(def: SyncQueueDefinition): Worker<SyncJobData> {
  const worker = new Worker<SyncJobData>(
    def.queue,
    async (job: Job<SyncJobData>) => {
      if (job.name !== def.jobName) return
      await def.handler(job.data)
    },
    {
      connection: getQueueConnection() as never,
      prefix: getConfig().queue.prefix,
      concurrency: def.concurrency,
    },
  )

  worker.on('failed', (job, error) => {
    if (!job) return
    log.error(
      { err: error, jobId: job.id, queue: def.queue, attemptsMade: job.attemptsMade },
      'Sync job attempt failed',
    )

    const maxAttempts = job.opts.attempts ?? 1
    if (job.attemptsMade >= maxAttempts) {
      void handlePermanentFailure(job, error)
    }
  })

  return worker
}

async function handlePermanentFailure(job: Job<SyncJobData>, error: unknown) {
  try {
    await jobs.markFailed(job.data.syncJobId, error)
  } catch (err) {
    log.error({ err }, 'Failed to mark sync job as permanently failed')
  }

  try {
    const deadletterQueue = getQueue(QUEUE_NAMES.SYNC_DEADLETTER)
    await deadletterQueue.add(
      JOB_NAMES.SYNC_DEADLETTER_RUN,
      {
        syncJobId: job.data.syncJobId,
        repositoryId: job.data.repositoryId,
        originalQueue: job.queueName,
        originalJobName: job.name,
        error: error instanceof Error ? error.message : String(error),
        attemptsMade: job.attemptsMade,
        failedAt: new Date().toISOString(),
      },
      { removeOnComplete: false, removeOnFail: false },
    )
  } catch (err) {
    log.error({ err }, 'Failed to enqueue sync deadletter job')
  }
}

/** Start every sync.* worker. Call once from the worker bootstrap process. */
export function startAllSyncWorkers(): Worker<SyncJobData>[] {
  if (!getConfig().redis.configured) {
    log.warn('Redis not configured — sync workers not started')
    return []
  }
  if (workers.length > 0) return workers

  workers = SYNC_QUEUE_DEFINITIONS.map(buildWorker)
  log.info({ queues: SYNC_QUEUE_DEFINITIONS.map((d) => d.queue) }, 'Repository sync workers started')
  return workers
}

export async function closeAllSyncWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()))
  workers = []
}
