import { Queue, type ConnectionOptions, type DefaultJobOptions } from 'bullmq'
import { getConfig } from '@/server/config'
import { JOB_NAMES, QUEUE_NAMES } from '@/server/constants'
import { getQueueConnection } from '@/server/queue/connection'
import { logger } from '@/server/logger'

const defaultJobOptions: DefaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 2_000,
  },
  removeOnComplete: {
    age: 24 * 60 * 60,
    count: 1_000,
  },
  removeOnFail: {
    age: 7 * 24 * 60 * 60,
  },
}

const queues = new Map<string, Queue>()

function connectionOptions(): ConnectionOptions {
  return getQueueConnection() as unknown as ConnectionOptions
}

export function getQueue(name: string): Queue {
  const existing = queues.get(name)
  if (existing) return existing

  const { queue } = getConfig()
  const q = new Queue(name, {
    connection: connectionOptions(),
    prefix: queue.prefix,
    defaultJobOptions,
  })
  queues.set(name, q)
  logger.info({ queue: name }, 'Queue registered')
  return q
}

export function getInfrastructureQueue(): Queue {
  return getQueue(QUEUE_NAMES.INFRASTRUCTURE)
}

export async function enqueueInfrastructureHeartbeat(): Promise<string> {
  const queue = getInfrastructureQueue()
  const job = await queue.add(
    JOB_NAMES.HEARTBEAT,
    {
      enqueuedAt: new Date().toISOString(),
      source: 'api',
    },
    {
      jobId: `heartbeat-${Date.now()}`,
    },
  )
  return job.id ?? 'unknown'
}

export async function checkQueueHealth(): Promise<{
  ok: boolean
  latencyMs: number
  error?: string
  counts?: Record<string, number>
}> {
  if (!getConfig().redis.configured) {
    return { ok: false, latencyMs: 0, error: 'REDIS_URL not configured' }
  }

  const started = Date.now()
  try {
    const queue = getInfrastructureQueue()
    const counts = await queue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed',
      'paused',
    )
    return {
      ok: true,
      latencyMs: Date.now() - started,
      counts,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown queue error'
    logger.error({ err: error }, 'Queue health check failed')
    return { ok: false, latencyMs: Date.now() - started, error: message }
  }
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all([...queues.values()].map((q) => q.close()))
  queues.clear()
}
