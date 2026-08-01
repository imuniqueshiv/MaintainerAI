Object.assign(process.env, {
  NODE_ENV: 'test',
  APP_ENV: 'test',
  SKIP_ENV_VALIDATION: '1',
  NEXT_PUBLIC_APP_URL: 'http://localhost:3000',
  LOG_LEVEL: 'silent',
  NEXTAUTH_SECRET: 'test-secret-at-least-16-chars',
})

import { vi } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(async () => null),
  handlers: { GET: vi.fn(), POST: vi.fn() },
  signIn: vi.fn(),
  signOut: vi.fn(),
}))
