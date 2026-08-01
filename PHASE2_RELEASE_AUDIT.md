# Phase 2 Release Audit — `v0.2.0-auth`

**Roles:** Release Manager · Principal QA · Staff Backend · Security · DevOps · SRE · Platform Architect · OSS Maintainer  
**Scope:** Production verification of Phase 2 only (no Phase 3)  
**Method:** Independent verification from the repository — previous `PHASE2_REVIEW.md` claims were **not** trusted  
**Date:** 2026-08-01

---

## Executive Summary

An independent audit found Phase 2 **functionally complete** but **not initially release-ready** due to real security gaps (CSRF not enforced, invitation privilege escalation, email-null invite accept, Compose insecure secret default, mutable email → invite theft).

Those issues were **fixed in this audit**. Quality gates were re-run and pass. Documentation was aligned with the corrected behavior.

### Final decision

# ✅ READY TO CREATE TAG v0.2.0-auth

---

## Architecture Review

| Layer | Verdict |
| ----- | ------- |
| Auth.js + GitHub OAuth + DB sessions | ✅ Matches SYSTEM_ARCHITECTURE / API spec |
| `withApi` → `withAuth` → `withOrgAuth` | ✅ Opt-in per route; public health/meta remain open |
| Personal org on first login | ✅ |
| Phase 3 App install endpoints | ✅ 503 stubs only — no App JWT/install code |
| Soft boot without OAuth secrets | ✅ (`AUTH_STRICT` for hard fail) |

---

## Authentication Review

| Check | Result |
| ----- | ------ |
| `/api/auth/[...nextauth]` | ✅ Present |
| Session create (DB strategy) | ✅ |
| Session touch / sliding refresh | ✅ `touchSession` in `withAuth` |
| Logout | ✅ DB revoke + `signOut` |
| Logout everywhere | ✅ sessions DELETE + `signOut` (fixed) |
| HTTP-only / SameSite=Lax / Secure in prod | ✅ Explicit Auth.js cookie options (fixed) |
| Origin CSRF on mutating `/api/v1` when `AUTH_CSRF_PROTECT` | ✅ Enforced (fixed) |
| Email not mutable via API | ✅ Prevents invite theft (fixed) |
| Sign In wiring | ✅ Marketing nav + onboarding → `/api/auth/signin/github` |

Live GitHub OAuth still requires operator-provided `GITHUB_OAUTH_*` credentials (expected).

---

## Organization Review

| Check | Result |
| ----- | ------ |
| Create / list / update / delete | ✅ |
| Leave (`?leave=true`) | ✅ |
| Transfer ownership | ✅ Owner-only (fixed) |
| Personal org non-deletable | ✅ |
| Invitations create/list/revoke/accept/reject | ✅ |
| Invite role ceiling | ✅ Admin any; maintainer ≤ developer (fixed) |
| Accept requires email match | ✅ Null email rejected (fixed) |
| Tokens not listed in GET invitations | ✅ Token only on create (fixed) |

---

## RBAC Review

| Check | Result |
| ----- | ------ |
| Permission matrix in code | ✅ `server/auth/permissions.ts` |
| Route-level `permission:` checks | ✅ |
| Delete org uses `org:delete` assert | ✅ (fixed; leave still `org:read`) |
| Deny escalation maintainer→admin via invite | ✅ (fixed) |
| Last-admin / owner guards | ✅ |
| Unit tests for ranks / assignment | ✅ Expanded |

---

## Security Review

| Control | Result |
| ------- | ------ |
| Session cookies httpOnly + SameSite=Lax | ✅ |
| Secure cookies in production | ✅ |
| Auth.js OAuth state/CSRF | ✅ Library |
| Mutating API Origin/Referer guard | ✅ When `csrfProtect` (prod default) |
| Compose requires `NEXTAUTH_SECRET` | ✅ No insecure default (fixed) |
| Prod Compose CORS default explicit origin | ✅ (fixed) |
| Secret redaction in logs | ✅ |
| Rate limiting | ✅ |
| Security headers / middleware | ✅ |
| No auth-surface TODO/FIXME/HACK | ✅ |

---

## Database Review

| Check | Result |
| ----- | ------ |
| `prisma validate` | ✅ |
| `prisma migrate status` | ✅ Up to date (2 migrations) |
| Identity models + Invitation | ✅ |
| Cascades Account/Session/Membership/Invitation | ✅ |
| Synthetic negative `githubId` for local orgs | ✅ Documented |

---

## Infrastructure Review

| Check | Result |
| ----- | ------ |
| Docker postgres/redis healthy | ✅ `5433` / `6380` |
| `pnpm infra:check` | ✅ db/redis/queue ok |
| Compose config with secret | ✅ |
| Worker / Redis / BullMQ heartbeat | ✅ (infra queue) |
| Health `/api/live` `/api/ready` `/api/health` `/api/v1/meta` | ✅ (`authConfigured` on meta) |

---

## Testing Review

| Gate | Result |
| ---- | ------ |
| `pnpm typecheck` | ✅ |
| `pnpm lint` | ✅ 0 problems |
| `pnpm test` | ✅ **41/41** (12 files) |
| `pnpm build` | ✅ All Phase 2 routes present |
| New CSRF origin tests | ✅ |
| RBAC assignment tests | ✅ Expanded |

Remaining non-blocking: no live OAuth E2E in CI without GitHub secrets; org route integration tests are service/unit heavy rather than full DB integration.

---

## Performance Review

| Area | Notes |
| ---- | ----- |
| Prisma / Redis singletons | Reused (Phase 1) |
| Session touch | Conditional mid-TTL update — low overhead |
| Middleware | Edge headers only; auth in Node route handlers |
| Build | Succeeds; auth routes dynamic (`ƒ`) |

No release-blocking performance defects found.

---

## Documentation Review

Updated / verified against code:

- `AUTHENTICATION_FLOW.md` — CSRF section corrected
- `RBAC_DOCUMENTATION.md` — delete/invite/transfer/email rules
- `API_SPECIFICATION.md` — banner no longer “design only”
- `README.md` — Compose requires `NEXTAUTH_SECRET`
- `docs/configuration.md` — Phase 2 auth vars (prior)
- Onboarding copy no longer falsely claims tokens are never stored

---

## Open Source Review

| Artifact | Present |
| -------- | ------- |
| LICENSE | ✅ |
| CONTRIBUTING / CoC / SECURITY | ✅ |
| Issue forms / PR template | ✅ |
| CODEOWNERS / Dependabot / workflows | ✅ |
| Docker / Dev Container | ✅ |
| Fresh path: clone → install → `.env.local` → compose/dev | ✅ Documented |

---

## Technical Debt (non-blocking)

1. Auth.js still on `5.0.0-beta.32` — upgrade when stable
2. Invitation tokens stored plaintext (returned once on create; not listed) — hash-at-rest later
3. No transactional email for invites
4. Full settings/org UI still mock-driven (by design; no redesign)
5. Optional Playwright OAuth smoke for CI

---

## Files Modified (this audit)

- `server/auth/csrf.ts`, `permissions.ts`, `index.ts`
- `server/middleware/with-auth.ts`
- `server/services/{invitation,organization,user}-service.ts`
- `server/validation/auth-schemas.ts`
- `server/security/rate-limit.ts`
- `auth.ts` (explicit cookie options)
- `app/api/v1/orgs/[orgId]/route.ts`
- `app/api/v1/users/me/sessions/route.ts`
- `app/api/v1/meta/route.ts`
- `app/onboarding/connect-github/page.tsx`
- `docker-compose.yml`, `README.md`
- `AUTHENTICATION_FLOW.md`, `RBAC_DOCUMENTATION.md`, `API_SPECIFICATION.md`
- `tests/unit/{rbac,csrf-origin}.test.ts`
- `PHASE2_RELEASE_AUDIT.md` (this file)

---

## Issues Found → Fixed

| Severity | Issue | Fix |
| -------- | ----- | --- |
| CRITICAL | CSRF helpers unused | Origin/Referer guard in `withAuth` when `csrfProtect` |
| CRITICAL | Maintainer could invite `admin` | `assertCanAssignRole` + rank-aware `canAssignRole` |
| CRITICAL | Accept invite with null email | Require email match; reject if missing |
| CRITICAL | Compose insecure default secret | `${NEXTAUTH_SECRET:?...}` required |
| HIGH | Email PATCH → steal invites | Remove email from profile update API |
| HIGH | Org DELETE middleware used `org:read` only | `assertPermission(..., 'org:delete')` for delete |
| HIGH | Invitation tokens in list responses | Strip token except on create |
| HIGH | Sessions DELETE didn’t clear cookies | Call `signOut` |
| HIGH | Any admin could transfer ownership | Owner-only transfer |
| HIGH | False “never store token” UI copy | Corrected |
| MEDIUM | API spec “design only” banner | Updated |
| MEDIUM | Stale rate-limit comment | Updated |
| MEDIUM | Meta lacked `authConfigured` | Added |

---

## Risk Assessment

| Risk | After fix |
| ---- | --------- |
| Privilege escalation via invites | Mitigated |
| Cross-site cookie mutation | Mitigated (SameSite + Origin guard) |
| Predictable Compose secret | Mitigated |
| OAuth not CI-tested without secrets | Accepted — operator smoke recommended |

---

## Production Checklist

- [x] Login surface present (Auth.js + Sign In links)
- [x] Logout / logout everywhere
- [x] Session persistence / expiry / refresh
- [x] Org CRUD / leave / transfer
- [x] Invitations / members / roles / permissions
- [x] Docker / Postgres / Redis / BullMQ / Prisma
- [x] Health endpoints
- [x] Typecheck / lint / test / build
- [x] Docs updated
- [x] No TODO/FIXME/HACK on auth surfaces
- [x] No Phase 3 implementation

**Operator pre-tag smoke (optional but recommended):**

```bash
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"
# set GITHUB_OAUTH_CLIENT_ID / _SECRET
cp .env.example .env.local   # fill secrets
docker compose up -d postgres redis
pnpm db:migrate:deploy
pnpm dev
# Sign in via /api/auth/signin/github
curl -i http://localhost:3000/api/v1/auth/session
```

---

## Release Recommendation

Phase 2 authentication and tenancy are production-ready after this audit’s fixes. Create the milestone tag when the optional OAuth smoke (with real GitHub OAuth App credentials) succeeds in your environment.

# ✅ READY TO CREATE TAG v0.2.0-auth

**Do not begin Phase 3 until this tag is cut.**
