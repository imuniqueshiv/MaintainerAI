import { describe, it, expect, beforeEach } from 'vitest'
import { getClientIp } from '@/server/security/client-ip'
import { resetConfigForTests } from '@/server/config'

describe('client ip / trust proxy', () => {
  beforeEach(() => {
    resetConfigForTests()
    process.env.SKIP_ENV_VALIDATION = '1'
    delete process.env.TRUST_PROXY
  })

  it('ignores forwarded headers when TRUST_PROXY is false', () => {
    process.env.TRUST_PROXY = 'false'
    resetConfigForTests()
    const request = new Request('http://localhost/api/health', {
      headers: { 'x-forwarded-for': '203.0.113.10' },
    })
    expect(getClientIp(request)).toBe('anonymous')
  })

  it('uses X-Forwarded-For when TRUST_PROXY is true', () => {
    process.env.TRUST_PROXY = 'true'
    resetConfigForTests()
    const request = new Request('http://localhost/api/health', {
      headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' },
    })
    expect(getClientIp(request)).toBe('203.0.113.10')
  })
})
