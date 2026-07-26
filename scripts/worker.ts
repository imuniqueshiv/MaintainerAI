import { registerProcessErrorHandlers } from '../server/errors/error-handler'
import { getConfig } from '../server/config'
import { logger } from '../server/logger'
import { registerShutdownHandlers, onShutdown } from '../server/utils/shutdown'
import { startInfrastructureWorker } from '../server/queue/workers'
import { closeAllQueues } from '../server/queue/queues'
import { closeQueueConnection } from '../server/queue/connection'
import { disconnectPrisma } from '../server/db/prisma'
import { disconnectRedis } from '../server/cache/redis'
import { getInfrastructureQueue } from '../server/queue/queues'
import { JOB_NAMES } from '../server/constants'

process.env.MAINTAINERAI_WORKER = '1'

async function main() {
  registerProcessErrorHandlers()
  registerShutdownHandlers()

  const config = getConfig()
  if (!config.database.configured || !config.redis.configured) {
    throw new Error(
      'Worker requires DATABASE_URL and REDIS_URL. See .env.example and docs/infrastructure.md.',
    )
  }

  logger.info(
    {
      env: config.appEnv,
      concurrency: config.queue.concurrency,
      prefix: config.queue.prefix,
    },
    'Starting MaintainerAI worker',
  )

  startInfrastructureWorker()

  // Schedule a repeating infrastructure heartbeat (example job only).
  const queue = getInfrastructureQueue()
  await queue.add(
    JOB_NAMES.HEARTBEAT,
    { enqueuedAt: new Date().toISOString(), source: 'worker-boot' },
    {
      repeat: { every: 60_000 },
      jobId: 'infrastructure-heartbeat-repeat',
    },
  )

  onShutdown(async () => {
    await closeAllQueues()
    await closeQueueConnection()
    await disconnectRedis()
    await disconnectPrisma()
  })

  logger.info('Worker is running')
}

main().catch((error) => {
  logger.fatal({ err: error }, 'Worker failed to start')
  process.exit(1)
})
