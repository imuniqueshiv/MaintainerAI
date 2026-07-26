import { describe, it, expect } from 'vitest'
import { AppError, isAppError } from '@/server/errors/app-error'
import { formatError } from '@/server/errors/error-handler'

describe('errors', () => {
  it('creates operational AppError with mapped status', () => {
    const error = AppError.notFound('Missing')
    expect(isAppError(error)).toBe(true)
    expect(error.statusCode).toBe(404)
    expect(error.code).toBe('not_found')
    expect(error.isOperational).toBe(true)
  })

  it('formats AppError into API envelope', () => {
    const formatted = formatError(AppError.validation('Bad', { field: 'x' }), 'req_1')
    expect(formatted.statusCode).toBe(422)
    expect(formatted.body.error.code).toBe('validation_error')
    expect(formatted.body.error.requestId).toBe('req_1')
    expect(formatted.body.error.details).toEqual({ field: 'x' })
  })

  it('formats unknown errors as internal_error', () => {
    const formatted = formatError(new Error('boom'))
    expect(formatted.statusCode).toBe(500)
    expect(formatted.body.error.code).toBe('internal_error')
  })
})
