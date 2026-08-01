# Phase 2 Implementation Plan — Authentication & Tenancy

**Status:** Approved for implementation  
**Baseline:** Phase 1 tagged `v0.1.0-foundation`  
**Target tag:** `v0.2.0-auth`  
**Constraint:** No Phase 3 (GitHub App). No UI redesign. Repository remains deployable after every module.

---

## 1. Architecture

### 1.1 Auth stack

| Layer | Choice | Rationale |
| ----- | ------ | --------- |
| OAuth | **Auth.js (next-auth v5)** + GitHub provider | Matches `SYSTEM_ARCHITECTURE.md`, `API_SPECIFICATION.md`, `DEVELOPMENT_ROADMAP.md` |
| Sessions | **Database sessions** via Prisma (`Session` table) | Server-backed; logout invalidates; no JWT-only auth |
| Adapter | `@auth/prisma-adapter` + **custom create/get mapping** | Our `User` requires `githubId`/`login`/`avatarUrl` (not Auth.js defaults) |
| Cookies | HTTP-only, `Secure` in production, `SameSite=Lax`, Auth.js CSRF | Spec §11 / architecture security pipeline |
| API guard | `withAuth` / `requireUser` / `requireOrgRole` on top of `withApi` | Extends Phase 1 middleware; deny-by-default for `/api/v1/*` (except public meta/health) |

### 1.2 Request pipeline (Phase 2)

```
Request
  → withApi (requestId, CORS, security headers, rate limit, errors)
  → resolveSession (Auth.js `auth()` / Session cookie)
  → requireUser (401 if missing)
  → requireOrgRole(orgId, minRole) when org-scoped (403 if insufficient)
  → Zod validation
  → service
  → standard API envelope
```

### 1.3 Tenancy model

- **User** — GitHub identity (already in Prisma).
- **Organization** — tenancy boundary (`user` | `organization` types).
- **Membership** — `(userId, organizationId, role)` with roles `admin | maintainer | developer | viewer`.
- **Invitation** — Phase 2 extension (product UX requires invites; absent from original `DATABASE_DESIGN.md`). Documented as intentional schema addition.
- **Personal org** — on first OAuth login, ensure an `Organization` of type `user` owned by the user with `Membership.role = admin`.

### 1.4 RBAC (code-level permissions)

Roles live in Prisma as `MembershipRole`. Permissions are a **code matrix** (not DB tables) — matches design (enum roles) while satisfying Module 7:

| Permission | viewer | developer | maintainer | admin |
| ---------- | ------ | --------- | ---------- | ----- |
| `org:read` | ✓ | ✓ | ✓ | ✓ |
| `org:update` | | | ✓ | ✓ |
| `org:delete` | | | | ✓ |
| `members:read` | ✓ | ✓ | ✓ | ✓ |
| `members:invite` | | | ✓ | ✓ |
| `members:update_role` | | | | ✓ |
| `members:remove` | | | ✓* | ✓ |
| `invitations:manage` | | | ✓ | ✓ |
| `audit:read` | | | ✓ | ✓ |
| `settings:read` | ✓ | ✓ | ✓ | ✓ |
| `settings:update` | | | ✓ | ✓ |
| `ownership:transfer` | | | | ✓ |

\* Maintainers cannot remove admins or change admin roles.

Role inheritance: `admin > maintainer > developer > viewer` (rank comparison).

### 1.5 GitHub App endpoints (Phase 3 stubs)

`GET /api/v1/auth/github/install-url` and `GET /api/v1/auth/github/callback` return **501** with a clear message. No App install logic in Phase 2.

---

## 2. Files to create

### Auth core
- `auth.ts` (root Auth.js config export)
- `types/next-auth.d.ts` (module augmentation)
- `middleware.ts` (protect selected app routes lightly; APIs use `withAuth`)
- `server/auth/index.ts`
- `server/auth/config.ts`
- `server/auth/session.ts`
- `server/auth/cookies.ts`
- `server/auth/csrf.ts`
- `server/auth/adapter.ts`
- `server/auth/github.ts`
- `server/auth/guards.ts`
- `server/auth/permissions.ts`
- `server/auth/rbac.ts`

### Middleware / API helpers
- `server/middleware/with-auth.ts`

### Services
- `server/services/user-service.ts`
- `server/services/organization-service.ts`
- `server/services/membership-service.ts`
- `server/services/invitation-service.ts`
- `server/services/settings-service.ts`
- `server/services/audit-service.ts`

### Validation schemas
- `server/validation/user.ts`
- `server/validation/organization.ts`
- `server/validation/invitation.ts`
- `server/validation/membership.ts`

### API routes
- `app/api/auth/[...nextauth]/route.ts`
- `app/api/v1/auth/session/route.ts`
- `app/api/v1/auth/logout/route.ts`
- `app/api/v1/auth/github/install-url/route.ts` (501)
- `app/api/v1/auth/github/callback/route.ts` (501)
- `app/api/v1/users/me/route.ts`
- `app/api/v1/users/me/organizations/route.ts`
- `app/api/v1/users/me/notifications/route.ts`
- `app/api/v1/users/me/sessions/route.ts`
- `app/api/v1/orgs/route.ts`
- `app/api/v1/orgs/[orgId]/route.ts`
- `app/api/v1/orgs/[orgId]/members/route.ts`
- `app/api/v1/orgs/[orgId]/members/[userId]/route.ts`
- `app/api/v1/orgs/[orgId]/invitations/route.ts`
- `app/api/v1/orgs/[orgId]/invitations/[invitationId]/route.ts`
- `app/api/v1/orgs/[orgId]/settings/route.ts`
- `app/api/v1/orgs/[orgId]/audit-logs/route.ts`
- `app/api/v1/orgs/[orgId]/dashboard/route.ts`
- `app/api/v1/orgs/[orgId]/transfer/route.ts`
- `app/api/v1/invitations/[token]/accept/route.ts`
- `app/api/v1/invitations/[token]/reject/route.ts`
- `app/api/v1/settings/route.ts`

### Tests
- `tests/unit/auth/*.test.ts`, `rbac.test.ts`, `permissions.test.ts`
- `tests/unit/services/*.test.ts`
- `tests/integration/auth.route.test.ts`, `orgs.route.test.ts`, `users.route.test.ts`

### Docs
- `AUTHENTICATION_FLOW.md`
- `RBAC_DOCUMENTATION.md`
- `PHASE2_COMPLETION_SUMMARY.md`
- `PHASE2_REVIEW.md`

---

## 3. Files to modify

| File | Change |
| ---- | ------ |
| `prisma/schema.prisma` | User prefs fields; `Invitation` + `InvitationStatus`; relations; `emailVerified` for Auth.js |
| `prisma/migrations/*` | New migration `phase2_auth` |
| `server/config/env.ts` | Auth env validation helpers; session cookie/TTL knobs |
| `server/config/index.ts` | `features.auth: true`; expose `auth` config block |
| `server/middleware/with-api.ts` | Optional session attachment; keep Phase 1 behavior |
| `server/security/cors.ts` | Credentials support when origin is explicit |
| `server/types/index.ts` | Auth/session/RBAC types |
| `server/constants/index.ts` | Cookie names, CSRF header, permission constants |
| `.env.example` | Uncomment/document OAuth + session vars |
| `docker-compose.yml` | Inject `NEXTAUTH_*` / `GITHUB_OAUTH_*` into web |
| `package.json` | Add `next-auth`, `@auth/prisma-adapter` |
| `README.md`, `docs/*`, `CHANGELOG.md`, `ROADMAP.md`, planning docs | Phase 2 status |
| `lib/api/client.ts` | `credentials: 'include'` |
| Minimal UI wiring only | Sign In → Auth.js; no redesign |

---

## 4. Dependencies

```bash
pnpm add next-auth@5 @auth/prisma-adapter
```

No UI library changes. Prisma already present.

**External:** GitHub OAuth App (user/org settings → OAuth Apps) with callback  
`{NEXTAUTH_URL}/api/auth/callback/github`.

---

## 5. Migration strategy

1. Additive Prisma migration only (no destructive drops).
2. New columns on `User`: `emailVerified`, `theme`, `timezone`, `notificationPrefs` (Json).
3. New table `Invitation` + enum `InvitationStatus`.
4. Existing identity tables unchanged in semantics.
5. Rollback: `prisma migrate resolve` / reverse migration SQL kept in migration folder comments; deploy previous image + DB restore if needed.

---

## 6. Risk analysis

| Risk | Severity | Mitigation |
| ---- | -------- | ---------- |
| Auth.js schema mismatch (`image` vs `avatarUrl`, required `githubId`/`login`) | High | Custom adapter mapping + GitHub `profile()` enrichment |
| OAuth secrets missing in local/UI-only mode | Medium | Soft validation (like Phase 1 infra); `/api/v1/auth/*` returns clear 503/501; app still boots |
| CORS `*` + cookies | High | Disallow credentials with `*`; require explicit `CORS_ORIGIN` for credentialed cross-origin |
| Invitation email delivery | Medium | Phase 2 stores invitations + accept links; email sending stubbed (token returned in API for self-host/dev) |
| Org `githubId` required before GitHub App | Medium | Personal orgs use user's GitHub id; created orgs use generated negative synthetic ids documented until Phase 3 sync |
| Session fixation / CSRF | High | Auth.js built-in state + CSRF; rotate session on login |
| Over-scoping UI changes | Low | Touch only Sign In / credentials on API client; no design system edits |

---

## 7. Module order & acceptance

| Module | Deliverable | Gate |
| ------ | ----------- | ---- |
| 0 | This plan | Reviewed |
| 1 | Auth folder, guards, cookies, CSRF utilities | typecheck/lint/test/build |
| 2 | GitHub OAuth login/callback/logout/session | same + manual OAuth smoke when secrets present |
| 3 | Prisma migration (prefs + Invitation) | `db:validate` + migrate |
| 4 | User `/me` profile/prefs | gates |
| 5 | Organizations CRUD-ish + invitations accept/reject | gates |
| 6 | Members invite/remove/role | gates |
| 7 | RBAC matrix + protect APIs | gates |
| 8 | Security hardening (cookies, logout-all, refresh) | gates |
| 9 | Settings backends | gates |
| 10 | Full test suite | gates |
| 11 | Docs | review |
| 12 | Production review + summaries | **binary DoD** |

After **each** module: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`.

---

## 8. Acceptance criteria (Definition of Done)

- [ ] GitHub OAuth login works (with configured secrets)
- [ ] Logout invalidates DB session + cookie
- [ ] Session persistence across requests
- [ ] Session expiry enforced
- [ ] Session refresh / extension on activity (Auth.js / custom sliding window)
- [ ] Logout everywhere (delete all user sessions)
- [ ] User profile + preferences persist
- [ ] Organizations list/create/rename/delete (policy-enforced)
- [ ] Invitations create/accept/reject
- [ ] Members list/update role/remove
- [ ] RBAC enforced on org APIs
- [ ] Protected APIs return 401/403 correctly
- [ ] Docker Compose injects auth env
- [ ] Tests pass; lint/typecheck/build pass
- [ ] Docs updated; `AUTHENTICATION_FLOW.md` + `RBAC_DOCUMENTATION.md`
- [ ] `PHASE2_COMPLETION_SUMMARY.md` + `PHASE2_REVIEW.md`
- [ ] Decision: `✅ PHASE 2 COMPLETE — READY TO CREATE TAG v0.2.0-auth`
- [ ] **No Phase 3 work**

---

## 9. Out of scope (explicit)

- GitHub App install / webhooks / installation tokens (Phase 3)
- Repository sync (Phase 4)
- AI / Automation / Marketplace
- Frontend redesign, design-system changes, mock data removal beyond minimal Sign In wiring
- Transactional email provider (invitation tokens exposed via API for Phase 2)

---

## 10. Implementation notes

- Prefer extending `withApi` via `withAuth` rather than replacing it.
- All mutations that change membership/ownership write `AuditLog`.
- Public endpoints remain: `/api/live`, `/api/health`, `/api/ready`, `/api/v1/meta`, Auth.js routes, invitation accept/reject by token (auth optional for accept if email matches — require login).
- Flip `features.auth` to `true` in config when Module 2 lands.
