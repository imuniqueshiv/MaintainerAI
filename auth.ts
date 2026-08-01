import NextAuth from 'next-auth'
import { createAuthAdapter } from '@/server/auth/adapter'
import { createGitHubProvider } from '@/server/auth/github'
import { getConfig } from '@/server/config'
import { ensurePersonalOrganization } from '@/server/services/organization-service'
import { createLogger } from '@/server/logger'

const log = createLogger({ component: 'auth' })

function buildAuthConfig() {
  const config = getConfig()
  const github = createGitHubProvider()

  return {
    adapter: createAuthAdapter(),
    providers: github ? [github] : [],
    session: {
      strategy: 'database' as const,
      maxAge: config.auth.sessionMaxAgeSeconds,
      updateAge: config.auth.sessionUpdateAgeSeconds,
    },
    pages: {
      signIn: '/onboarding',
      error: '/onboarding',
    },
    callbacks: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Auth.js callback shapes vary by adapter user
      async session({ session, user }: { session: any; user: any }) {
        if (session.user) {
          session.user.id = user.id
          session.user.login = user.login ?? session.user.name ?? ''
          session.user.githubId =
            typeof user.githubId === 'bigint'
              ? user.githubId.toString()
              : (user.githubId?.toString?.() ?? user.githubId ?? '')
          session.user.avatarUrl = user.avatarUrl ?? user.image ?? null
          session.user.image = user.avatarUrl ?? user.image ?? null
        }
        return session
      },
    },
    events: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async createUser({ user }: { user: any }) {
        try {
          if (user?.id) {
            await ensurePersonalOrganization(user.id)
          }
        } catch (error) {
          log.error({ err: error, userId: user?.id }, 'Failed to create personal organization')
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async signIn({ user }: { user: any }) {
        try {
          if (user?.id) {
            await ensurePersonalOrganization(user.id)
          }
        } catch (error) {
          log.error(
            { err: error, userId: user?.id },
            'Failed to ensure personal organization on sign-in',
          )
        }
      },
    },
    trustHost: true,
    cookies: {
      sessionToken: {
        name: config.isProd ? '__Secure-authjs.session-token' : 'authjs.session-token',
        options: {
          httpOnly: true,
          sameSite: 'lax' as const,
          path: '/',
          secure: config.isProd,
        },
      },
    },
    // Placeholder allows builds / UI-only boot; real OAuth requires NEXTAUTH_SECRET.
    secret:
      config.auth.secret ??
      (config.isProd ? undefined : 'dev-only-insecure-auth-secret-change-me'),
    debug: config.isDev,
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth(() => buildAuthConfig())
