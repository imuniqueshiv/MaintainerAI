import { withAuth } from '@/server/middleware/with-auth'
import { success } from '@/server/lib/api-response'
import { parseParams } from '@/server/validation'
import { installationIdParamSchema } from '@/server/validation/github-schemas'
import {
  requireInstallationAccess,
  serializeInstallation,
} from '@/server/services/installation-service'
import { prisma } from '@/server/db/prisma'

type RouteCtx = { params: Promise<Record<string, string>> }

/** GET /api/v1/github/installations/:id/status */
export const GET = (request: Request, routeCtx: RouteCtx) =>
  withAuth(async ({ user }) => {
    const params = await routeCtx.params
    const { id } = parseParams(params, installationIdParamSchema)
    const access = await requireInstallationAccess(id, user.id, 'github:read')

    const lastWebhook = await prisma.webhookEvent.findFirst({
      where: { installationId: id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        event: true,
        action: true,
        status: true,
        createdAt: true,
        processedAt: true,
        deliveryId: true,
      },
    })

    return success({
      installation: serializeInstallation(access.installation),
      status: access.installation.status,
      syncStatus: access.installation.syncStatus,
      lastSyncAt: access.installation.lastSyncAt,
      suspendedAt: access.installation.suspendedAt,
      connectedRepositoryCount: access.connectedRepositoryCount,
      rateLimit: {
        remaining: access.installation.rateLimitRemaining,
        limit: access.installation.rateLimitLimit,
      },
      lastWebhook,
      healthy:
        access.installation.status === 'active' &&
        access.installation.syncStatus !== 'failed',
    })
  })(request as never)
