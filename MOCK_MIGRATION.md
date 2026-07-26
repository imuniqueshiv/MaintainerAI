# Mock Migration Map

> Phase 1 keeps all UI mocks intact. This document lists every mock source and the planned backend replacement so future milestones can migrate without guesswork.
>
> **Rule:** Do not remove a mock until its API + data path is live and the page is wired.

## Status legend

| Status           | Meaning                                           |
| ---------------- | ------------------------------------------------- |
| Active           | Still imported by UI                              |
| Ready to replace | Infrastructure exists; business API not yet built |
| Replaced         | Live data only (none in Phase 1)                  |

## Mock inventory

| Mock export / source                   | Consumed by                                                                                                                                      | Planned replacement                               | Milestone | Status |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | --------- | ------ |
| `mockRepositories`                     | `app/dashboard`, `app/repositories`, `app/health`, `app/ai-generator`, `app/github-app`, `app/onboarding/select-repositories`, marketing preview | `GET /api/v1/repos` + sync workers                | M4        | Active |
| `mockIssues`                           | `app/issues`                                                                                                                                     | `GET /api/v1/repos/:id/issues`                    | M4        | Active |
| `mockPullRequests`                     | `app/pull-requests`                                                                                                                              | `GET /api/v1/repos/:id/pulls`                     | M4        | Active |
| `mockDashboardStats`                   | `app/dashboard`                                                                                                                                  | `GET /api/v1/dashboard`                           | M4        | Active |
| `mockActivityTimeline`                 | `app/activity`, dashboard                                                                                                                        | `GET /api/v1/repos/:id/activity`                  | M4        | Active |
| `mockTeamMembers`                      | settings / org surfaces (if used)                                                                                                                | `GET /api/v1/orgs/:id/members`                    | M2–M4     | Active |
| `mockNotifications`                    | navbar / notifications UI                                                                                                                        | `GET /api/v1/notifications`                       | M4        | Active |
| `mockRepositoryHealth`                 | `app/health`                                                                                                                                     | `GET /api/v1/repos/:id/health`                    | M4        | Active |
| `mockAIInsights`                       | `app/insights`                                                                                                                                   | `GET /api/v1/repos/:id/insights`                  | M4–M5     | Active |
| `mockContributors`                     | `app/contributors`                                                                                                                               | `GET /api/v1/repos/:id/contributors`              | M4        | Active |
| `mockAutomations`                      | `app/automation`                                                                                                                                 | `GET /api/v1/repos/:id/automations`               | M6        | Active |
| `mockGitHubApp`                        | `app/github-app`                                                                                                                                 | `GET /api/v1/github/app`                          | M3        | Active |
| `hooks/use-copilot.ts` timer responses | Copilot panel                                                                                                                                    | `POST /api/v1/ai/stream`                          | M5        | Active |
| Inline fixtures in feature components  | issue detail, PR review, contributor profile, automation builder                                                                                 | Matching REST resources in `API_SPECIFICATION.md` | M4–M6     | Active |
| `lib/contributor-types.ts` badge seeds | contributor UI                                                                                                                                   | `ContributorBadge` table + API                    | M4        | Active |

## Infrastructure ready (Phase 1)

These exist now and unblock mock replacement later:

- Prisma schema for all entities in `DATABASE_DESIGN.md`
- PostgreSQL + Redis via Docker Compose
- BullMQ worker process (infrastructure heartbeat only)
- Standard API envelope (`server/lib/api-response.ts`)
- Typed client scaffold (`lib/api/client.ts`)
- Health endpoints proving dependency wiring

## Migration procedure (per page)

1. Implement the REST endpoint(s) for the resource.
2. Prefer Server Components / server loaders for reads.
3. Swap mock import for `apiFetch` or server data-access call.
4. Keep empty states identical.
5. Mark the row above as **Replaced**.
6. Delete unused mock exports only when zero imports remain.

## Explicit non-goals for Phase 1

- Do not delete `lib/mock-data.ts`
- Do not change page markup while wiring infrastructure
- Do not seed production-like fake rows into Postgres for UI demos
