import { z } from 'zod'
import { MembershipRole } from '@prisma/client'

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  // Email is managed by GitHub OAuth — not mutable via API (prevents invite theft).
  theme: z.enum(['system', 'light', 'dark']).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
  notificationPrefs: z
    .object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
      marketing: z.boolean().optional(),
      security: z.boolean().optional(),
    })
    .optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
})

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  login: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,62}$/i, 'Invalid organization slug'),
  avatarUrl: z.string().url().max(2048).optional(),
})

export const updateOrganizationSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  login: z
    .string()
    .trim()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,62}$/i, 'Invalid organization slug')
    .optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
})

export const updateMemberRoleSchema = z.object({
  role: z.nativeEnum(MembershipRole),
})

export const createInvitationSchema = z.object({
  email: z.string().trim().email().max(255),
  role: z.nativeEnum(MembershipRole).default(MembershipRole.viewer),
})

export const transferOwnershipSchema = z.object({
  newOwnerUserId: z.string().uuid(),
})

export const orgIdParamSchema = z.object({
  orgId: z.string().uuid(),
})

export const memberParamsSchema = z.object({
  orgId: z.string().uuid(),
  userId: z.string().uuid(),
})

export const invitationParamsSchema = z.object({
  orgId: z.string().uuid(),
  invitationId: z.string().uuid(),
})

export const invitationTokenParamSchema = z.object({
  token: z.string().min(16).max(128),
})

export const updateSettingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
  notificationPrefs: z
    .object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional(),
      marketing: z.boolean().optional(),
      security: z.boolean().optional(),
    })
    .optional(),
})

export const updateOrgSettingsSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  avatarUrl: z.string().url().max(2048).nullable().optional(),
})
