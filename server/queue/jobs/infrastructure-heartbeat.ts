import { Worker, type Job, type Processor } from 'bullmq'
import { getConfig } from '@/server/config'
import { JOB_NAMES, QUEUE_NAMES } from '@/server/constants'
import { getQueueConnection } from '@/server/queue/connection'
import { logger } from '@/server/logger'
import { onShutdown } from '@/server/utils/shutdown'

const workers: Worker[] = []

export type HeartbeatJobData = {
  enqueuedAt: string
  source: string
}

const heartbeatProcessor: Processor<HeartbeatJobData> = async (job: Job<HeartbeatJobData>) => {
  const log = logger.child({
    jobId: job.id,
    jobName: job.name,
    queue: QUEUE_NAMES.INFRASTRUCTURE,
  })
  log.info({ data: job.data }, 'Infrastructure heartbeat job started')
  // Example infrastructure job only — no business logic.
  await new Promise((resolve) => setTimeout(resolve, 25))
  log.info('Infrastructure heartbeat job completed')
  return {
    ok: true,
    processedAt: new Date().toISOString(),
    enqueuedAt: job.data.enqueuedAt,
  }
}

export function startInfrastructureWorker(): Worker {
  const { queue } = getConfig()
  const worker = new Worker(
    QUEUE_NAMES.INFRASTRUCTURE,
    async (job) => {
      if (job.name === JOB_NAMES.HEARTBEAT) {
        return heartbeatProcessor(job as Job<HeartbeatJobData>)
      }
      logger.warn({ jobName: job.name }, 'Unknown infrastructure job — skipping')
      return { skipped: true }
    },
    {
      connection: getQueueConnection(),
      prefix: queue.prefix,
      concurrency: queue.concurrency,
    },
  )

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id, jobName: job.name }, 'Job completed')
  })
  worker.on('failed', (job, error) => {
    logger.error({ err: error, jobId: job?.id, jobName: job?.name }, 'Job failed')
  })
  worker.on('error', (error) => {
    logger.error({ err: error }, 'Worker error')
  })

  workers.push(worker)
  onShutdown(async () => {
    await worker.close()
  })

  logger.info(
    { queue: QUEUE_NAMES.INFRASTRUCTURE, concurrency: queue.concurrency },
    'Infrastructure worker started',
  )
  return worker
}

export async function closeAllWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()))
  workers.length = 0
}
