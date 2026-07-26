import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { parseWithSchema, formatZodError, paginationQuerySchema } from '@/server/validation'
import { AppError } from '@/server/errors/app-error'

describe('validation', () => {
  it('returns typed data for valid input', () => {
    const schema = z.object({ name: z.string().min(1) })
    expect(parseWithSchema(schema, { name: 'MaintainerAI' })).toEqual({
      name: 'MaintainerAI',
    })
  })

  it('throws AppError.validation for invalid input', () => {
    const schema = z.object({ name: z.string().min(1) })
    try {
      parseWithSchema(schema, { name: '' })
      expect.fail('expected throw')
    } catch (error) {
      expect(error).toBeInstanceOf(AppError)
      expect((error as AppError).code).toBe('validation_error')
    }
  })

  it('formats zod issues consistently', () => {
    const result = z.object({ age: z.number() }).safeParse({ age: 'x' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issues = formatZodError(result.error)
      expect(issues[0]?.path).toBe('age')
      expect(issues[0]?.message).toBeTruthy()
    }
  })

  it('parses pagination defaults', () => {
    expect(parseWithSchema(paginationQuerySchema, {})).toEqual({
      limit: 25,
      cursor: undefined,
    })
  })
})
