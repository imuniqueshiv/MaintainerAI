import { CORRELATION_ID_HEADER, REQUEST_ID_HEADER } from '@/server/constants'
import { getConfig } from '@/server/config'

/**
 * Apply CORS headers based on `CORS_ORIGIN` configuration.
 * Use `*` only for local/dev; prefer explicit origins in production.
 */
export function applyCorsHeaders(request: Request, headers: Headers): void {
  const { corsOrigin } = getConfig().security
  const origin = request.headers.get('origin')

  if (corsOrigin === '*') {
    headers.set('Access-Control-Allow-Origin', '*')
  } else if (origin) {
    const allowed = corsOrigin.split(',').map((value) => value.trim())
    if (allowed.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin)
      headers.set('Vary', 'Origin')
    }
  }

  headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
  headers.set(
    'Access-Control-Allow-Headers',
    [
      'Content-Type',
      'Authorization',
      REQUEST_ID_HEADER,
      CORRELATION_ID_HEADER,
      'Idempotency-Key',
    ].join(', '),
  )
  headers.set(
    'Access-Control-Expose-Headers',
    [REQUEST_ID_HEADER, CORRELATION_ID_HEADER].join(', '),
  )
  headers.set('Access-Control-Max-Age', '86400')
}
