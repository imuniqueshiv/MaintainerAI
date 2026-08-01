import type { Job } from 'bullmq'
import { Worker } from 'bullmq'
import { getConfig } from '@/server/config'
import { JOB_NAMES, QUEUE_NAMES } from '@/server/constants'
import { getQueueConnection } from '@/server/queue/connection'
import { dispatchWebhookEvent } from '@/server/services/webhook-service'
import { createLogger } from '@/server/logger'

const log = createLogger({ component: 'github.webhook-worker' })

export type WebhookDispatchJob = {
  eventId: string
  deliveryId: string
  event: string
  action?: string | null
}

/**
 * Process a webhook dispatch job (also callable inline for tests / serverless fallback).
 */
export async function processWebhookDispatchJob(job: Job<WebhookDispatchJob> | WebhookDispatchJob) {
  const data = 'data' in job ? job.data : job
  await dispatchWebhookEvent(data.eventId)
}

let worker: Worker<WebhookDispatchJob> | null = null

export function startGitHubWebhookWorker(): Worker<WebhookDispatchJob> | null {
  if (!getConfig().redis.configured) {
    log.warn('Redis not configured — GitHub webhook worker not started')
    return null
  }
  if (worker) return worker

  worker = new Worker<WebhookDispatchJob>(
    QUEUE_NAMES.GITHUB_WEBHOOKS,
    async (job) => {
      if (job.name !== JOB_NAMES.WEBHOOK_DISPATCH) return
      await processWebhookDispatchJob(job)
    },
    {
      connection: getQueueConnection() as never,
      prefix: getConfig().queue.prefix,
      concurrency: 2,
    },
  )

  worker.on('failed', (job, error) => {
    log.error({ err: error, jobId: job?.id }, 'Webhook job failed')
  })

  log.info('GitHub webhook worker started')
  return worker
}
