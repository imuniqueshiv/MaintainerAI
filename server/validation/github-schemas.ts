import { z } from 'zod'

export const installationIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const repositoryIdParamSchema = z.object({
  repoId: z.string().uuid(),
})

export const githubIdsSchema = z
  .array(z.union([z.string(), z.number()]))
  .min(1)
  .max(100)
  .transform((ids) => ids.map(String))

export const connectRepositoriesSchema = z.object({
  installationId: z.string().uuid(),
  githubIds: githubIdsSchema,
  replace: z.boolean().optional().default(false),
})

export const listReposQuerySchema = z.object({
  orgId: z.string().uuid().optional(),
  q: z.string().trim().max(200).optional(),
  language: z.string().trim().max(64).optional(),
  private: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
})

export const githubInstallCallbackQuerySchema = z.object({
  installation_id: z.coerce.number().int().positive(),
  setup_action: z.string().optional(),
  state: z.string().min(16).max(128),
})
