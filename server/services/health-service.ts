import { getConfig } from '@/server/config'
import { checkDatabaseHealth } from '@/server/db/prisma'
import { checkRedisHealth } from '@/server/cache/redis'
import { checkQueueHealth } from '@/server/queue/queues'

export type DependencyStatus = {
  status: 'ok' | 'degraded' | 'down' | 'unconfigured'
  latencyMs?: number
  error?: string
  details?: Record<string, unknown>
}

export type HealthReport = {
  status: 'ok' | 'degraded' | 'down'
  service: string
  version: string
  environment: string
  timestamp: string
  uptimeSeconds: number
  checks: {
    configuration: DependencyStatus
    database: DependencyStatus
    redis: DependencyStatus
    queue: DependencyStatus
  }
}

function mapCheck(
  result: { ok: boolean; latencyMs: number; error?: string; counts?: Record<string, number> },
  configured: boolean,
): DependencyStatus {
  if (!configured) {
    return { status: 'unconfigured', error: result.error }
  }
  if (result.ok) {
    return {
      status: 'ok',
      latencyMs: result.latencyMs,
      details: result.counts ? { counts: result.counts } : undefined,
    }
  }
  return {
    status: 'down',
    latencyMs: result.latencyMs,
    error: result.error,
  }
}

export async function getHealthReport(): Promise<HealthReport> {
  const config = getConfig()

  const configuration: DependencyStatus = {
    status: config.database.configured && config.redis.configured ? 'ok' : 'degraded',
    details: {
      databaseConfigured: config.database.configured,
      redisConfigured: config.redis.configured,
      features: config.features,
    },
    error:
      config.database.configured && config.redis.configured
        ? undefined
        : 'One or more infrastructure URLs are not configured',
  }

  const [database, redis, queue] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth(),
    checkQueueHealth(),
  ])

  const checks = {
    configuration,
    database: mapCheck(database, config.database.configured),
    redis: mapCheck(redis, config.redis.configured),
    queue: mapCheck(queue, config.redis.configured),
  }

  const values = Object.values(checks).map((c) => c.status)
  let status: HealthReport['status'] = 'ok'
  if (values.includes('down')) status = 'down'
  else if (values.includes('degraded') || values.includes('unconfigured')) {
    status = 'degraded'
  }

  return {
    status,
    service: config.app.name,
    version: config.app.version,
    environment: config.appEnv,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    checks,
  }
}

export async function getReadiness(): Promise<{
  ready: boolean
  report: HealthReport
}> {
  const report = await getHealthReport()
  const ready =
    report.checks.database.status === 'ok' &&
    report.checks.redis.status === 'ok' &&
    report.checks.queue.status === 'ok'
  return { ready, report }
}

export function getLiveness() {
  const config = getConfig()
  return {
    alive: true,
    service: config.app.name,
    version: config.app.version,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  }
}
