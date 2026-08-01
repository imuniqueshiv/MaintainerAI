import {
  assertAuthEnv,
  assertGitHubAppEnv,
  assertInfrastructureEnv,
  isAuthConfigured,
  isGitHubAppConfigured,
  isNextBuildPhase,
  parseEnv,
  type Env,
} from '@/server/config/env'

export type AppConfig = {
  env: Env['NODE_ENV']
  appEnv: Env['NODE_ENV']
  isDev: boolean
  isTest: boolean
  isProd: boolean
  app: {
    name: string
    version: string
    url: string
    port: number
    hostname: string
  }
  log: {
    level: Env['LOG_LEVEL']
    pretty: boolean
  }
  database: {
    url: string | undefined
    configured: boolean
  }
  redis: {
    url: string | undefined
    configured: boolean
  }
  queue: {
    prefix: string
    concurrency: number
  }
  security: {
    corsOrigin: string
    trustProxy: boolean
    rateLimitWindowMs: number
    rateLimitMax: number
  }
  auth: {
    configured: boolean
    secret: string | undefined
    githubClientId: string | undefined
    githubClientSecret: string | undefined
    sessionMaxAgeSeconds: number
    sessionUpdateAgeSeconds: number
    csrfProtect: boolean
    url: string | undefined
  }
  githubApp: {
    configured: boolean
    appId: string | undefined
    clientId: string | undefined
    clientSecret: string | undefined
    privateKey: string | undefined
    webhookSecret: string | undefined
    slug: string
    /** When true, dispatch webhooks in-process instead of BullMQ. */
    inlineWebhooks: boolean
  }
  features: {
    infrastructure: true
    auth: true
    githubApp: boolean
    repositorySync: boolean
    ai: false
    automation: false
    marketplace: false
  }
  optional: {
    sentryDsn?: string
  }
  raw: Env
}

let cached: AppConfig | null = null

function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  return raw.replace(/\\n/g, '\n').trim()
}

function buildConfig(env: Env): AppConfig {
  const appEnv = env.APP_ENV ?? env.NODE_ENV
  const pretty = env.LOG_PRETTY ?? (appEnv === 'development' && process.env.CI !== 'true')
  const secret = env.AUTH_SECRET ?? env.NEXTAUTH_SECRET
  const githubConfigured = isGitHubAppConfigured(env)

  return {
    env: env.NODE_ENV,
    appEnv,
    isDev: appEnv === 'development',
    isTest: appEnv === 'test' || env.NODE_ENV === 'test',
    isProd: appEnv === 'production',
    app: {
      name: 'MaintainerAI',
      version: process.env.npm_package_version ?? '0.1.0',
      url: env.NEXT_PUBLIC_APP_URL,
      port: env.PORT,
      hostname: env.HOSTNAME,
    },
    log: {
      level: env.LOG_LEVEL,
      pretty,
    },
    database: {
      url: env.DATABASE_URL,
      configured: Boolean(env.DATABASE_URL),
    },
    redis: {
      url: env.REDIS_URL,
      configured: Boolean(env.REDIS_URL),
    },
    queue: {
      prefix: env.QUEUE_PREFIX,
      concurrency: env.WORKER_CONCURRENCY,
    },
    security: {
      corsOrigin: env.CORS_ORIGIN,
      trustProxy: env.TRUST_PROXY,
      rateLimitWindowMs: env.RATE_LIMIT_WINDOW_MS,
      rateLimitMax: env.RATE_LIMIT_MAX,
    },
    auth: {
      configured: isAuthConfigured(env),
      secret,
      githubClientId: env.GITHUB_OAUTH_CLIENT_ID,
      githubClientSecret: env.GITHUB_OAUTH_CLIENT_SECRET,
      sessionMaxAgeSeconds: env.AUTH_SESSION_MAX_AGE_SECONDS,
      sessionUpdateAgeSeconds: env.AUTH_SESSION_UPDATE_AGE_SECONDS,
      csrfProtect: env.AUTH_CSRF_PROTECT || appEnv === 'production',
      url: env.NEXTAUTH_URL ?? env.NEXT_PUBLIC_APP_URL,
    },
    githubApp: {
      configured: githubConfigured,
      appId: env.GITHUB_APP_ID,
      clientId: env.GITHUB_APP_CLIENT_ID,
      clientSecret: env.GITHUB_APP_CLIENT_SECRET,
      privateKey: normalizePrivateKey(env.GITHUB_APP_PRIVATE_KEY),
      webhookSecret: env.GITHUB_WEBHOOK_SECRET,
      slug: env.GITHUB_APP_SLUG,
      inlineWebhooks: env.GITHUB_WEBHOOK_INLINE,
    },
    features: {
      infrastructure: true,
      auth: true,
      githubApp: githubConfigured,
      repositorySync: githubConfigured,
      ai: false,
      automation: false,
      marketplace: false,
    },
    optional: {
      sentryDsn: env.SENTRY_DSN,
    },
    raw: env,
  }
}

/**
 * Load and cache typed application configuration.
 * Skips hard infrastructure assertions during Next.js production builds.
 */
export function getConfig(): AppConfig {
  if (cached) return cached

  if (process.env.SKIP_ENV_VALIDATION === '1' || isNextBuildPhase()) {
    const soft = parseEnv({
      ...process.env,
      SKIP_ENV_VALIDATION: 'true',
    })
    cached = buildConfig(soft)
    return cached
  }

  const env = parseEnv(process.env)
  if (!isNextBuildPhase()) {
    try {
      assertInfrastructureEnv(env)
    } catch (error) {
      if (env.INFRASTRUCTURE_STRICT || process.env.MAINTAINERAI_WORKER === '1') {
        throw error
      }
    }

    try {
      assertAuthEnv(env)
    } catch (error) {
      if (env.AUTH_STRICT) {
        throw error
      }
    }

    try {
      assertGitHubAppEnv(env)
    } catch (error) {
      if (env.GITHUB_APP_STRICT) {
        throw error
      }
    }
  }

  cached = buildConfig(env)
  return cached
}

/** Test helper — reset singleton between cases. */
export function resetConfigForTests(): void {
  cached = null
}

export const config = new Proxy({} as AppConfig, {
  get(_target, property, receiver) {
    return Reflect.get(getConfig(), property, receiver)
  },
})
