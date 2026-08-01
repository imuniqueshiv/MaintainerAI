import { withAuth } from '@/server/middleware/with-auth'
import { noContent, success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { repositoryIdParamSchema } from '@/server/validation/github-schemas'
import {
  disconnectRepository,
  toDashboardRepository,
} from '@/server/services/repository-github-service'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { requireOrgAccess } from '@/server/auth/guards'

type RouteCtx = { params: Promise<Record<string, string>> }

async function loadRepoForUser(repoId: string, userId: string) {
  const repo = await prisma.repository.findFirst({
    where: { id: repoId, deletedAt: null },
  })
  if (!repo) throw AppError.notFound('Repository not found')
  await requireOrgAccess(repo.organizationId, { permission: 'repos:read' })
  // ensure caller is the authenticated user context (requireOrgAccess uses session user)
  void userId
  return repo
}

/** GET /api/v1/repos/:repoId */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    const repo = await loadRepoForUser(repoId, user.id)
    return success(toDashboardRepository(repo))
  })(request as never)

/** DELETE /api/v1/repos/:repoId — disconnect (soft delete). */
export const DELETE = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    const repo = await loadRepoForUser(repoId, user.id)
    await requireOrgAccess(repo.organizationId, { permission: 'repos:manage' })
    await disconnectRepository({
      repositoryId: repoId,
      organizationId: repo.organizationId,
      actorUserId: user.id,
    })
    return noContent()
  })(request as never)
