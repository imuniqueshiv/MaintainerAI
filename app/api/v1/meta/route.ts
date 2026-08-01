import { withApi } from '@/server/middleware/with-api'
import { success } from '@/server/lib/api-response'
import { getConfig } from '@/server/config'
import { API_VERSION } from '@/server/constants'

/**
 * GET /api/v1/meta — version and feature flags (Phase 1 scaffold).
 */
export const GET = withApi(async () => {
  const config = getConfig()
  return success({
    name: config.app.name,
    version: config.app.version,
    apiVersion: API_VERSION,
    environment: config.appEnv,
    features: config.features,
    authConfigured: config.auth.configured,
    docs: {
      productSpec: '/PRODUCT_SPEC.md',
      architecture: '/docs/architecture.md',
      configuration: '/docs/configuration.md',
      infrastructure: '/docs/infrastructure.md',
      authentication: '/AUTHENTICATION_FLOW.md',
      rbac: '/RBAC_DOCUMENTATION.md',
    },
  })
})
