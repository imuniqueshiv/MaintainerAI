import { getConfig } from '@/server/config'

export const SESSION_COOKIE_NAME = 'authjs.session-token'
export const SECURE_SESSION_COOKIE_NAME = '__Secure-authjs.session-token'
export const CSRF_COOKIE_NAME = 'authjs.csrf-token'
export const SECURE_CSRF_COOKIE_NAME = '__Host-authjs.csrf-token'

/** Auth.js cookie name for the current environment. */
export function sessionCookieName(): string {
  const { isProd } = getConfig()
  return isProd ? SECURE_SESSION_COOKIE_NAME : SESSION_COOKIE_NAME
}

export function csrfCookieName(): string {
  const { isProd } = getConfig()
  return isProd ? SECURE_CSRF_COOKIE_NAME : CSRF_COOKIE_NAME
}

export type SessionCookieOptions = {
  httpOnly: true
  sameSite: 'lax'
  path: '/'
  secure: boolean
  maxAge: number
}

export function sessionCookieOptions(maxAgeSeconds?: number): SessionCookieOptions {
  const config = getConfig()
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: config.isProd,
    maxAge: maxAgeSeconds ?? config.auth.sessionMaxAgeSeconds,
  }
}
