# Phase 3 Release Audit — v0.3.0-github-app

**Auditor role:** Release Manager / Principal QA / Security / Platform  
**Date:** 2026-08-01  
**Method:** Independent verification from the codebase (prior `PHASE3_*` summaries treated as claims, not evidence)  
**Scope:** Phase 3 GitHub App platform only — no Phase 4 implementation

---

## Executive Summary

Phase 3 is **implemented and production-hardenable**. An independent audit found **real Critical/High defects** in the pre-audit code (install CSRF bypass, installation hijack, org login takeover, Compose worker missing App credentials, webhook rate-limit risk, select-repos deselect gap). Those defects were **fixed in this audit pass**.

All quality gates now pass: typecheck, lint, **56** tests, build, Prisma validate/migrate status, infra:check, Docker Postgres/Redis healthy.

**Recommendation:** Create tag `v0.3.0-github-app` after commit.

---

## Architecture Review

| Claim | Verified |
| ----- | -------- |
| Single GitHub boundary (`server/github/*`) | ✅ Routes use services → github layer; no direct Octokit in handlers |
| Models reuse `Installation` / `Repository` / `WebhookEvent` | ✅ No parallel `GitHubInstallation` / `WebhookDelivery` tables |
| Tokens in Redis only | ✅ `server/github/tokens.ts` |
| `features.repositorySync: false` | ✅ Config |
| Event allowlist Phase 3 only | ✅ `installation`, `installation_repositories`, `repository` |

---

## GitHub App Review

| Check | Result |
| ----- | ------ |
| Env config + PEM `\n` normalize | ✅ |
| App JWT / install tokens via `@octokit/auth-app` | ✅ |
| Token cache TTL with expiry skew | ✅ |
| Private key `BEGIN` validation | ✅ |
| Install URL builder | ✅ |
| User installation access verification | ✅ **Fixed** — `userCanAccessInstallation` via OAuth token |
| Stub 503 install routes | ✅ Removed — live handlers |

---

## Installation Flow Review

| Check | Result |
| ----- | ------ |
| Install URL + httpOnly state cookie | ✅ |
| Callback **requires** state cookie + query match | ✅ **Fixed** (was optional → hijack) |
| Verify caller can see installation on GitHub | ✅ **Fixed** |
| Refuse reassignment of active installs | ✅ **Fixed** |
| Org resolve by GitHub id only (no synthetic login takeover) | ✅ **Fixed** |
| Personal org path | ✅ |
| Disconnect / webhook uninstall | ✅ |
| Reinstall after `deleted` | ✅ (may re-link org) |

---

## Repository Discovery Review

| Check | Result |
| ----- | ------ |
| List installation repos (paginated) | ✅ |
| Metadata-only (no issue/PR sync) | ✅ |
| Connect / disconnect / refresh | ✅ |
| Select-repos `replace: true` disconnects deselected | ✅ **Fixed** |
| Dashboard / repos / github-app / install live | ✅ No `mockRepositories` on those paths |
| Marketing / health / AI pages still mocked | ⚠️ Accepted Phase 4+/5 debt |

---

## Webhook Review

| Check | Result |
| ----- | ------ |
| `POST /api/webhooks/github` | ✅ |
| HMAC SHA-256 timing-safe | ✅ |
| Idempotent `deliveryId` + `P2002` race handling | ✅ **Fixed** |
| Atomic claim (`received` → `processing`) | ✅ **Fixed** |
| BullMQ `github.webhooks` + worker | ✅ |
| Compose worker has `GITHUB_APP_*` | ✅ **Fixed** |
| `GITHUB_WEBHOOK_INLINE` for no-worker installs | ✅ **Added** |
| Webhook route skips API rate limit | ✅ **Fixed** |
| Unknown events logged + ignored | ✅ |

---

## Database Review

| Spec name (mission) | Actual model | Status |
| ------------------- | ------------ | ------ |
| GitHubInstallation | `Installation` | ✅ Reuse |
| Repository | `Repository` | ✅ |
| RepositoryConnection | soft-delete via `deletedAt` | ✅ |
| WebhookDelivery | `WebhookEvent` | ✅ |
| InstallationAudit | `AuditLog` actions | ✅ |
| RepositoryPermission | `Repository.permissions` JSON | ✅ |

Migration `20260801120000_phase3_github_app` applied; schema up to date.

---

## Security Review

| Issue | Severity | Status |
| ----- | -------- | ------ |
| Optional install `state` (hijack) | Critical | **Fixed** |
| Org login → overwrite synthetic githubId | Critical | **Fixed** |
| Upsert reassigns `organizationId` | Critical | **Fixed** |
| No proof user owns GH installation | High | **Fixed** |
| Worker without App secrets | Critical (ops) | **Fixed** |
| Webhook 429 under burst | High | **Fixed** |
| Secrets in repo | — | ✅ Placeholders only |
| Secrets in logs | — | ✅ No token logging |
| CSRF on mutating APIs | — | ✅ Origin checks retained |
| RBAC `github:*` / `repos:*` | — | ✅ |

**Residual risk:** OAuth `access_token` must exist on `Account` for install callback; users must re-login if missing. Redis stores install tokens in plaintext (TTL-bounded; document Redis hardening).

---

## Dashboard Review

Live data via `lib/hooks/use-github.ts` → `/api/v1/repos` and `/api/v1/github/app` on:

- `/dashboard`
- `/repositories`
- `/github-app`
- `/install`
- `/onboarding/select-repositories`

Activity timeline on dashboard remains mock (Phase 4+).

---

## API Review

Verified live:

- `GET /api/v1/auth/github/install-url`
- `GET /api/v1/auth/github/callback`
- `GET /api/v1/github/app|installations|rate-limit`
- `GET|POST|DELETE /api/v1/github/installations/:id` (+ status, permissions, repositories)
- `GET /api/v1/repos`, `POST /api/v1/repos/connect`, `GET|DELETE /api/v1/repos/:repoId`, `POST …/refresh`
- `POST /api/webhooks/github`

Authz via `withAuth` + `requireInstallationAccess` / `requireOrgAccess`. Zod validation present. Error envelopes via `AppError`.

---

## Testing Review

| Suite | Count / notes |
| ----- | ------------- |
| Total | **56 passed** |
| Webhook HMAC | unit |
| Tokens / install URL | unit (mocked auth-app) |
| RBAC github/repos | unit |
| Install state schema + replace flag | unit (audit) |
| Route auth + webhook reject path | integration |
| Vitest | `hookTimeout: 60s`, `fileParallelism: false` (Windows import reliability) |

Still not covered E2E against real GitHub (requires operator secrets — correct for CI).

---

## Performance Review

| Area | Notes |
| ---- | ----- |
| Octokit timeout | 15s |
| Retries | 429/5xx with backoff |
| Token cache | Redis |
| Repo list | paginated; hard stop page 50 |
| Webhook | queue preferred; inline option |
| Bundle | Next build succeeded |

---

## Documentation Review

Updated during audit:

- `PRODUCT_SPEC.md` — Phase 3 complete; next = Phase 4; removed “backend not built” contradiction
- `API_SPECIFICATION.md` — intro reflects Phase 3 shipped
- `README.md` — architecture strip updated
- `SYSTEM_ARCHITECTURE.md` — REST-only Phase 3; no GraphQL claim
- `docs/deployment.md` — callback/webhook/worker/Vercel notes
- `docs/configuration.md` — `GITHUB_WEBHOOK_INLINE`
- `GITHUB_APP_SETUP.md` / `WEBHOOKS.md` — security + inline/worker
- `SECURITY.md` — 0.2.x / 0.3.x support rows
- `.github/CODEOWNERS` — `server/`, `prisma/`, `scripts/`, `tests/`

`API_SPEC` still documents future Issues/PRs sections as design — marked as Phase 4+ in intro (acceptable).

---

## Open Source Review

| Asset | Status |
| ----- | ------ |
| LICENSE / CONTRIBUTING / SECURITY / COC | ✅ |
| Issue/PR templates, Dependabot, CI | ✅ CI runs lint/typecheck/test/build |
| Docker / Compose / Devcontainer | ✅ Worker now receives App env |
| `.env.example` | ✅ Placeholders only |

---

## Deployment Review

| Requirement | Status |
| ----------- | ------ |
| Postgres + Redis | ✅ |
| Migrate service | ✅ |
| Web + worker | ✅ worker App env fixed |
| Callback URL | Documented |
| Webhook URL | Documented |
| Vercel note | Web OK; need worker or inline |

---

## Technical Debt (accepted for v0.3.0)

1. Health / AI / issues / PR UI pages still use mocks (Phase 4/5).
2. Dashboard activity timeline mock.
3. No GraphQL Octokit yet.
4. No live GitHub E2E in CI.
5. `openPRs` / `collaborators` metadata not populated from GitHub list API.
6. CONTRIBUTING still light on worker/migrate for Phase 3 (deployment docs cover it).

---

## Files Audited (representative)

`server/github/*`, `server/services/{installation,repository-github,webhook}-service.ts`, `app/api/v1/github/**`, `app/api/v1/repos/**`, `app/api/v1/auth/github/**`, `app/api/webhooks/github`, `app/dashboard|repositories|github-app|install|onboarding/**`, `prisma/schema.prisma` + Phase 3 migration, `docker-compose.yml`, `scripts/worker.ts`, tests under `tests/**/github*`, docs listed above.

---

## Files Modified During Audit (hardening)

- `app/api/v1/auth/github/callback/route.ts` — mandatory state + user access check
- `server/services/installation-service.ts` — org resolve + no hijack reassignment
- `server/github/client.ts` — `userCanAccessInstallation`; safer 401 re-list
- `server/services/webhook-service.ts` — P2002 + atomic claim + inline flag
- `server/services/repository-github-service.ts` — `replace` disconnect
- `app/api/webhooks/github/route.ts` — `skipRateLimit: true`
- `docker-compose.yml` — worker `GITHUB_APP_*`
- `server/config/env.ts` + `index.ts` — `GITHUB_WEBHOOK_INLINE`
- Docs / CODEOWNERS / SECURITY / vitest.config / tests

---

## Issues Found → Fixed

| # | Issue | Fix |
| - | ----- | --- |
| 1 | Install state CSRF optional | Require cookie + query |
| 2 | Installation hijack by ID | OAuth `GET /user/installations` gate |
| 3 | Org login takeover | Resolve by githubId only; conflict on login collision |
| 4 | Upsert steals org | Never reassign active `organizationId` |
| 5 | Worker missing App env | Compose inject |
| 6 | Webhook rate limit | Skip on webhook route |
| 7 | Idempotency race | Catch P2002; atomic claim |
| 8 | Select-repos can’t deselect | `replace: true` |
| 9 | Doc contradictions | PRODUCT_SPEC / API intro / README / architecture |
| 10 | Flaky test hooks on Windows | Vitest hookTimeout + serial files |

---

## Risk Assessment

| Risk | Level after fix |
| ---- | --------------- |
| Installation hijacking | Low |
| Org takeover | Low |
| Webhook forgery | Low (HMAC) |
| Worker silent failures in Compose | Low |
| Operator misconfig (missing PEM) | Medium (503 + docs) |
| Redis token cache compromise | Medium (ops) |

---

## Production Checklist

- [x] Installation / callback / JWT / tokens
- [x] Repository discovery + metadata + connect/disconnect
- [x] Dashboard live repos (Phase 3 surfaces)
- [x] Webhook verify + logging + queue
- [x] Docker Postgres/Redis
- [x] Prisma migrate status up to date
- [x] Typecheck / lint / test / build / infra
- [x] Docs updated for Phase 3 security model
- [x] No Phase 4 sync implemented
- [ ] Operator fills `.env.local` secrets (manual)
- [ ] Create git tag `v0.3.0-github-app` (release step)

---

## Release Recommendation

Independent audit found critical defects; all release-blocking items were fixed and re-validated.

✅ **READY TO CREATE TAG v0.3.0-github-app**
