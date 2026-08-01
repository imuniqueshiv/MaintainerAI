import { z } from 'zod'

/**
 * Environment schema for MaintainerAI.
 * Import `config` from `@/server/config` — never read `process.env` in app code.
 */

const booleanFromEnv = z.union([z.boolean(), z.string()]).transform((value) => {
  if (typeof value === 'boolean') return value
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
})

const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  APP_ENV: z.enum(['development', 'test', 'production']).optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOSTNAME: z.string().default('0.0.0.0'),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
  LOG_LEVEL: logLevelSchema.default('info'),
  LOG_PRETTY: booleanFromEnv.optional(),

  // Infrastructure (required for API/worker readiness; validated soft during Next build)
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional(),

  // Queue
  QUEUE_PREFIX: z.string().default('maintainerai'),
  WORKER_CONCURRENCY: z.coerce.number().int().positive().default(5),

  // Security / HTTP
  CORS_ORIGIN: z.string().default('*'),
  TRUST_PROXY: booleanFromEnv.default(false),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),

  // Feature / infra flags
  SKIP_ENV_VALIDATION: booleanFromEnv.default(false),
  INFRASTRUCTURE_STRICT: booleanFromEnv.default(false),
  AUTH_STRICT: booleanFromEnv.default(false),

  // Auth.js / GitHub OAuth (Phase 2)
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16).optional(),
  AUTH_SECRET: z.string().min(16).optional(),
  GITHUB_OAUTH_CLIENT_ID: z.string().optional(),
  GITHUB_OAUTH_CLIENT_SECRET: z.string().optional(),
  AUTH_SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 30),
  AUTH_SESSION_UPDATE_AGE_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24),
  AUTH_CSRF_PROTECT: booleanFromEnv.default(false),

  // Future milestones (optional)
  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_CLIENT_ID: z.string().optional(),
  GITHUB_APP_CLIENT_SECRET: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_WEBHOOK_SECRET: z.string().optional(),
  GITHUB_APP_SLUG: z.string().optional(),
  AI_PROVIDER: z.enum(['openai', 'anthropic', 'azure', 'ollama', 'custom']).optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),
  AI_BASE_URL: z.string().optional(),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function isNextBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build'
  )
}

export function parseEnv(
  raw: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): Env {
  const parsed = envSchema.safeParse(raw)
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n')
    throw new Error(`Invalid environment configuration:\n${details}`)
  }
  return parsed.data
}

export function assertInfrastructureEnv(env: Env): void {
  const missing: string[] = []
  if (!env.DATABASE_URL) missing.push('DATABASE_URL')
  if (!env.REDIS_URL) missing.push('REDIS_URL')
  if (missing.length === 0) return

  const message = `Missing required infrastructure environment variables: ${missing.join(', ')}. See .env.example and docs/configuration.md.`

  // Strict only when explicitly requested, or when running the worker process.
  // The web app may boot degraded in production and report via /api/ready.
  if (env.INFRASTRUCTURE_STRICT || process.env.MAINTAINERAI_WORKER === '1') {
    throw new Error(message)
  }
}

export function assertAuthEnv(env: Env): void {
  const secret = env.AUTH_SECRET ?? env.NEXTAUTH_SECRET
  const missing: string[] = []
  if (!secret) missing.push('NEXTAUTH_SECRET (or AUTH_SECRET)')
  if (!env.GITHUB_OAUTH_CLIENT_ID) missing.push('GITHUB_OAUTH_CLIENT_ID')
  if (!env.GITHUB_OAUTH_CLIENT_SECRET) missing.push('GITHUB_OAUTH_CLIENT_SECRET')
  if (missing.length === 0) return

  const message = `Missing required authentication environment variables: ${missing.join(', ')}. See .env.example and docs/configuration.md.`

  if (env.AUTH_STRICT) {
    throw new Error(message)
  }
}

export function isAuthConfigured(env: Env): boolean {
  const secret = env.AUTH_SECRET ?? env.NEXTAUTH_SECRET
  return Boolean(secret && env.GITHUB_OAUTH_CLIENT_ID && env.GITHUB_OAUTH_CLIENT_SECRET)
}
