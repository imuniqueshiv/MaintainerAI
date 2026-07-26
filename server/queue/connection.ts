import IORedis from 'ioredis'
import { getConfig } from '@/server/config'
import { logger } from '@/server/logger'

let sharedConnection: IORedis | null = null

/**
 * BullMQ requires a dedicated Redis connection with maxRetriesPerRequest: null.
 */
export function getQueueConnection(): IORedis {
  if (sharedConnection) return sharedConnection

  const { redis } = getConfig()
  if (!redis.url) {
    throw new Error('REDIS_URL is required for BullMQ')
  }

  sharedConnection = new IORedis(redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: false,
  })

  sharedConnection.on('error', (error) => {
    logger.error({ err: error }, 'BullMQ Redis connection error')
  })

  return sharedConnection
}

export async function closeQueueConnection(): Promise<void> {
  if (!sharedConnection) return
  await sharedConnection.quit()
  sharedConnection = null
}
