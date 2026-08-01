export const APP_NAME = 'MaintainerAI'
export const API_VERSION = 'v1'

export const QUEUE_NAMES = {
  INFRASTRUCTURE: 'infrastructure',
  GITHUB_WEBHOOKS: 'github.webhooks',
  SYNC_REPOSITORIES: 'sync.repositories',
  SYNC_ISSUES: 'sync.issues',
  SYNC_PULL_REQUESTS: 'sync.pullrequests',
  SYNC_LABELS: 'sync.labels',
  SYNC_MILESTONES: 'sync.milestones',
  SYNC_RELEASES: 'sync.releases',
  SYNC_CONTRIBUTORS: 'sync.contributors',
  SYNC_BRANCHES: 'sync.branches',
  SYNC_STATISTICS: 'sync.statistics',
  SYNC_DEADLETTER: 'sync.deadletter',
} as const

export const JOB_NAMES = {
  HEARTBEAT: 'infrastructure.heartbeat',
  WEBHOOK_DISPATCH: 'github.webhook.dispatch',
  SYNC_REPOSITORY_RUN: 'sync.repository.run',
  SYNC_ISSUES_RUN: 'sync.issues.run',
  SYNC_PULL_REQUESTS_RUN: 'sync.pullrequests.run',
  SYNC_LABELS_RUN: 'sync.labels.run',
  SYNC_MILESTONES_RUN: 'sync.milestones.run',
  SYNC_RELEASES_RUN: 'sync.releases.run',
  SYNC_CONTRIBUTORS_RUN: 'sync.contributors.run',
  SYNC_BRANCHES_RUN: 'sync.branches.run',
  SYNC_STATISTICS_RUN: 'sync.statistics.run',
  SYNC_DEADLETTER_RUN: 'sync.deadletter.run',
} as const

export const REQUEST_ID_HEADER = 'x-request-id'
export const CORRELATION_ID_HEADER = 'x-correlation-id'
export const CSRF_HEADER = 'x-csrf-token'

/** Default Auth.js session lifetime (30 days). */
export const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
/** Refresh session cookie when half the TTL remains. */
export const DEFAULT_SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24
/** Invitation token lifetime (7 days). */
export const DEFAULT_INVITATION_TTL_SECONDS = 60 * 60 * 24 * 7

/** Phase 3-4 webhook events that are dispatched (all others logged + ignored). */
export const GITHUB_WEBHOOK_HANDLED_EVENTS = [
  'installation',
  'installation_repositories',
  'repository',
  'issues',
  'pull_request',
  'label',
  'milestone',
  'release',
  'push',
  'member',
] as const

export const GITHUB_INSTALL_STATE_COOKIE = 'maintainerai.github_install_state'
