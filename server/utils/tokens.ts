import { createHash, randomBytes } from 'node:crypto'

/** High-entropy opaque token (invitations, etc.). */
export function createOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Synthetic GitHub IDs for orgs created locally before Phase 3 sync.
 * Negative values avoid collision with real GitHub IDs (always positive).
 */
export function allocateSyntheticGithubId(): bigint {
  const now = BigInt(Date.now())
  const rand = BigInt(Math.floor(Math.random() * 1_000_000))
  return -(now * BigInt(1_000_000) + rand)
}
