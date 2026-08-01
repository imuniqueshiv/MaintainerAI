import { describe, expect, it } from 'vitest'
import { shouldResetCheckpoint } from '@/server/sync/finish-pages'

describe('checkpoint reset policy', () => {
  it('resets full sync only when prior checkpoint completed', () => {
    expect(shouldResetCheckpoint('full', true)).toBe(true)
    expect(shouldResetCheckpoint('full', undefined)).toBe(true)
    expect(shouldResetCheckpoint('full', false)).toBe(false)
  })

  it('never resets incremental/delta via reset flag helper', () => {
    expect(shouldResetCheckpoint('incremental', true)).toBe(false)
    expect(shouldResetCheckpoint('delta', false)).toBe(false)
  })
})
