import { getConfig } from '@/server/config'
import { AppError, isAppError } from '@/server/errors/app-error'
import { logger } from '@/server/logger'
import type { ApiErrorBody } from '@/server/lib/api-response'

export type FormattedError = {
  statusCode: number
  body: ApiErrorBody
}

export function formatError(error: unknown, requestId?: string): FormattedError {
  const { isProd, isDev } = getConfig()

  if (isAppError(error)) {
    if (!error.isOperational) {
      logger.error({ err: error, requestId }, 'Non-operational application error')
    } else if (error.statusCode >= 500) {
      logger.error({ err: error, requestId }, error.message)
    } else {
      logger.warn({ err: error, requestId, code: error.code }, error.message)
    }

    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details ?? {},
          ...(requestId ? { requestId } : {}),
          ...(isDev && error.stack ? { stack: error.stack } : {}),
        },
      },
    }
  }

  logger.error({ err: error, requestId }, 'Unhandled error')

  const message = isProd || !(error instanceof Error) ? 'Internal server error' : error.message

  return {
    statusCode: 500,
    body: {
      error: {
        code: 'internal_error',
        message,
        details: {},
        ...(requestId ? { requestId } : {}),
        ...(isDev && error instanceof Error && error.stack ? { stack: error.stack } : {}),
      },
    },
  }
}

let processHandlersRegistered = false

export function registerProcessErrorHandlers(): void {
  if (processHandlersRegistered || process.env.NEXT_RUNTIME === 'edge') return
  processHandlersRegistered = true

  process.on('unhandledRejection', (reason) => {
    logger.error({ err: reason }, 'Unhandled promise rejection')
  })

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught exception')
    // Allow process managers to restart; avoid hanging open handles in workers.
    if (process.env.MAINTAINERAI_WORKER === '1') {
      process.exit(1)
    }
  })
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error
  if (error instanceof Error) {
    return AppError.internal(error.message, { name: error.name })
  }
  return AppError.internal('Unknown error')
}
