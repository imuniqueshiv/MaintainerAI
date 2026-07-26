import type { NextRequest } from 'next/server'
import { failure, success } from '@/server/lib/api-response'
import { contextHeaders, createRequestContext } from '@/server/lib/request-context'
import { createLogger } from '@/server/logger'
import { applyCorsHeaders, applySecurityHeaders } from '@/server/security/headers'
import { getClientIp } from '@/server/security/client-ip'
import { assertRateLimit } from '@/server/security/rate-limit'
import { registerProcessErrorHandlers } from '@/server/errors/error-handler'

export type ApiHandlerContext = {
  request: NextRequest
  requestId: string
  correlationId: string
  log: ReturnType<typeof createLogger>
}

export type ApiHandler = (ctx: ApiHandlerContext) => Promise<Response> | Response

/**
 * Compose request-id, security headers, CORS, rate limit, logging, and errors.
 */
export function withApi(
  handler: ApiHandler,
  options?: { rateLimit?: boolean; skipRateLimit?: boolean },
) {
  registerProcessErrorHandlers()

  return async (request: NextRequest): Promise<Response> => {
    const ctxIds = createRequestContext(request.headers)
    const log = createLogger({
      requestId: ctxIds.requestId,
      correlationId: ctxIds.correlationId,
      method: request.method,
      path: new URL(request.url).pathname,
    })

    const started = Date.now()

    try {
      if (request.method === 'OPTIONS') {
        const headers = new Headers(contextHeaders(ctxIds))
        applySecurityHeaders(headers)
        applyCorsHeaders(request, headers)
        return new Response(null, { status: 204, headers })
      }

      const shouldRateLimit = options?.rateLimit !== false && !options?.skipRateLimit
      if (shouldRateLimit) {
        const ip = getClientIp(request)
        await assertRateLimit(`${ip}:${new URL(request.url).pathname}`)
      }

      const response = await handler({
        request,
        requestId: ctxIds.requestId,
        correlationId: ctxIds.correlationId,
        log,
      })

      const headers = new Headers(response.headers)
      for (const [k, v] of Object.entries(contextHeaders(ctxIds))) {
        headers.set(k, v)
      }
      applySecurityHeaders(headers)
      applyCorsHeaders(request, headers)

      log.info({ status: response.status, durationMs: Date.now() - started }, 'Request completed')

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      })
    } catch (error) {
      log.error({ err: error, durationMs: Date.now() - started }, 'Request failed')
      const errResponse = failure(error, ctxIds.requestId)
      const headers = new Headers(errResponse.headers)
      for (const [k, v] of Object.entries(contextHeaders(ctxIds))) {
        headers.set(k, v)
      }
      applySecurityHeaders(headers)
      applyCorsHeaders(request, headers)
      return new Response(errResponse.body, {
        status: errResponse.status,
        headers,
      })
    }
  }
}

/** Helper for simple JSON success handlers. */
export function withApiData<T>(
  loader: (ctx: ApiHandlerContext) => Promise<T> | T,
  init?: { status?: number; rateLimit?: boolean },
) {
  return withApi(
    async (ctx) => {
      const data = await loader(ctx)
      return success(data, { status: init?.status })
    },
    { rateLimit: init?.rateLimit },
  )
}
