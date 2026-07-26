# Phase 1 — Implementation Plan

> Engineering Foundation only. No OAuth, GitHub App, sync, AI, automation, or marketplace business logic.
> Authority: `PRODUCT_SPEC.md` §8 Phase 1, `DEVELOPMENT_ROADMAP.md` Milestone 1, `SYSTEM_ARCHITECTURE.md`, `DATABASE_DESIGN.md`.

**Status:** Ready for implementation  
**Scope freeze:** Frontend UI, design system, and mock-driven pages remain untouched except documentation of mock sources.

---

## 1. Current architecture review

| Area                  | Current state                        | Phase 1 target                                         |
| --------------------- | ------------------------------------ | ------------------------------------------------------ |
| Frontend              | Production UI, ~30 routes, mock data | Unchanged                                              |
| `app/api/`            | Missing                              | Health / ready / live / meta                           |
| `server/`             | Missing                              | Full infrastructure layer                              |
| Database              | None                                 | Prisma + PostgreSQL schema per `DATABASE_DESIGN.md`    |
| Redis                 | None                                 | Singleton client + health                              |
| Queues                | None                                 | BullMQ manager + example infra job + worker entrypoint |
| Config                | `.env.example` undocumented stubs    | Zod-validated typed config                             |
| Logging               | None                                 | Pino structured logger                                 |
| Errors / API envelope | None                                 | Centralized errors + response helpers                  |
| Validation            | None                                 | Zod request helpers                                    |
| Docker Compose        | App only                             | + postgres, redis, migrate, worker                     |
| Tests                 | None                                 | Vitest infrastructure suite                            |
| CI                    | lint / typecheck / build             | + test job; Prisma validate                            |

**Constraint:** Follow planning documents. Do not invent schema or business services.

---

## 2. Required changes

1. Establish `server/**` infrastructure modules and `app/api/**` health/meta routes.
2. Add Prisma schema matching `DATABASE_DESIGN.md` (full schema, migrations, seed stub).
3. Add Redis + BullMQ infrastructure (no business jobs).
4. Centralize env/config, logging, errors, API responses, validation.
5. Security headers / CORS / request-id middleware (no auth).
6. Expand Docker Compose and worker process.
7. Document mocks in `MOCK_MIGRATION.md`; keep mocks for UI.
8. Add Vitest tests; update README + `docs/configuration.md` + architecture notes.
9. Keep `next.config.mjs` `ignoreBuildErrors` for now (roadmap flips at M2); ensure new code typechecks cleanly via `pnpm typecheck`.

---

## 3. Files to create

### Planning / docs

- `PHASE1_IMPLEMENTATION_PLAN.md` (this file)
- `MOCK_MIGRATION.md`
- `docs/infrastructure.md`
- `prisma/seed.ts`
- `prisma/migrations/**` (initial migration)

### Server infrastructure

- `server/config/env.ts` — Zod env schema + loaders
- `server/config/index.ts` — typed `config` export
- `server/constants/index.ts`
- `server/types/index.ts`
- `server/logger/index.ts` — pino logger + child loggers
- `server/errors/app-error.ts`
- `server/errors/error-handler.ts`
- `server/lib/api-response.ts`
- `server/lib/request-context.ts`
- `server/validation/index.ts`
- `server/db/prisma.ts`
- `server/db/health.ts`
- `server/cache/redis.ts`
- `server/cache/health.ts`
- `server/queue/connection.ts`
- `server/queue/queues.ts`
- `server/queue/workers.ts`
- `server/queue/jobs/infrastructure-heartbeat.ts` — example infra job only
- `server/queue/health.ts`
- `server/security/headers.ts`
- `server/security/cors.ts`
- `server/security/rate-limit.ts` — infrastructure (in-memory / Redis-ready)
- `server/middleware/with-api.ts` — compose request-id, logging, error handling
- `server/services/health-service.ts` — aggregate health checks only
- `server/utils/id.ts`
- `server/utils/shutdown.ts`

### API routes

- `app/api/health/route.ts` — liveness-oriented aggregate
- `app/api/ready/route.ts` — readiness (DB + Redis + queue)
- `app/api/live/route.ts` — process alive
- `app/api/v1/meta/route.ts` — version / feature flags scaffold

### API client scaffold

- `lib/api/client.ts` — typed fetch helper (no business endpoints yet)
- `lib/api/types.ts` — shared response types for future UI migration

### Prisma

- `prisma/schema.prisma`

### Worker / scripts

- `scripts/worker.mjs` or `scripts/worker.ts` — BullMQ worker entrypoint

### Tests

- `vitest.config.ts`
- `tests/setup.ts`
- `tests/unit/config.test.ts`
- `tests/unit/api-response.test.ts`
- `tests/unit/errors.test.ts`
- `tests/unit/validation.test.ts`
- `tests/unit/health-payload.test.ts`
- `tests/integration/health.route.test.ts` (skips if infra unavailable)

---

## 4. Files to modify

| File                       | Change                                                                        |
| -------------------------- | ----------------------------------------------------------------------------- |
| `package.json`             | Deps (prisma, @prisma/client, ioredis, bullmq, pino, zod, vitest, …); scripts |
| `.env.example`             | Full Phase 1 + future optional vars documented                                |
| `docker-compose.yml`       | postgres, redis, migrate, worker, app healthchecks                            |
| `Dockerfile`               | Multi-target or worker-friendly; health → `/api/live`                         |
| `.dockerignore`            | Ensure prisma included; exclude tests noise as needed                         |
| `docs/configuration.md`    | Full env contract                                                             |
| `docs/architecture.md`     | Point at `server/` + Phase 1 reality                                          |
| `docs/docker.md`           | Compose services                                                              |
| `README.md`                | Infrastructure quick start                                                    |
| `.github/workflows/ci.yml` | Add test job                                                                  |
| `.gitignore`               | Prisma generate artifacts if needed                                           |
| `tsconfig.json`            | Include vitest types if needed                                                |

**Explicitly not modified:** UI components, marketing, mock-data consumers, design tokens.

---

## 5. Risks

| Risk                                            | Mitigation                                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Full Prisma schema is large; migration errors   | Follow `DATABASE_DESIGN.md` literally; validate with `prisma validate`               |
| Next.js build imports server modules without DB | Lazy clients; `SKIP_ENV_VALIDATION` / build-phase detection                          |
| UI contributors without Docker                  | Document optional infra; health returns degraded; mocks remain                       |
| BullMQ requires Redis                           | Worker fails fast with clear logs if Redis down                                      |
| BigInt JSON serialization                       | Custom serializers in API responses where needed later; Phase 1 health avoids BigInt |
| Lockfile / pnpm install failures                | Pin versions compatible with Node 20                                                 |
| CI without Postgres/Redis services              | Unit tests default; integration tests skip unless `RUN_INTEGRATION=1`                |

---

## 6. Dependencies (npm)

**Runtime:** `@prisma/client`, `zod`, `pino`, `pino-pretty` (dev-friendly), `ioredis`, `bullmq`, `uuid` (or crypto randomUUID)

**Dev:** `prisma`, `vitest`, `@vitest/coverage-v8` (optional), `tsx` (worker/ts scripts)

---

## 7. Migration strategy

1. Land infrastructure behind new folders/routes — zero UI breakage.
2. Apply Prisma migrations in Docker `migrate` service / `pnpm db:migrate`.
3. Keep `lib/mock-data.ts` as UI source until Phase 4 (`MOCK_MIGRATION.md`).
4. Feature flag / meta endpoint can advertise `infrastructure: true`, `auth: false`, etc.

---

## 8. Rollback strategy

1. Revert the Phase 1 PR / commit set.
2. Remove Compose services if needed; app image still serves UI.
3. Drop database volume only if explicitly required (`docker compose down -v`).
4. No data migration from mocks — nothing production to roll back in Phase 1.

---

## 9. Implementation order

1. Write this plan + `MOCK_MIGRATION.md` skeleton
2. Config + constants + logger + errors + API response + validation
3. Prisma schema + client + seed stub
4. Redis + BullMQ + example job + worker script
5. Security helpers + `withApi` middleware
6. Health service + API routes + meta
7. Docker Compose / Dockerfile updates
8. Lib API scaffold
9. Docs + README + env example
10. Tests
11. `pnpm typecheck` / `lint` / `test` / `build`
12. Final validation checklist

---

## Definition of Done (Phase 1)

- [x] `PHASE1_IMPLEMENTATION_PLAN.md` and `MOCK_MIGRATION.md` exist
- [x] Typed config with startup validation and `.env.example` complete
- [x] Structured logging with request/correlation IDs
- [x] Global error types + safe formatter
- [x] Standard API success/error/pagination helpers
- [x] Zod validation utilities
- [x] Prisma schema matches `DATABASE_DESIGN.md`; migrate SQL generated
- [x] Redis singleton + health
- [x] BullMQ queues/workers + infrastructure heartbeat job
- [x] `/api/health`, `/api/ready`, `/api/live`, `/api/v1/meta`
- [x] Security headers / CORS / rate-limit infrastructure (no auth)
- [x] Docker: postgres, redis, migrate, web, worker (Compose files)
- [x] Infrastructure tests pass
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build` succeed
- [x] README + configuration + infrastructure docs updated
- [x] UI unchanged; mocks documented
- [x] **Stop — do not start Phase 2**

> Local verification with a running Docker daemon (`docker compose up --build` + `/api/ready`) remains for the operator environment where Docker Desktop is available.

---

## 11. Out of scope (hard stop)

GitHub OAuth, Auth.js, GitHub App, webhooks business handling, repository sync, AI providers, automation engine, marketplace business logic, replacing mock UI data, design system changes, flipping `ignoreBuildErrors` (deferred to M2 per roadmap unless trivial).
