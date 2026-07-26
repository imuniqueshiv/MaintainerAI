import { describe, it, expect, beforeEach } from 'vitest'
import { success, failure, paginated } from '@/server/lib/api-response'
import { AppError } from '@/server/errors/app-error'
import { resetConfigForTests } from '@/server/config'

describe('api response', () => {
  beforeEach(() => {
    process.env.SKIP_ENV_VALIDATION = '1'
    resetConfigForTests()
  })

  it('wraps success payloads', async () => {
    const response = success({ ok: true }, { meta: { phase: 1 } })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toEqual({ data: { ok: true }, meta: { phase: 1 } })
  })

  it('wraps paginated payloads', async () => {
    const response = paginated([{ id: 1 }], {
      nextCursor: 'abc',
      hasNextPage: true,
    })
    const body = await response.json()
    expect(body.pageInfo.hasNextPage).toBe(true)
    expect(body.data).toHaveLength(1)
  })

  it('wraps failure payloads', async () => {
    const response = failure(AppError.forbidden('Nope'), 'rid')
    expect(response.status).toBe(403)
    const body = await response.json()
    expect(body.error.code).toBe('forbidden')
    expect(body.error.requestId).toBe('rid')
  })
})
