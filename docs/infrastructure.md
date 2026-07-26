# Infrastructure

Phase 1 engineering foundation for MaintainerAI: configuration, logging, errors, validation, PostgreSQL (Prisma), Redis, BullMQ, health endpoints, and Docker Compose.

Business features (auth, GitHub App, sync, AI, automation) are **not** included here.

## Architecture (Phase 1)

```text
Browser / probes
    │
    ▼
Next.js App Router
  /api/live   /api/health   /api/ready   /api/v1/meta
    │
    ├─ server/config   (Zod env → typed config)
    ├─ server/logger   (Pino)
    ├─ server/errors   (AppError + formatter)
    ├─ server/db       (Prisma)
    ├─ server/cache    (Redis)
    └─ server/queue    (BullMQ producers)
              │
              ▼
         Worker process (scripts/worker.ts)
              │
              ▼
         infrastructure.heartbeat (example job only)
```

## Local development

### Option A — UI only (mocks)

```bash
pnpm install
pnpm dev
```

UI continues to use `lib/mock-data.ts`. `/api/live` works; `/api/ready` returns not-ready until Postgres/Redis are configured.

### Option B — Full infrastructure

```bash
cp .env.example .env
docker compose up -d postgres redis
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev          # terminal 1
pnpm worker       # terminal 2
```

> Host ports: Postgres `5433`, Redis `6380` (see `.env.example`). Inside Compose, services still use `postgres:5432` and `redis:6379`.

Or all-in-one:

```bash
docker compose up --build
```

## Health endpoints

| Endpoint           | Purpose                 | Success criteria                      |
| ------------------ | ----------------------- | ------------------------------------- |
| `GET /api/live`    | Liveness                | Process up → `200`                    |
| `GET /api/health`  | Dependency report       | `200` even if degraded; `503` if down |
| `GET /api/ready`   | Readiness               | `200` only if DB + Redis + queue OK   |
| `GET /api/v1/meta` | Version + feature flags | Always `200` when app is up           |

## Database

```bash
pnpm db:generate   # prisma generate
pnpm db:migrate    # prisma migrate dev (local)
pnpm db:migrate:deploy  # prisma migrate deploy (CI/prod)
pnpm db:studio     # optional GUI
pnpm db:seed       # no-op in Phase 1
```

Schema source of truth: `DATABASE_DESIGN.md` → `prisma/schema.prisma`.

## Redis & queues

- Redis URL: `REDIS_URL`
- Queue prefix: `QUEUE_PREFIX` (default `maintainerai`)
- Example job: `infrastructure.heartbeat` every 60s from the worker
- **No business jobs** in Phase 1

## Worker

```bash
pnpm worker
```

Requires `DATABASE_URL` and `REDIS_URL`. Graceful shutdown on `SIGINT`/`SIGTERM`.

## Testing

```bash
pnpm test
```

Unit tests cover config, errors, validation, API envelope, and health payload shaping. Integration against live Docker services is optional (`RUN_INTEGRATION=1` reserved for later).

## Troubleshooting

| Symptom                                 | Likely cause                       | Fix                                                                                           |
| --------------------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| `/api/ready` 503 + `DATABASE_URL not configured` / `databaseConfigured=false` | No `.env.local`/`.env` file — Next.js never loads `.env.example` | `cp .env.example .env.local`, then restart `pnpm dev` (env is read at startup, not hot-reloaded) |
| `/api/ready` 503 + `ECONNREFUSED` / `status: "error"` | Env set but Postgres/Redis not running | `docker compose up -d postgres redis`, then `pnpm infra:check` to confirm                     |
| App runs on `3001`/`3002`, not `3000`   | Port `3000` already in use         | Use the URL printed in the terminal, or free `3000` / set `PORT`                              |
| Worker exits immediately                | Missing infra env                  | Worker requires both URLs; set `INFRASTRUCTURE_STRICT` implicitly via `MAINTAINERAI_WORKER=1` |
| Rate limits look wrong behind a proxy   | `TRUST_PROXY` false                | Set `TRUST_PROXY=true` only behind a trusted reverse proxy                                    |
| Prisma validate fails locally           | `DATABASE_URL` unset               | Export a valid Postgres URL (see `.env.example`)                                              |
| `prettier --check` errors on Dockerfile | No parser                          | Dockerfiles are ignored via `.prettierignore`                                                 |

## Related docs

- [Configuration](./configuration.md)
- [Docker](./docker.md)
- [Architecture](./architecture.md)
- [MOCK_MIGRATION.md](../MOCK_MIGRATION.md)
- [PHASE1_IMPLEMENTATION_PLAN.md](../PHASE1_IMPLEMENTATION_PLAN.md)
