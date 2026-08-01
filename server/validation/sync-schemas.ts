import { z } from 'zod'

export const startSyncBodySchema = z.object({
  mode: z.enum(['full', 'incremental']).optional().default('full'),
  entities: z
    .array(
      z.enum([
        'repository',
        'issues',
        'pull_requests',
        'labels',
        'milestones',
        'releases',
        'contributors',
        'branches',
        'statistics',
      ]),
    )
    .min(1)
    .optional(),
})

export const cancelSyncBodySchema = z.object({
  syncJobId: z.string().uuid().optional(),
})

export const syncHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(25),
})

export const resourceListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  state: z.string().trim().max(32).optional(),
  q: z.string().trim().max(200).optional(),
})

export const syncStatisticsQuerySchema = z.object({
  orgId: z.string().uuid().optional(),
})
