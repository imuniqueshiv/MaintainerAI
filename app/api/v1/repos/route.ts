import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseSearchParams } from '@/server/validation'
import { listReposQuerySchema } from '@/server/validation/github-schemas'
import {
  listConnectedRepositoriesForUser,
  listConnectedRepositories,
} from '@/server/services/repository-github-service'
import { requireOrgAccess } from '@/server/auth/guards'

/** GET /api/v1/repos — list connected repositories (metadata only). */
export const GET = withAuth(async ({ request, user }) => {
  const query = parseSearchParams(request, listReposQuerySchema)

  if (query.orgId) {
    await requireOrgAccess(query.orgId, { permission: 'repos:read' })
  }

  let repositories = query.orgId
    ? await listConnectedRepositories(query.orgId)
    : await listConnectedRepositoriesForUser(user.id)

  if (query.q) {
    const q = query.q.toLowerCase()
    repositories = repositories.filter(
      (r) =>
        r.fullName.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q),
    )
  }
  if (query.language) {
    repositories = repositories.filter(
      (r) => (r.language ?? '').toLowerCase() === query.language!.toLowerCase(),
    )
  }
  if (query.private !== undefined) {
    repositories = repositories.filter((r) => r.isPrivate === query.private)
  }

  return success({ repositories })
})
