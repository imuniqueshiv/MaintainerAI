import Redis from 'ioredis'
import { getConfig } from '@/server/config'
import { logger } from '@/server/logger'
import { onShutdown } from '@/server/utils/shutdown'

const globalForRedis = globalThis as unknown as {
  redis?: Redis
}

function createRedisClient(): Redis | null {
  const { redis } = getConfig()
  if (!redis.url) {
    logger.warn('REDIS_URL is not configured — Redis client unavailable')
    return null
  }

  const client = new Redis(redis.url, {
    maxRetriesPerRequest: null,
    enableReadyCheck: true,
    lazyConnect: true,
    retryStrategy(times) {
      return Math.min(times * 200, 5_000)
    },
  })

  client.on('connect', () => logger.info('Redis connecting'))
  client.on('ready', () => logger.info('Redis ready'))
  client.on('error', (error) => logger.error({ err: error }, 'Redis error'))
  client.on('close', () => logger.warn('Redis connection closed'))

  onShutdown(async () => {
    if (client.status !== 'end') {
      await client.quit()
    }
  })

  return client
}

export function getRedis(): Redis | null {
  if (globalForRedis.redis) return globalForRedis.redis
  const client = createRedisClient()
  if (client) {
    globalForRedis.redis = client
  }
  return client
}

export async function ensureRedisConnected(): Promise<Redis> {
  const client = getRedis()
  if (!client) {
    throw new Error('REDIS_URL is not configured')
  }
  if (client.status === 'wait' || client.status === 'end') {
    await client.connect()
  }
  return client
}

export async function checkRedisHealth(): Promise<{
  ok: boolean
  latencyMs: number
  error?: string
}> {
  if (!getConfig().redis.configured) {
    return { ok: false, latencyMs: 0, error: 'REDIS_URL not configured' }
  }

  const started = Date.now()
  try {
    const client = await ensureRedisConnected()
    const pong = await client.ping()
    return {
      ok: pong === 'PONG',
      latencyMs: Date.now() - started,
      error: pong === 'PONG' ? undefined : `Unexpected PING response: ${pong}`,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Redis error'
    logger.error({ err: error }, 'Redis health check failed')
    return { ok: false, latencyMs: Date.now() - started, error: message }
  }
}

export async function disconnectRedis(): Promise<void> {
  const client = globalForRedis.redis
  if (!client) return
  if (client.status !== 'end') {
    await client.quit()
  }
  globalForRedis.redis = undefined
}

/** Typed cache helpers for future session/caching use. */
export const cache = {
  async get(key: string): Promise<string | null> {
    const client = await ensureRedisConnected()
    return client.get(key)
  },
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const client = await ensureRedisConnected()
    if (ttlSeconds && ttlSeconds > 0) {
      await client.set(key, value, 'EX', ttlSeconds)
      return
    }
    await client.set(key, value)
  },
  async del(key: string): Promise<void> {
    const client = await ensureRedisConnected()
    await client.del(key)
  },
}
