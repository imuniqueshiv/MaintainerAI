import { describe, it, expect, beforeEach } from 'vitest'
import { getLiveness, getHealthReport } from '@/server/services/health-service'
import { resetConfigForTests } from '@/server/config'

describe('health service', () => {
  beforeEach(() => {
    process.env.SKIP_ENV_VALIDATION = '1'
    delete process.env.DATABASE_URL
    delete process.env.REDIS_URL
    resetConfigForTests()
  })

  it('reports liveness without dependencies', () => {
    const live = getLiveness()
    expect(live.alive).toBe(true)
    expect(live.service).toBe('MaintainerAI')
  })

  it('reports degraded/unconfigured when infra URLs missing', async () => {
    const report = await getHealthReport()
    expect(['degraded', 'down']).toContain(report.status)
    expect(report.checks.database.status).toBe('unconfigured')
    expect(report.checks.redis.status).toBe('unconfigured')
  })
})
