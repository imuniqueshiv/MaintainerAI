import { CSRF_HEADER } from '@/server/constants'
import type { MembershipRole } from '@prisma/client'
import type { NextRequest } from 'next/server'
import { withApi, type ApiHandler, type ApiHandlerContext } from '@/server/middleware/with-api'
import { requireUser, readSessionToken, touchSession } from '@/server/auth/session'
import { requireOrgAccess, type OrgAccess } from '@/server/auth/guards'
import type { AuthUser } from '@/server/auth/rbac'
import type { Permission } from '@/server/auth/permissions'
import { getConfig } from '@/server/config'
import { success } from '@/server/lib/api-response'
import { assertMutatingRequestOrigin } from '@/server/auth/csrf'

export type AuthedApiHandlerContext = ApiHandlerContext & {
  user: AuthUser
  sessionToken?: string
}

export type OrgAuthedApiHandlerContext = AuthedApiHandlerContext & {
  org: OrgAccess
}

export type WithAuthOptions = {
  rateLimit?: boolean
  skipRateLimit?: boolean
  /** Extend DB session expiry on authenticated traffic (sliding window). */
  touchSession?: boolean
  /** Skip Origin/Referer CSRF check (rare; prefer not). */
  skipCsrf?: boolean
}

/**
 * Wrap an API handler that requires a signed-in user.
 */
export function withAuth(
  handler: (ctx: AuthedApiHandlerContext) => Promise<Response> | Response,
  options?: WithAuthOptions,
) {
  const apiHandler: ApiHandler = async (ctx) => {
    const user = await requireUser()
    const sessionToken = readSessionToken(ctx.request)

    if (!options?.skipCsrf) {
      assertMutatingRequestOrigin(ctx.request)
    }

    if (options?.touchSession !== false && sessionToken) {
      const { sessionMaxAgeSeconds } = getConfig().auth
      await touchSession(sessionToken, sessionMaxAgeSeconds)
    }

    return handler({
      ...ctx,
      user,
      sessionToken,
    })
  }

  return withApi(apiHandler, options)
}

/**
 * Wrap an org-scoped handler with membership + optional permission/role checks.
 */
export function withOrgAuth(
  getOrgId: (ctx: AuthedApiHandlerContext, params: Record<string, string>) => string,
  handler: (ctx: OrgAuthedApiHandlerContext) => Promise<Response> | Response,
  options?: WithAuthOptions & { minRole?: MembershipRole; permission?: Permission },
) {
  return (request: NextRequest, routeCtx: { params: Promise<Record<string, string>> }) => {
    const wrapped = withAuth(async (ctx) => {
      const params = await routeCtx.params
      const organizationId = getOrgId(ctx, params)
      const org = await requireOrgAccess(organizationId, {
        minRole: options?.minRole,
        permission: options?.permission,
      })
      return handler({ ...ctx, org })
    }, options)

    return wrapped(request)
  }
}

/** Convenience JSON success helper for authenticated loaders. */
export function withAuthData<T>(
  loader: (ctx: AuthedApiHandlerContext) => Promise<T> | T,
  init?: WithAuthOptions & { status?: number },
) {
  return withAuth(async (ctx) => {
    const data = await loader(ctx)
    return success(data, { status: init?.status })
  }, init)
}

export { CSRF_HEADER }
