import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Lightweight edge middleware for security headers.
 * API authorization is enforced in `withAuth` / `withOrgAuth` (Node runtime).
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    response.headers.set('X-MaintainerAI-Mutating', '1')
  }

  return response
}

export const config = {
  matcher: ['/api/v1/:path*', '/onboarding', '/settings', '/organization/:path*'],
}
