import { CORRELATION_ID_HEADER, CSRF_HEADER, REQUEST_ID_HEADER } from '@/server/constants'
import { getConfig } from '@/server/config'

/**
 * Apply CORS headers based on `CORS_ORIGIN` configuration.
 * Credentialed responses require an explicit origin (never `*` with credentials).
 */
export function applyCorsHeaders(request: Request, headers: Headers): void {
  const { corsOrigin } = getConfig().security
  const origin = request.headers.get('origin')

  if (corsOrigin === '*') {
    // Browsers forbid Access-Control-Allow-Credentials with `*`.
    // Same-origin app traffic does not need CORS; cross-origin cookie auth must set CORS_ORIGIN.
    headers.set('Access-Control-Allow-Origin', '*')
  } else if (origin) {
    const allowed = corsOrigin.split(',').map((value) => value.trim())
    if (allowed.includes(origin)) {
      headers.set('Access-Control-Allow-Origin', origin)
      headers.set('Access-Control-Allow-Credentials', 'true')
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
      CSRF_HEADER,
      'Idempotency-Key',
    ].join(', '),
  )
  headers.set(
    'Access-Control-Expose-Headers',
    [REQUEST_ID_HEADER, CORRELATION_ID_HEADER].join(', '),
  )
  headers.set('Access-Control-Max-Age', '86400')
}
