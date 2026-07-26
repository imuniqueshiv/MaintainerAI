import { getConfig } from '@/server/config'
import { AppError } from '@/server/errors/app-error'
import { getRedis } from '@/server/cache/redis'
import { logger } from '@/server/logger'

type Counter = { count: number; resetAt: number }

const memoryBuckets = new Map<string, Counter>()

/**
 * Rate-limit infrastructure.
 * Uses Redis when available; falls back to in-memory for local/dev.
 * Authentication is intentionally not implemented in Phase 1.
 */
export async function assertRateLimit(key: string): Promise<void> {
  const { rateLimitWindowMs, rateLimitMax } = getConfig().security
  const bucketKey = `ratelimit:${key}`

  try {
    const redis = getRedis()
    if (redis) {
      if (redis.status === 'wait') {
        await redis.connect()
      }
      const count = await redis.incr(bucketKey)
      if (count === 1) {
        await redis.pexpire(bucketKey, rateLimitWindowMs)
      }
      if (count > rateLimitMax) {
        throw AppError.rateLimited()
      }
      return
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    logger.warn({ err: error }, 'Redis rate limit failed — using memory fallback')
  }

  const now = Date.now()
  const existing = memoryBuckets.get(bucketKey)
  if (!existing || existing.resetAt <= now) {
    memoryBuckets.set(bucketKey, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    })
    return
  }

  existing.count += 1
  if (existing.count > rateLimitMax) {
    throw AppError.rateLimited()
  }
}

/** Lightweight sanitization for free-form strings (no HTML stripping library yet). */
export function sanitizePlainText(input: string, maxLength = 10_000): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').slice(0, maxLength)
}
