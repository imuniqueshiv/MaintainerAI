# MaintainerAI — API Specification

> Complete REST surface for MaintainerAI v1.0.
> **Implemented today:** Phase 1 health/meta, Phase 2 Auth/Users/Orgs/Invitations/Settings, Phase 3 GitHub App / installations / repository metadata / webhooks.
> Sections marked **Phase 4+** (or without a live `app/api` route) are design targets — do not treat them as shipped contracts.
> Maps to entities in `DATABASE_DESIGN.md` and UI routes in `app/`.

## 1. Conventions

- **Base path:** `/api/v1`. All endpoints JSON unless noted (SSE for AI streaming, `202` for async).
- **Auth:** session cookie (Auth.js) for the app; `Authorization: Bearer <api_key>` reserved for the future SDK/CLI. Every request resolves `user → organization → installation scope`.
- **Tenancy:** repo resources are addressed by `:repoId` (UUID) or `:owner/:name`; access requires an active `Installation` covering that repo.
- **Pagination:** cursor-based — `?limit=` (default 25, max 100) + `?cursor=`; responses include `{ data, pageInfo: { nextCursor, hasNextPage } }`.
- **Filtering/sorting:** `?state=`, `?priority=`, `?q=`, `?sort=`, `?order=asc|desc` where sensible.
- **Idempotency:** unsafe POSTs accept `Idempotency-Key` header.
- **Errors:** consistent envelope
  ```json
  { "error": { "code": "not_found", "message": "Repository not found", "details": {} } }
  ```
- **Status codes:** `200` ok, `201` created, `202` accepted (queued), `204` no content, `400/422` validation, `401` unauth, `403` forbidden (scope), `404` not found, `409` conflict, `429` rate limited, `5xx` server.
- **Versioning:** breaking changes → `/api/v2`. Deprecations via `Sunset` header.

## 2. Endpoint Groups Overview

| Group | Base | Backing tables |
| ----- | ---- | -------------- |
| Authentication | `/api/auth`, `/api/v1/auth` | User, Account, Session |
| Users | `/api/v1/users` | User, Membership |
| Organizations | `/api/v1/orgs` | Organization, Membership |
| GitHub / Installations | `/api/v1/github` | Installation, WebhookEvent |
| Repositories | `/api/v1/repos` | Repository, Label, RepositoryHealth |
| Issues | `/api/v1/repos/:repoId/issues` | Issue + graph |
| Pull Requests | `/api/v1/repos/:repoId/pulls` | PullRequest + graph |
| Contributors | `/api/v1/repos/:repoId/contributors` | Contributor, RepoContributor |
| AI | `/api/v1/ai` | AIConversation, AIMessage |
| Automation | `/api/v1/repos/:repoId/automations` | Automation, AutomationRun |
| Marketplace | `/api/v1/marketplace` | Plugin |
| Plugins | `/api/v1/plugins` | PluginInstallation |
| Notifications | `/api/v1/notifications` | Notification |
| Settings | `/api/v1/settings` | User/Org settings |
| Webhooks | `/api/webhooks/github` | WebhookEvent |
| System | `/api/health`, `/api/ready` | — |

## 3. Authentication

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET/POST | `/api/auth/[...nextauth]` | Auth.js GitHub OAuth (login, callback, session, signout) |
| GET | `/api/v1/auth/session` | Current session + user |
| POST | `/api/v1/auth/logout` | Invalidate session (`{ everywhere?: boolean }`) |
| GET | `/api/v1/auth/github/install-url` | Authenticated GitHub App install URL + CSRF state cookie |
| GET | `/api/v1/auth/github/callback` | App install callback → upsert Installation → redirect |

## 4. Users

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/users/me` | Current user profile |
| PATCH | `/api/v1/users/me` | Update profile (name, email, theme, timezone, prefs, avatar) |
| GET | `/api/v1/users/me/organizations` | Orgs the user belongs to |
| GET | `/api/v1/users/me/notifications` | Notifications inbox |
| GET | `/api/v1/users/me/sessions` | Active sessions (fingerprints) |
| DELETE | `/api/v1/users/me/sessions` | Logout everywhere |
| DELETE | `/api/v1/users/me` | Delete account (cascades sessions) |
| GET/PATCH | `/api/v1/settings` | User settings (theme, timezone, notification prefs) |

## 5. Organizations

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/orgs` | List orgs for current user |
| POST | `/api/v1/orgs` | Create organization (caller becomes admin) |
| GET | `/api/v1/orgs/:orgId` | Org detail + caller role |
| PATCH | `/api/v1/orgs/:orgId` | Rename / update org (`org:update`) |
| DELETE | `/api/v1/orgs/:orgId` | Delete org (admin) or `?leave=true` to leave |
| GET | `/api/v1/orgs/:orgId/members` | List memberships |
| PATCH | `/api/v1/orgs/:orgId/members/:userId` | Change role |
| DELETE | `/api/v1/orgs/:orgId/members/:userId` | Remove member |
| GET/POST | `/api/v1/orgs/:orgId/invitations` | List / create invitations |
| DELETE | `/api/v1/orgs/:orgId/invitations/:invitationId` | Revoke invitation |
| POST | `/api/v1/invitations/:token/accept` | Accept invitation |
| POST | `/api/v1/invitations/:token/reject` | Reject invitation |
| GET/PATCH | `/api/v1/orgs/:orgId/settings` | Org settings |
| POST | `/api/v1/orgs/:orgId/transfer` | Transfer ownership |
| GET | `/api/v1/orgs/:orgId/dashboard` | Aggregated org dashboard stats |
| GET | `/api/v1/orgs/:orgId/audit-logs` | Audit trail (paginated) |

## 6. GitHub / Installations

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/github/app` | GitHub App + primary installation summary (live) |
| GET | `/api/v1/github/installations` | List installations for user's orgs |
| GET | `/api/v1/github/installations/:id` | Installation detail |
| POST | `/api/v1/github/installations/:id` | Refresh installation + repository **metadata** (not issue/PR sync) |
| GET | `/api/v1/github/installations/:id/status` | Health / sync / last webhook |
| GET | `/api/v1/github/installations/:id/permissions` | Permission + webhook event snapshot |
| GET | `/api/v1/github/installations/:id/repositories` | Discover accessible repos from GitHub |
| POST | `/api/v1/github/installations/:id/repositories` | Connect selected repos (`githubIds`) |
| DELETE | `/api/v1/github/installations/:id` | Local disconnect |
| GET | `/api/v1/github/rate-limit` | Current rate-limit remaining/limit |

> Full issue/PR repository sync (`…/sync`) is **Phase 4+** and is not implemented.

## 7. Repositories

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/repos` | List connected repos (filters: `?orgId`, `?q`, `?language`, `?private`) |
| GET | `/api/v1/repos/:repoId` | Repo metadata detail |
| POST | `/api/v1/repos/connect` | Connect repos from an installation |
| POST | `/api/v1/repos/:repoId/refresh` | Refresh metadata from GitHub |
| DELETE | `/api/v1/repos/:repoId` | Disconnect repo (soft delete) |
| GET | `/api/v1/repos/:repoId/health` | Latest health metrics — **Phase 4+** |
| GET | `/api/v1/repos/:repoId/health/history` | Health trend — **Phase 4+** |
| POST | `/api/v1/repos/:repoId/health/recompute` | Recompute health — **Phase 4+** |
| GET | `/api/v1/repos/:repoId/insights` | AI insights — **Phase 5+** |
| POST | `/api/v1/repos/:repoId/insights/:insightId/resolve` | Resolve insight — **Phase 5+** |
| GET | `/api/v1/repos/:repoId/labels` | Repo labels — **Phase 4+** |
| GET | `/api/v1/repos/:repoId/activity` | Activity timeline — **Phase 4+** |

## 8. Issues

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/repos/:repoId/issues` | List issues (`?state`, `?priority`, `?label`, `?assignee`, `?q`, `?aiGenerated`) |
| POST | `/api/v1/repos/:repoId/issues` | Create issue (also pushes to GitHub) |
| GET | `/api/v1/repos/:repoId/issues/:number` | Issue detail (`IssueDetailExtended`) |
| PATCH | `/api/v1/repos/:repoId/issues/:number` | Update (title, description, state, priority) |
| POST | `/api/v1/repos/:repoId/issues/:number/transition` | State machine transition (draft→open→claimed→…→closed) |
| POST | `/api/v1/repos/:repoId/issues/:number/labels` | Add labels |
| DELETE | `/api/v1/repos/:repoId/issues/:number/labels/:labelId` | Remove label |
| POST | `/api/v1/repos/:repoId/issues/:number/assignees` | Assign contributors |
| DELETE | `/api/v1/repos/:repoId/issues/:number/assignees/:contributorId` | Unassign |
| GET | `/api/v1/repos/:repoId/issues/:number/timeline` | Timeline events |
| GET | `/api/v1/repos/:repoId/issues/:number/checklist` | Checklist items |
| PATCH | `/api/v1/repos/:repoId/issues/:number/checklist/:itemId` | Toggle checklist item |
| GET | `/api/v1/repos/:repoId/issues/:number/dependencies` | Depends-on / blocks graph |
| POST | `/api/v1/repos/:repoId/issues/:number/comments` | Comment (proxied to GitHub) |

## 9. Pull Requests

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/repos/:repoId/pulls` | List PRs (`?state`, `?author`, `?ciStatus`, `?q`) |
| GET | `/api/v1/repos/:repoId/pulls/:number` | PR review detail (`PRReviewDetail`) |
| GET | `/api/v1/repos/:repoId/pulls/:number/files` | Changed files (`CodeChange[]`) |
| GET | `/api/v1/repos/:repoId/pulls/:number/checks` | CI checks (`ReviewCheck[]`) |
| GET | `/api/v1/repos/:repoId/pulls/:number/comments` | Threaded review comments |
| POST | `/api/v1/repos/:repoId/pulls/:number/comments` | Add review comment |
| GET | `/api/v1/repos/:repoId/pulls/:number/ai-review` | AI review summary (`AIReviewSummary`) |
| POST | `/api/v1/repos/:repoId/pulls/:number/ai-review` | Run AI review → `202` |
| GET | `/api/v1/repos/:repoId/pulls/:number/merge-readiness` | Merge score/blockers/warnings |
| POST | `/api/v1/repos/:repoId/pulls/:number/reviews` | Submit review (approve/request-changes/comment) |
| POST | `/api/v1/repos/:repoId/pulls/:number/merge` | Merge PR (proxied to GitHub) |

## 10. Contributors

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/repos/:repoId/contributors` | Contributor analytics list (`mockContributors`) |
| GET | `/api/v1/repos/:repoId/contributors/:login` | Contributor profile (`ContributorProfile`) |
| GET | `/api/v1/repos/:repoId/contributors/:login/badges` | Earned badges |
| GET | `/api/v1/repos/:repoId/contributors/:login/activity` | Activity by month |
| GET | `/api/v1/repos/:repoId/contributors/leaderboard` | Ranked by contributions |

## 11. AI

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/ai/actions` | Available `CopilotAction`s + descriptions (`copilotActions`) |
| GET | `/api/v1/ai/conversations` | List user conversations |
| POST | `/api/v1/ai/conversations` | Create conversation (optional `repositoryId`) |
| GET | `/api/v1/ai/conversations/:id` | Conversation + messages |
| PATCH | `/api/v1/ai/conversations/:id` | Rename / pin |
| DELETE | `/api/v1/ai/conversations/:id` | Delete |
| POST | `/api/v1/ai/conversations/:id/messages` | Send message (non-streaming) |
| POST | `/api/v1/ai/stream` | **SSE** streaming completion (replaces `use-copilot` setTimeout) |
| POST | `/api/v1/ai/actions/generate-issue` | Structured action: draft an issue |
| POST | `/api/v1/ai/actions/review-pr` | Action: review a PR |
| POST | `/api/v1/ai/actions/generate-labels` | Action: suggest labels |
| POST | `/api/v1/ai/actions/generate-changelog` | Action: changelog/release notes |
| POST | `/api/v1/ai/actions/find-duplicates` | Action: duplicate issue detection |
| POST | `/api/v1/ai/actions/generate-documentation` | Action: docs generation |
| POST | `/api/v1/ai/actions/suggest-contributors` | Action: suggest contributors |
| POST | `/api/v1/ai/actions/generate-roadmap` | Action: roadmap draft |
| POST | `/api/v1/ai/actions/explain-code` | Action: explain code |

> Each `POST /actions/*` accepts `{ repositoryId, context, stream? }`. When `stream:true`, responds as SSE. All actions persist to `AIConversation`/`AIMessage` with token usage.

## 12. Automation

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/repos/:repoId/automations` | List automations (`mockAutomations`) |
| POST | `/api/v1/repos/:repoId/automations` | Create automation (node graph from builder) |
| GET | `/api/v1/repos/:repoId/automations/:id` | Automation detail + nodes |
| PATCH | `/api/v1/repos/:repoId/automations/:id` | Update graph / enable / disable |
| DELETE | `/api/v1/repos/:repoId/automations/:id` | Delete |
| POST | `/api/v1/repos/:repoId/automations/:id/run` | Manual trigger → `202` |
| GET | `/api/v1/repos/:repoId/automations/:id/runs` | Run history (`AutomationRun`) |
| GET | `/api/v1/automations/node-types` | Available triggers/conditions/actions for the builder |
| GET | `/api/v1/automations/templates` | Built-in templates (auto-label, stale, welcome, issue-claim) |

## 13. Marketplace

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/marketplace/plugins` | Browse catalog (`?category`, `?q`, `?official`) |
| GET | `/api/v1/marketplace/plugins/:slug` | Plugin detail |
| GET | `/api/v1/marketplace/categories` | Categories |

## 14. Plugins

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/plugins` | Installed plugins for an org |
| POST | `/api/v1/plugins` | Install a plugin (`{ pluginId, repositoryId?, config }`) |
| GET | `/api/v1/plugins/:id` | Installation detail |
| PATCH | `/api/v1/plugins/:id` | Enable/disable, update config |
| DELETE | `/api/v1/plugins/:id` | Uninstall |

## 15. Notifications

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/notifications` | Inbox (`?unread=true`) |
| GET | `/api/v1/notifications/unread-count` | Badge count |
| POST | `/api/v1/notifications/:id/read` | Mark one read |
| POST | `/api/v1/notifications/read-all` | Mark all read |
| DELETE | `/api/v1/notifications/:id` | Dismiss |

## 16. Settings

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/v1/settings` | User + org settings (profile, notifications, integrations, ai-settings, security, advanced) |
| PATCH | `/api/v1/settings/profile` | Update profile |
| PATCH | `/api/v1/settings/notifications` | Notification preferences |
| PATCH | `/api/v1/settings/ai` | AI provider/model config |
| PATCH | `/api/v1/settings/security` | Security preferences |
| GET | `/api/v1/settings/api-keys` | List API keys (Future/SDK) |
| POST | `/api/v1/settings/api-keys` | Create API key (returns once) |
| DELETE | `/api/v1/settings/api-keys/:id` | Revoke key |

## 17. Webhooks (inbound from GitHub)

| Method | Path | Description |
| ------ | ---- | ----------- |
| POST | `/api/webhooks/github` | Verifies `X-Hub-Signature-256`, records `WebhookEvent` (idempotent by `X-GitHub-Delivery`), enqueues `github.webhooks` job, returns `202`. Phase 3 handles `installation`, `installation_repositories`, `repository` only; all other events are logged and ignored. |

## 18. System

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/health` | Liveness (process up) |
| GET | `/api/ready` | Readiness (DB + Redis reachable) |
| GET | `/api/v1/meta` | Version, build, feature flags |

## 19. Standard Response Shapes

**List**
```json
{ "data": [ /* resources */ ], "pageInfo": { "nextCursor": "opaque", "hasNextPage": true } }
```

**Single**
```json
{ "data": { /* resource */ } }
```

**Async accepted**
```json
{ "data": { "jobId": "uuid", "status": "queued" } }
```

**Error**
```json
{ "error": { "code": "forbidden", "message": "No installation grants access to this repository", "details": {} } }
```

## 20. Cross-Cutting Rules

- **Rate limiting:** per-user and per-installation sliding windows (Redis); `429` with `Retry-After`.
- **Validation:** Zod schemas per endpoint; `422` with field-level `details`.
- **Authorization:** repo endpoints assert an active `Installation` covers `:repoId`; org endpoints assert `Membership` role.
- **Auditing:** all mutating endpoints write an `AuditLog` row.
- **Write-through to GitHub:** mutations that have a GitHub counterpart (issue create/label/assign/comment, PR review/merge) perform the GitHub write via the installation token, then reconcile local state; webhook echoes are deduped via `WebhookEvent`.
- **Consistency with UI:** field names/enums mirror `lib/*-types.ts` so the frontend can drop mock imports for typed API calls with minimal change.
