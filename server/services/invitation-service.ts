import { InvitationStatus, MembershipRole } from '@prisma/client'
import { prisma } from '@/server/db/prisma'
import { AppError } from '@/server/errors/app-error'
import { DEFAULT_INVITATION_TTL_SECONDS } from '@/server/constants'
import { createOpaqueToken } from '@/server/utils/tokens'
import { writeAuditLog } from '@/server/services/audit-service'
import { assertCanAssignRole, type OrgMembershipContext } from '@/server/auth/rbac'

function serializeInvitation<T extends { token: string }>(
  invitation: T,
  options?: { includeToken?: boolean },
) {
  if (options?.includeToken) return invitation
  const rest = { ...invitation }
  delete (rest as { token?: string }).token
  return rest
}

function assertInvitationEmailMatch(
  user: { email: string | null },
  invitationEmail: string,
): void {
  if (!user.email) {
    throw AppError.forbidden(
      'Your account has no email address from GitHub. Email invitations cannot be accepted until GitHub provides an email on your profile.',
    )
  }
  if (user.email.toLowerCase() !== invitationEmail.toLowerCase()) {
    throw AppError.forbidden('This invitation was issued to a different email address')
  }
}

export async function listInvitations(organizationId: string, status?: InvitationStatus) {
  const rows = await prisma.invitation.findMany({
    where: {
      organizationId,
      ...(status ? { status } : {}),
    },
    include: {
      invitedBy: {
        select: { id: true, login: true, name: true, avatarUrl: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Never expose raw invitation tokens in list responses.
  return rows.map((row) => serializeInvitation(row))
}

export async function createInvitation(
  actor: OrgMembershipContext,
  input: { email: string; role: MembershipRole },
) {
  assertCanAssignRole(actor, input.role)

  const email = input.email.toLowerCase()

  const existingMember = await prisma.user.findFirst({
    where: { email },
    include: {
      memberships: {
        where: { organizationId: actor.organizationId },
      },
    },
  })
  if (existingMember?.memberships.length) {
    throw AppError.conflict('User is already a member of this organization')
  }

  const pending = await prisma.invitation.findFirst({
    where: {
      organizationId: actor.organizationId,
      email,
      status: InvitationStatus.pending,
    },
  })
  if (pending && pending.expiresAt > new Date()) {
    throw AppError.conflict('A pending invitation already exists for this email')
  }

  const token = createOpaqueToken(32)
  const expiresAt = new Date(Date.now() + DEFAULT_INVITATION_TTL_SECONDS * 1000)

  const invitation = await prisma.invitation.create({
    data: {
      organizationId: actor.organizationId,
      email,
      role: input.role,
      token,
      invitedById: actor.userId,
      expiresAt,
      status: InvitationStatus.pending,
    },
  })

  await writeAuditLog({
    action: 'org.invitation.create',
    targetType: 'invitation',
    targetId: invitation.id,
    organizationId: actor.organizationId,
    actorUserId: actor.userId,
    metadata: { email, role: input.role },
  })

  // Phase 2: no email provider — return token once for accept URL construction.
  return serializeInvitation(invitation, { includeToken: true })
}

export async function revokeInvitation(actor: OrgMembershipContext, invitationId: string) {
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, organizationId: actor.organizationId },
  })
  if (!invitation) throw AppError.notFound('Invitation not found')
  if (invitation.status !== InvitationStatus.pending) {
    throw AppError.badRequest('Only pending invitations can be revoked')
  }

  const updated = await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: InvitationStatus.revoked },
  })

  await writeAuditLog({
    action: 'org.invitation.revoke',
    targetType: 'invitation',
    targetId: invitationId,
    organizationId: actor.organizationId,
    actorUserId: actor.userId,
  })

  return serializeInvitation(updated)
}

async function loadPendingInvitation(token: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  })
  if (!invitation) throw AppError.notFound('Invitation not found')
  if (invitation.status !== InvitationStatus.pending) {
    throw AppError.badRequest(`Invitation is ${invitation.status}`)
  }
  if (invitation.expiresAt <= new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.expired },
    })
    throw AppError.badRequest('Invitation has expired')
  }
  return invitation
}

export async function acceptInvitation(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw AppError.notFound('User not found')

  const invitation = await loadPendingInvitation(token)
  assertInvitationEmailMatch(user, invitation.email)

  const result = await prisma.$transaction(async (tx) => {
    await tx.membership.upsert({
      where: {
        userId_organizationId: {
          userId,
          organizationId: invitation.organizationId,
        },
      },
      create: {
        userId,
        organizationId: invitation.organizationId,
        role: invitation.role,
      },
      update: {},
    })

    return tx.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.accepted,
        acceptedAt: new Date(),
      },
      include: { organization: true },
    })
  })

  await writeAuditLog({
    action: 'org.invitation.accept',
    targetType: 'invitation',
    targetId: invitation.id,
    organizationId: invitation.organizationId,
    actorUserId: userId,
  })

  return {
    invitation: serializeInvitation(result),
    organization: {
      ...result.organization,
      githubId: result.organization.githubId.toString(),
    },
  }
}

export async function rejectInvitation(userId: string, token: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw AppError.notFound('User not found')

  const invitation = await loadPendingInvitation(token)
  assertInvitationEmailMatch(user, invitation.email)

  const updated = await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      status: InvitationStatus.rejected,
      rejectedAt: new Date(),
    },
  })

  await writeAuditLog({
    action: 'org.invitation.reject',
    targetType: 'invitation',
    targetId: invitation.id,
    organizationId: invitation.organizationId,
    actorUserId: userId,
  })

  return serializeInvitation(updated)
}
