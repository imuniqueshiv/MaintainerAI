import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { AppError } from '@/server/errors/app-error'
import { CSRF_HEADER } from '@/server/constants'
import { getConfig } from '@/server/config'

/**
 * Double-submit CSRF helpers for non-Auth.js mutating API routes.
 * Auth.js manages its own CSRF for OAuth endpoints.
 */

export function createCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashCsrfToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function verifyCsrfToken(token: string, hash: string): boolean {
  try {
    const a = Buffer.from(hashCsrfToken(token), 'hex')
    const b = Buffer.from(hash, 'hex')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * For cookie-authenticated mutating requests, require matching CSRF header
 * when a hash cookie is present.
 */
export function assertCsrfHeader(request: Request, expectedHash: string | undefined): void {
  if (!expectedHash) {
    throw AppError.forbidden('CSRF token missing')
  }
  const header = request.headers.get(CSRF_HEADER)
  if (!header || !verifyCsrfToken(header, expectedHash)) {
    throw AppError.forbidden('Invalid CSRF token')
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

/**
 * Origin / Referer check for cookie-authenticated mutating API calls.
 * Enabled when `config.auth.csrfProtect` is true (default in production).
 *
 * SameSite=Lax already blocks most cross-site cookie sends; this adds
 * defense-in-depth for browsers/clients that still attach a session cookie.
 */
export function assertMutatingRequestOrigin(request: Request): void {
  const config = getConfig()
  if (!config.auth.csrfProtect) return
  if (!MUTATING.has(request.method.toUpperCase())) return

  const allowed = new Set<string>()
  try {
    allowed.add(new URL(config.app.url).origin)
  } catch {
    /* ignore invalid app url */
  }
  if (config.auth.url) {
    try {
      allowed.add(new URL(config.auth.url).origin)
    } catch {
      /* ignore */
    }
  }
  if (config.security.corsOrigin !== '*') {
    for (const value of config.security.corsOrigin.split(',')) {
      const trimmed = value.trim()
      if (!trimmed) continue
      try {
        allowed.add(new URL(trimmed).origin)
      } catch {
        allowed.add(trimmed)
      }
    }
  }

  const origin = request.headers.get('origin')
  if (origin) {
    if (!allowed.has(origin)) {
      throw AppError.forbidden('Cross-origin request blocked')
    }
    return
  }

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin
      if (!allowed.has(refererOrigin)) {
        throw AppError.forbidden('Cross-origin request blocked')
      }
      return
    } catch {
      throw AppError.forbidden('Invalid Referer')
    }
  }

  // Non-browser clients (curl, CI) often omit Origin/Referer — allow.
  // Browser cross-site navigations that omit both are rare with modern fetch.
  const fetchSite = request.headers.get('sec-fetch-site')
  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site' && fetchSite !== 'none') {
    throw AppError.forbidden('Cross-origin request blocked')
  }
}
