import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { repositoryIdParamSchema } from '@/server/validation/github-schemas'
import { refreshRepositoryMetadata } from '@/server/services/repository-github-service'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { requireOrgAccess } from '@/server/auth/guards'

type RouteCtx = { params: Promise<Record<string, string>> }

/** POST /api/v1/repos/:repoId/refresh — refresh repository metadata from GitHub. */
export const POST = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { repoId } = parseParams(params, repositoryIdParamSchema)
    const repo = await prisma.repository.findFirst({
      where: { id: repoId, deletedAt: null },
    })
    if (!repo) throw AppError.notFound('Repository not found')
    await requireOrgAccess(repo.organizationId, { permission: 'repos:manage' })
    const updated = await refreshRepositoryMetadata({
      repositoryId: repoId,
      organizationId: repo.organizationId,
      actorUserId: user.id,
    })
    return success(updated)
  })(request as never)
