import type { Adapter, AdapterAccount, AdapterUser } from '@auth/core/adapters'
import { PrismaAdapter } from '@auth/prisma-adapter'
import type { PrismaClient } from '@prisma/client'
import { prisma } from '@/server/db/prisma'

type GitHubEnrichedUser = AdapterUser & {
  login?: string | null
  githubId?: string | null
  avatarUrl?: string | null
}

function toAdapterUser(user: {
  id: string
  name: string | null
  email: string | null
  emailVerified: Date | null
  avatarUrl: string | null
  login: string
  githubId: bigint
}): AdapterUser & { login: string; githubId: string; avatarUrl: string | null } {
  return {
    id: user.id,
    name: user.name,
    email: user.email ?? undefined,
    emailVerified: user.emailVerified,
    image: user.avatarUrl,
    login: user.login,
    githubId: user.githubId.toString(),
    avatarUrl: user.avatarUrl,
  } as AdapterUser & { login: string; githubId: string; avatarUrl: string | null }
}

/**
 * Prisma adapter customized for MaintainerAI's User model
 * (`githubId`, `login`, `avatarUrl` instead of Auth.js `image`).
 */
export function createAuthAdapter(client: PrismaClient = prisma): Adapter {
  const base = PrismaAdapter(client) as Adapter

  return {
    ...base,
    async createUser(data: GitHubEnrichedUser) {
      const login = data.login
      const githubId = data.githubId
      if (!login || !githubId) {
        throw new Error(
          'Auth adapter createUser requires login and githubId from the GitHub profile callback',
        )
      }

      const created = await client.user.create({
        data: {
          name: data.name ?? null,
          email: data.email ?? null,
          emailVerified: data.emailVerified ?? null,
          avatarUrl: data.image ?? data.avatarUrl ?? null,
          login,
          githubId: BigInt(githubId),
        },
      })
      return toAdapterUser(created)
    },

    async getUser(id: string) {
      const user = await client.user.findUnique({ where: { id } })
      return user ? toAdapterUser(user) : null
    },

    async getUserByEmail(email: string) {
      const user = await client.user.findUnique({ where: { email } })
      return user ? toAdapterUser(user) : null
    },

    async getUserByAccount({
      provider,
      providerAccountId,
    }: Pick<AdapterAccount, 'provider' | 'providerAccountId'>) {
      const account = await client.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      })
      return account?.user ? toAdapterUser(account.user) : null
    },

    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, 'id'>) {
      const updated = await client.user.update({
        where: { id: data.id },
        data: {
          name: data.name ?? undefined,
          email: data.email ?? undefined,
          emailVerified: data.emailVerified ?? undefined,
          avatarUrl: data.image ?? undefined,
        },
      })
      return toAdapterUser(updated)
    },
  }
}
