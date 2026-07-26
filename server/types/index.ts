export type FeatureFlags = {
  infrastructure: boolean
  auth: boolean
  githubApp: boolean
  repositorySync: boolean
  ai: boolean
  automation: boolean
  marketplace: boolean
}

export type HealthStatus = 'ok' | 'degraded' | 'down' | 'unconfigured'
