import { AppError } from '@/server/errors/app-error'
import { getConfig } from '@/server/config'
import { createLogger } from '@/server/logger'

const log = createLogger({ component: 'github' })

export type GitHubAppCredentials = {
  appId: string
  privateKey: string
  webhookSecret: string
  clientId?: string
  clientSecret?: string
  slug: string
}

export function assertGitHubAppConfigured(): GitHubAppCredentials {
  const { githubApp } = getConfig()
  if (
    !githubApp.configured ||
    !githubApp.appId ||
    !githubApp.privateKey ||
    !githubApp.webhookSecret
  ) {
    throw AppError.serviceUnavailable(
      'GitHub App is not configured. Set GITHUB_APP_ID, GITHUB_APP_PRIVATE_KEY, and GITHUB_WEBHOOK_SECRET. See GITHUB_APP_SETUP.md.',
      { phase: 3 },
    )
  }

  if (!githubApp.privateKey.includes('BEGIN')) {
    log.error('GITHUB_APP_PRIVATE_KEY does not look like a PEM private key')
    throw AppError.serviceUnavailable('GITHUB_APP_PRIVATE_KEY is invalid')
  }

  return {
    appId: githubApp.appId,
    privateKey: githubApp.privateKey,
    webhookSecret: githubApp.webhookSecret,
    clientId: githubApp.clientId,
    clientSecret: githubApp.clientSecret,
    slug: githubApp.slug,
  }
}

export function isGitHubAppReady(): boolean {
  return getConfig().githubApp.configured
}
