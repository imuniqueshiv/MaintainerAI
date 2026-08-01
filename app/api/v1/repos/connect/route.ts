import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseJsonBody } from '@/server/validation'
import { connectRepositoriesSchema } from '@/server/validation/github-schemas'
import { connectRepositories } from '@/server/services/repository-github-service'
import { requireInstallationAccess } from '@/server/services/installation-service'

/** POST /api/v1/repos/connect — connect repositories from an installation. */
export const POST = withAuth(async ({ request, user }) => {
  const body = await parseJsonBody(request, connectRepositoriesSchema)
  await requireInstallationAccess(body.installationId, user.id, 'repos:manage')
  const repositories = await connectRepositories({
    installationId: body.installationId,
    githubIds: body.githubIds,
    actorUserId: user.id,
    replace: body.replace,
  })
  return success({ repositories }, { status: 201 })
})
