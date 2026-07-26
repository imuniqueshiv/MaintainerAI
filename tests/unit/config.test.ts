import { describe, it, expect, beforeEach } from 'vitest'
import { parseEnv, assertInfrastructureEnv } from '@/server/config/env'
import { getConfig, resetConfigForTests } from '@/server/config'

describe('configuration', () => {
  beforeEach(() => {
    resetConfigForTests()
    delete process.env.MAINTAINERAI_WORKER
  })

  it('parses defaults for application env', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })
    expect(env.NODE_ENV).toBe('development')
    expect(env.PORT).toBe(3000)
    expect(env.QUEUE_PREFIX).toBe('maintainerai')
  })

  it('rejects invalid APP URL', () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_APP_URL: 'not-a-url',
      }),
    ).toThrow(/Invalid environment/)
  })

  it('assertInfrastructureEnv throws when INFRASTRUCTURE_STRICT and missing URLs', () => {
    const env = parseEnv({
      NODE_ENV: 'development',
      INFRASTRUCTURE_STRICT: 'true',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })
    expect(() => assertInfrastructureEnv(env)).toThrow(/DATABASE_URL/)
  })

  it('assertInfrastructureEnv throws for worker process when URLs missing', () => {
    Object.assign(process.env, { MAINTAINERAI_WORKER: '1' })
    const env = parseEnv({
      NODE_ENV: 'production',
      NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
    })
    expect(() => assertInfrastructureEnv(env)).toThrow(/REDIS_URL/)
  })

  it('getConfig exposes feature flags for Phase 1', () => {
    process.env.SKIP_ENV_VALIDATION = '1'
    const config = getConfig()
    expect(config.features.infrastructure).toBe(true)
    expect(config.features.auth).toBe(false)
    expect(config.features.githubApp).toBe(false)
  })
})
