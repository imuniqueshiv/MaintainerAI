export type ErrorCode =
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation_error'
  | 'rate_limited'
  | 'internal_error'
  | 'service_unavailable'
  | 'dependency_failure'

const statusByCode: Record<ErrorCode, number> = {
  bad_request: 400,
  unauthorized: 401,
  forbidden: 403,
  not_found: 404,
  conflict: 409,
  validation_error: 422,
  rate_limited: 429,
  internal_error: 500,
  service_unavailable: 503,
  dependency_failure: 503,
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number
  readonly isOperational: boolean
  readonly details?: unknown

  constructor(
    code: ErrorCode,
    message: string,
    options?: {
      statusCode?: number
      isOperational?: boolean
      details?: unknown
      cause?: unknown
    },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined)
    this.name = 'AppError'
    this.code = code
    this.statusCode = options?.statusCode ?? statusByCode[code]
    this.isOperational = options?.isOperational ?? true
    this.details = options?.details
    Object.setPrototypeOf(this, new.target.prototype)
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError('bad_request', message, { details })
  }

  static unauthorized(message = 'Authentication required') {
    return new AppError('unauthorized', message)
  }

  static forbidden(message = 'Forbidden') {
    return new AppError('forbidden', message)
  }

  static notFound(message = 'Resource not found') {
    return new AppError('not_found', message)
  }

  static conflict(message: string, details?: unknown) {
    return new AppError('conflict', message, { details })
  }

  static validation(message: string, details?: unknown) {
    return new AppError('validation_error', message, { details })
  }

  static rateLimited(message = 'Too many requests') {
    return new AppError('rate_limited', message)
  }

  static internal(message = 'Internal server error', details?: unknown) {
    return new AppError('internal_error', message, {
      isOperational: false,
      details,
    })
  }

  static serviceUnavailable(message: string, details?: unknown) {
    return new AppError('service_unavailable', message, { details })
  }

  static dependencyFailure(message: string, details?: unknown) {
    return new AppError('dependency_failure', message, { details })
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}
