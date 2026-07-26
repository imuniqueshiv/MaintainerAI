import { describe, it, expect, beforeEach } from 'vitest'
import { GET as getLive } from '@/app/api/live/route'
import { GET as getMeta } from '@/app/api/v1/meta/route'
import { GET as getHealth } from '@/app/api/health/route'
import { resetConfigForTests } from '@/server/config'
import { NextRequest } from 'next/server'

function makeRequest(path: string) {
  return new NextRequest(`http://localhost:3000${path}`, { method: 'GET' })
}

describe('health API routes (integration-lite)', () => {
  beforeEach(() => {
    process.env.SKIP_ENV_VALIDATION = '1'
    delete process.env.DATABASE_URL
    delete process.env.REDIS_URL
    resetConfigForTests()
  })

  it('GET /api/live returns alive payload', async () => {
    const response = await getLive(makeRequest('/api/live'))
    expect(response.status).toBe(200)
    expect(response.headers.get('x-request-id')).toBeTruthy()
    const body = await response.json()
    expect(body.data.alive).toBe(true)
  })

  it('GET /api/v1/meta returns feature flags', async () => {
    const response = await getMeta(makeRequest('/api/v1/meta'))
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.data.features.infrastructure).toBe(true)
    expect(body.data.features.auth).toBe(false)
  })

  it('GET /api/health returns structured checks when infra missing', async () => {
    const response = await getHealth(makeRequest('/api/health'))
    expect([200, 503]).toContain(response.status)
    const body = await response.json()
    expect(body.data.checks.database.status).toBe('unconfigured')
    expect(body.data.checks.redis.status).toBe('unconfigured')
  })
})
