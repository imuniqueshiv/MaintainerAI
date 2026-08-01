import { createAppAuth } from '@octokit/auth-app'
import { cache } from '@/server/cache/redis'
import { assertGitHubAppConfigured } from '@/server/github/config'
import { withGitHubRetry } from '@/server/github/errors'
import { createLogger } from '@/server/logger'
import { getConfig } from '@/server/config'

const log = createLogger({ component: 'github.tokens' })

function tokenCacheKey(installationId: number | string): string {
  return `gh:install-token:${installationId}`
}

/**
 * Create a short-lived GitHub App JWT via @octokit/auth-app (never logged).
 */
export async function createAppJwt(): Promise<string> {
  const creds = assertGitHubAppConfigured()
  const auth = createAppAuth({
    appId: creds.appId,
    privateKey: creds.privateKey,
    clientId: creds.clientId,
    clientSecret: creds.clientSecret,
  })

  const result = await withGitHubRetry(() => auth({ type: 'app' }), { label: 'app-jwt' })
  return result.token
}

/**
 * Get an installation access token (Redis-cached). Tokens are never persisted in Postgres.
 */
export async function getInstallationToken(
  githubInstallationId: number | bigint,
): Promise<{ token: string; expiresAt: Date }> {
  const id = Number(githubInstallationId)
  const key = tokenCacheKey(id)

  if (getConfig().redis.configured) {
    try {
      const cached = await cache.get(key)
      if (cached) {
        const parsed = JSON.parse(cached) as { token: string; expiresAt: string }
        if (new Date(parsed.expiresAt).getTime() > Date.now() + 60_000) {
          return { token: parsed.token, expiresAt: new Date(parsed.expiresAt) }
        }
      }
    } catch (error) {
      log.warn({ err: error }, 'Installation token cache read failed')
    }
  }

  const creds = assertGitHubAppConfigured()
  const auth = createAppAuth({
    appId: creds.appId,
    privateKey: creds.privateKey,
    clientId: creds.clientId,
    clientSecret: creds.clientSecret,
  })

  const result = await withGitHubRetry(
    () => auth({ type: 'installation', installationId: id }),
    { label: 'install-token' },
  )

  const expiresAt = result.expiresAt ? new Date(result.expiresAt) : new Date(Date.now() + 3_600_000)
  const ttlSeconds = Math.max(60, Math.floor((expiresAt.getTime() - Date.now()) / 1000) - 60)

  if (getConfig().redis.configured) {
    try {
      await cache.set(key, JSON.stringify({ token: result.token, expiresAt: expiresAt.toISOString() }), ttlSeconds)
    } catch (error) {
      log.warn({ err: error }, 'Installation token cache write failed')
    }
  }

  return { token: result.token, expiresAt }
}

export async function invalidateInstallationToken(githubInstallationId: number | bigint): Promise<void> {
  if (!getConfig().redis.configured) return
  try {
    await cache.del(tokenCacheKey(Number(githubInstallationId)))
  } catch (error) {
    log.warn({ err: error }, 'Installation token cache delete failed')
  }
}
