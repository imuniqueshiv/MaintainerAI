import { getConfig } from '@/server/config'

export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-DNS-Prefetch-Control': 'off',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
}

export function applySecurityHeaders(headers: Headers): void {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value)
  }

  if (getConfig().isProd) {
    headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }
}

export { applyCorsHeaders } from '@/server/security/cors'
