import { getConfig } from '@/server/config'

/**
 * Resolve client identity for rate limiting.
 * Only trusts `X-Forwarded-For` / `X-Real-IP` when `TRUST_PROXY=true`.
 */
export function getClientIp(request: Request): string {
  const { trustProxy } = getConfig().security

  if (trustProxy) {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    if (forwarded) return forwarded

    const realIp = request.headers.get('x-real-ip')?.trim()
    if (realIp) return realIp
  }

  return 'anonymous'
}
