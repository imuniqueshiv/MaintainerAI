import { describe, expect, it } from 'vitest'
import { mapIssueState, mapPullState } from '@/server/sync/mappers'
import { SYNC_ENTITIES, WEBHOOK_EVENT_ENTITY } from '@/server/sync'
import { startSyncBodySchema, resourceListQuerySchema } from '@/server/validation/sync-schemas'
import { QUEUE_NAMES, JOB_NAMES } from '@/server/constants'

describe('sync mappers', () => {
  it('maps issue open/closed states', () => {
    expect(mapIssueState({ state: 'open' })).toBe('open')
    expect(mapIssueState({ state: 'closed' })).toBe('closed')
  })

  it('maps pull request states with draft and merged precedence', () => {
    expect(mapPullState({ state: 'open', draft: false, merged: false })).toBe('open')
    expect(mapPullState({ state: 'open', draft: true, merged: false })).toBe('draft')
    expect(mapPullState({ state: 'closed', draft: false, merged: false })).toBe('closed')
    expect(mapPullState({ state: 'closed', draft: false, merged: true })).toBe('merged')
    expect(mapPullState({ state: 'open', draft: true, merged: true })).toBe('merged')
  })
})

describe('sync entity catalog', () => {
  it('covers all isolated sync queues', () => {
    expect(SYNC_ENTITIES).toEqual([
      'repository',
      'labels',
      'milestones',
      'issues',
      'pull_requests',
      'contributors',
      'releases',
      'branches',
      'statistics',
    ])
  })

  it('maps webhook events to sync entities without inline sync', () => {
    expect(WEBHOOK_EVENT_ENTITY.issues).toBe('issues')
    expect(WEBHOOK_EVENT_ENTITY.pull_request).toBe('pull_requests')
    expect(WEBHOOK_EVENT_ENTITY.label).toBe('labels')
    expect(WEBHOOK_EVENT_ENTITY.milestone).toBe('milestones')
    expect(WEBHOOK_EVENT_ENTITY.release).toBe('releases')
    expect(WEBHOOK_EVENT_ENTITY.push).toBe('branches')
    expect(WEBHOOK_EVENT_ENTITY.member).toBe('contributors')
  })

  it('defines dedicated queue and job names including dead letter', () => {
    expect(QUEUE_NAMES.SYNC_ISSUES).toBe('sync.issues')
    expect(QUEUE_NAMES.SYNC_PULL_REQUESTS).toBe('sync.pullrequests')
    expect(QUEUE_NAMES.SYNC_DEADLETTER).toBe('sync.deadletter')
    expect(JOB_NAMES.SYNC_ISSUES_RUN).toBe('sync.issues.run')
    expect(JOB_NAMES.SYNC_DEADLETTER_RUN).toBe('sync.deadletter.run')
  })
})

describe('sync validation schemas', () => {
  it('defaults start sync mode to full', () => {
    expect(startSyncBodySchema.parse({})).toEqual({ mode: 'full' })
    expect(startSyncBodySchema.parse({ mode: 'incremental' }).mode).toBe('incremental')
  })

  it('rejects empty entities arrays', () => {
    expect(() => startSyncBodySchema.parse({ entities: [] })).toThrow()
  })

  it('coerces pagination query params', () => {
    expect(resourceListQuerySchema.parse({ page: '2', limit: '10' })).toEqual({
      page: 2,
      limit: 10,
    })
  })
})
