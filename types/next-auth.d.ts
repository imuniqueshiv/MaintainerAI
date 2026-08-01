import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      login: string
      githubId: string
      avatarUrl?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    login?: string | null
    githubId?: string | null
    avatarUrl?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    login?: string
    githubId?: string
  }
}
