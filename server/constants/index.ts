export const APP_NAME = 'MaintainerAI'
export const API_VERSION = 'v1'

export const QUEUE_NAMES = {
  INFRASTRUCTURE: 'infrastructure',
} as const

export const JOB_NAMES = {
  HEARTBEAT: 'infrastructure.heartbeat',
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
