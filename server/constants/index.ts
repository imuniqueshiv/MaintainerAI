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
