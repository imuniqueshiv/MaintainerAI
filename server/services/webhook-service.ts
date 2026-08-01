import { InstallationStatus, WebhookEventStatus, type Prisma } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { getConfig } from '@/server/config'
import { JOB_NAMES, QUEUE_NAMES, GITHUB_WEBHOOK_HANDLED_EVENTS } from '@/server/constants'
import { getQueue } from '@/server/queue/queues'
import { assertWebhookSignature } from '@/server/github/webhooks'
import {
  markInstallationDeleted,
  upsertInstallationFromGitHub,
} from '@/server/services/installation-service'
import { upsertRepositoryMetadata } from '@/server/services/repository-github-service'
import { listInstallationRepositories } from '@/server/github'
import { enqueueEntitySync, WEBHOOK_EVENT_ENTITY } from '@/server/sync/coordinator'
import { createLogger } from '@/server/logger'

const log = createLogger({ component: 'github.webhooks' })

export type IngestWebhookInput = {
  rawBody: string
  signature: string | null
  deliveryId: string
  event: string
  action?: string | null
}

/**
 * Verify signature, persist delivery idempotently, enqueue dispatch job.
 */
export async function ingestWebhook(input: IngestWebhookInput) {
  assertWebhookSignature(input.rawBody, input.signature)

  let payload: Prisma.InputJsonValue
  try {
    payload = JSON.parse(input.rawBody) as Prisma.InputJsonValue
  } catch {
    payload = { raw: input.rawBody }
  }

  const existing = await prisma.webhookEvent.findUnique({
    where: { deliveryId: input.deliveryId },
  })
  if (existing) {
    return { duplicate: true as const, eventId: existing.id, accepted: true as const }
  }

  const installationGithubId =
    typeof payload === 'object' &&
    payload &&
    'installation' in payload &&
    payload.installation &&
    typeof payload.installation === 'object' &&
    'id' in payload.installation
      ? Number((payload.installation as { id: number }).id)
      : null

  let installationId: string | null = null
  if (installationGithubId) {
    const installation = await prisma.installation.findUnique({
      where: { githubInstallationId: BigInt(installationGithubId) },
    })
    installationId = installation?.id ?? null
  }

  let event
  try {
    event = await prisma.webhookEvent.create({
      data: {
        deliveryId: input.deliveryId,
        event: input.event,
        action: input.action ?? null,
        payload,
        signatureValid: true,
        status: WebhookEventStatus.received,
        installationId,
      },
    })
  } catch (error) {
    // Concurrent duplicate delivery (unique deliveryId).
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      const dup = await prisma.webhookEvent.findUnique({
        where: { deliveryId: input.deliveryId },
      })
      if (dup) {
        return { duplicate: true as const, eventId: dup.id, accepted: true as const }
      }
    }
    throw error
  }

  const jobPayload = {
    eventId: event.id,
    deliveryId: input.deliveryId,
    event: input.event,
    action: input.action ?? null,
  }

  const { redis, githubApp } = getConfig()
  const useQueue = redis.configured && !githubApp.inlineWebhooks

  if (useQueue) {
    try {
      const queue = getQueue(QUEUE_NAMES.GITHUB_WEBHOOKS)
      await queue.add(JOB_NAMES.WEBHOOK_DISPATCH, jobPayload, {
        jobId: `webhook-${input.deliveryId}`,
      })
    } catch (error) {
      log.warn({ err: error, deliveryId: input.deliveryId }, 'Queue enqueue failed — dispatching inline')
      await dispatchWebhookEvent(event.id)
    }
  } else {
    await dispatchWebhookEvent(event.id)
  }

  return { duplicate: false as const, eventId: event.id, accepted: true as const }
}

export async function dispatchWebhookEvent(eventId: string) {
  const event = await prisma.webhookEvent.findUnique({ where: { id: eventId } })
  if (!event) return

  // Atomic claim — prevents double-processing under concurrent workers/inline.
  const claimed = await prisma.webhookEvent.updateMany({
    where: {
      id: eventId,
      status: WebhookEventStatus.received,
    },
    data: { status: WebhookEventStatus.processing },
  })
  if (claimed.count === 0) {
    return
  }

  try {
    const handled = (GITHUB_WEBHOOK_HANDLED_EVENTS as readonly string[]).includes(event.event)
    if (!handled) {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: {
          status: WebhookEventStatus.processed,
          processedAt: new Date(),
        },
      })
      log.info({ event: event.event, deliveryId: event.deliveryId }, 'Ignored webhook event')
      return
    }

    const payload = event.payload as Record<string, unknown>
    const action = event.action

    if (event.event === 'installation') {
      await handleInstallationEvent(action, payload)
    } else if (event.event === 'installation_repositories') {
      await handleInstallationRepositoriesEvent(action, payload)
    } else if (event.event === 'repository') {
      await handleRepositoryEvent(action, payload)
    } else if (event.event in WEBHOOK_EVENT_ENTITY) {
      await handleSyncEvent(event.event, payload)
    }

    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: {
        status: WebhookEventStatus.processed,
        processedAt: new Date(),
      },
    })
  } catch (error) {
    log.error({ err: error, eventId }, 'Webhook dispatch failed')
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { status: WebhookEventStatus.failed },
    })
    throw error
  }
}

async function handleInstallationEvent(action: string | null, payload: Record<string, unknown>) {
  const installation = payload.installation as { id: number } | undefined
  if (!installation?.id) return

  if (action === 'deleted' || action === 'suspend') {
    if (action === 'deleted') {
      await markInstallationDeleted(installation.id)
    } else {
      await prisma.installation.updateMany({
        where: { githubInstallationId: BigInt(installation.id) },
        data: {
          status: InstallationStatus.suspended,
          suspendedAt: new Date(),
        },
      })
    }
    return
  }

  if (action === 'created' || action === 'unsuspend' || action === 'new_permissions_accepted') {
    // Without an acting user, update existing row from GitHub if present.
    const existing = await prisma.installation.findUnique({
      where: { githubInstallationId: BigInt(installation.id) },
    })
    if (!existing) {
      log.info(
        { githubInstallationId: installation.id },
        'installation webhook without local row — waiting for OAuth callback',
      )
      return
    }
    // Refresh via owner of org if available
    const ownerId = (
      await prisma.organization.findUnique({ where: { id: existing.organizationId } })
    )?.ownerUserId
    if (ownerId) {
      await upsertInstallationFromGitHub({
        githubInstallationId: installation.id,
        actorUserId: ownerId,
        seedRepositories: action === 'created',
      })
    }
  }
}

async function handleInstallationRepositoriesEvent(
  action: string | null,
  payload: Record<string, unknown>,
) {
  const installation = payload.installation as { id: number } | undefined
  if (!installation?.id) return

  const local = await prisma.installation.findUnique({
    where: { githubInstallationId: BigInt(installation.id) },
  })
  if (!local) return

  if (action === 'removed') {
    const removed = (payload.repositories_removed as Array<{ id: number }> | undefined) ?? []
    for (const repo of removed) {
      await prisma.repository.updateMany({
        where: { githubId: BigInt(repo.id), installationId: local.id },
        data: { deletedAt: new Date() },
      })
    }
    return
  }

  if (action === 'added') {
    const remote = await listInstallationRepositories(installation.id)
    const addedIds = new Set(
      ((payload.repositories_added as Array<{ id: number }> | undefined) ?? []).map((r) => r.id),
    )
    for (const meta of remote) {
      if (!addedIds.has(Number(meta.githubId))) continue
      const repo = await upsertRepositoryMetadata({
        installationId: local.id,
        organizationId: local.organizationId,
        meta,
        connect: true,
      })
      if (getConfig().features.repositorySync && getConfig().redis.configured) {
        const { startRepositorySync } = await import('@/server/sync/coordinator')
        await startRepositorySync({
          repositoryId: repo.id,
          trigger: 'webhook',
          mode: 'full',
        }).catch((error) =>
          log.warn({ err: error, repositoryId: repo.id }, 'Failed to enqueue sync after repo added'),
        )
      }
    }
  }
}

/**
 * Resource-level webhooks (issues, PRs, labels, milestones, releases, push,
 * membership) only enqueue an incremental sync for the affected entity —
 * no inline GitHub calls or DB writes happen here.
 */
async function handleSyncEvent(event: string, payload: Record<string, unknown>) {
  if (!getConfig().features.repositorySync || !getConfig().redis.configured) return

  const repo = payload.repository as { id: number } | undefined
  if (!repo?.id) return

  const local = await prisma.repository.findFirst({
    where: { githubId: BigInt(repo.id), deletedAt: null },
  })
  if (!local) return

  const entity = WEBHOOK_EVENT_ENTITY[event]
  if (!entity) return

  await enqueueEntitySync({
    repositoryId: local.id,
    entity,
    trigger: 'webhook',
    mode: 'incremental',
  })
}

async function handleRepositoryEvent(action: string | null, payload: Record<string, unknown>) {
  const repo = payload.repository as
    | {
        id: number
        name: string
        full_name: string
        owner: { login: string }
      }
    | undefined
  const installation = payload.installation as { id: number } | undefined
  if (!repo?.id || !installation?.id) return

  const local = await prisma.installation.findUnique({
    where: { githubInstallationId: BigInt(installation.id) },
  })
  if (!local) return

  if (action === 'deleted') {
    await prisma.repository.updateMany({
      where: { githubId: BigInt(repo.id) },
      data: { deletedAt: new Date() },
    })
    return
  }

  if (action === 'archived') {
    await prisma.repository.updateMany({
      where: { githubId: BigInt(repo.id) },
      data: { archived: true },
    })
    return
  }

  if (action === 'unarchived') {
    await prisma.repository.updateMany({
      where: { githubId: BigInt(repo.id) },
      data: { archived: false, deletedAt: null },
    })
  }

  // renamed / transferred / publicized / privatized / edited — refresh metadata
  const remote = await listInstallationRepositories(installation.id)
  const meta = remote.find((r) => Number(r.githubId) === repo.id)
  if (meta) {
    const updated = await upsertRepositoryMetadata({
      installationId: local.id,
      organizationId: local.organizationId,
      meta,
      connect: true,
    })
    if (getConfig().features.repositorySync && getConfig().redis.configured) {
      await enqueueEntitySync({
        repositoryId: updated.id,
        entity: 'repository',
        trigger: 'webhook',
        mode: 'incremental',
      }).catch((error) =>
        log.warn({ err: error, repositoryId: updated.id }, 'Failed to enqueue repo metadata sync'),
      )
    }
  }
}
