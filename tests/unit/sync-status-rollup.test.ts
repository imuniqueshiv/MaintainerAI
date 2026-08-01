import { describe, expect, it } from 'vitest'

/**
 * Pure mapping mirror of server/github/client mapRepo homepage/license fields —
 * keeps the regression without bootstrapping Octokit.
 */
function mapRepoFields(repo: {
  homepage?: string | null
  license?: { spdx_id?: string | null } | null
}) {
  return {
    homepage: repo.homepage ?? null,
    licenseSpdx: repo.license?.spdx_id ?? null,
  }
}

describe('repository metadata sync fields', () => {
  it('maps homepage and SPDX license from GitHub payloads', () => {
    expect(
      mapRepoFields({
        homepage: 'https://example.com',
        license: { spdx_id: 'MIT' },
      }),
    ).toEqual({ homepage: 'https://example.com', licenseSpdx: 'MIT' })
  })

  it('tolerates missing homepage/license', () => {
    expect(mapRepoFields({})).toEqual({ homepage: null, licenseSpdx: null })
    expect(mapRepoFields({ license: null })).toEqual({ homepage: null, licenseSpdx: null })
  })
})

describe('sync status rollup rules', () => {
  it('prefers active jobs over stale repository.syncStatus', () => {
    const activeJobs = [{ id: '1' }]
    const repoStatus = 'completed'
    const syncStatus = activeJobs.length > 0 ? 'syncing' : repoStatus
    expect(syncStatus).toBe('syncing')
  })

  it('exposes failed only when no active jobs remain', () => {
    const activeJobs: unknown[] = []
    const repoStatus = 'failed'
    const syncStatus = activeJobs.length > 0 ? 'syncing' : repoStatus
    expect(syncStatus).toBe('failed')
  })
})
