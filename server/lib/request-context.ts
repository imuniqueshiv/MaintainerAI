import { randomUUID } from 'node:crypto'
import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from '@/server/constants'

export type RequestContext = {
  requestId: string
  correlationId: string
}

export function createRequestContext(headers: Headers): RequestContext {
  const requestId = headers.get(REQUEST_ID_HEADER)?.trim() || randomUUID()
  const correlationId = headers.get(CORRELATION_ID_HEADER)?.trim() || requestId

  return { requestId, correlationId }
}

export function contextHeaders(ctx: RequestContext): HeadersInit {
  return {
    [REQUEST_ID_HEADER]: ctx.requestId,
    [CORRELATION_ID_HEADER]: ctx.correlationId,
  }
}
