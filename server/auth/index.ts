export { createAuthAdapter } from '@/server/auth/adapter'
export { createGitHubProvider, assertAuthConfigured } from '@/server/auth/github'
export {
  getSession,
  getCurrentUser,
  requireUser,
  readSessionToken,
  listUserSessions,
  revokeSessionByToken,
  revokeAllUserSessions,
  touchSession,
} from '@/server/auth/session'
export { getMembership, requireOrgAccess } from '@/server/auth/guards'
export {
  assertPermission,
  assertMinRole,
  assertCanAssignRole,
  assertCanRemoveMember,
  type AuthUser,
  type OrgMembershipContext,
} from '@/server/auth/rbac'
export {
  PERMISSIONS,
  permissionsForRole,
  roleHasPermission,
  roleAtLeast,
  roleRank,
  type Permission,
} from '@/server/auth/permissions'
export {
  sessionCookieName,
  csrfCookieName,
  sessionCookieOptions,
} from '@/server/auth/cookies'
export {
  createCsrfToken,
  hashCsrfToken,
  verifyCsrfToken,
  assertCsrfHeader,
  assertMutatingRequestOrigin,
} from '@/server/auth/csrf'
