import GitHub from 'next-auth/providers/github'
import { getConfig } from '@/server/config'
import { AppError } from '@/server/errors/app-error'

export type GitHubProfile = {
  id: number
  login: string
  name?: string | null
  email?: string | null
  avatar_url?: string | null
}

/**
 * Build the GitHub OAuth provider when credentials are configured.
 * Returns null when auth is not configured (UI-only / degraded mode).
 */
export function createGitHubProvider() {
  const { auth } = getConfig()
  if (!auth.configured) return null

  return GitHub({
    clientId: auth.githubClientId!,
    clientSecret: auth.githubClientSecret!,
    allowDangerousEmailAccountLinking: false,
    profile(profile: GitHubProfile) {
      return {
        id: String(profile.id),
        name: profile.name ?? profile.login,
        email: profile.email ?? null,
        image: profile.avatar_url ?? null,
        login: profile.login,
        githubId: String(profile.id),
        avatarUrl: profile.avatar_url ?? null,
      }
    },
  })
}

export function assertAuthConfigured(): void {
  if (!getConfig().auth.configured) {
    throw AppError.serviceUnavailable(
      'GitHub OAuth is not configured. Set NEXTAUTH_SECRET, GITHUB_OAUTH_CLIENT_ID, and GITHUB_OAUTH_CLIENT_SECRET. See .env.example.',
    )
  }
}
