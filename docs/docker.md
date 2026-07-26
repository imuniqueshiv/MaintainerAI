# Docker

MaintainerAI ships with a multi-stage `Dockerfile` and `docker-compose.yml` for
production-like and development container workflows, including PostgreSQL, Redis,
migrations, and the BullMQ worker (Phase 1 infrastructure).

## Prerequisites

- Docker Engine 24+ or Docker Desktop
- Docker Compose v2

## Full stack (recommended)

```bash
cp .env.example .env
docker compose up --build
```

Services:

| Service        | Role                                |
| -------------- | ----------------------------------- |
| `postgres`     | PostgreSQL 16                       |
| `redis`        | Redis 7                             |
| `migrate`      | `prisma migrate deploy` (one-shot)  |
| `maintainerai` | Next.js web (standalone)            |
| `worker`       | BullMQ worker (`scripts/worker.ts`) |

The web app listens on [http://localhost:3000](http://localhost:3000).

Healthchecks:

- Container: `GET /api/live`
- Readiness (manual): `GET /api/ready`
- Aggregate: `GET /api/health`

## Infrastructure only (local Node + Docker deps)

```bash
docker compose up -d postgres redis
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev
pnpm worker
```

## Development Compose profile

```bash
docker compose --profile dev up postgres redis maintainerai-dev
```

## Build targets

| Stage     | Purpose                                       |
| --------- | --------------------------------------------- |
| `base`    | Node 20 Alpine + pnpm                         |
| `deps`    | Frozen lockfile install                       |
| `builder` | `prisma generate` + `next build` (standalone) |
| `migrate` | Migration runner image                        |
| `worker`  | Queue worker image                            |
| `runner`  | Minimal web runtime (`nextjs` user)           |

## Notes

- Do not bake secrets into images.
- UI pages still use mock data in Phase 1; infrastructure endpoints are live.
- See [infrastructure.md](./infrastructure.md) and [configuration.md](./configuration.md).
- See [deployment.md](./deployment.md) for reverse-proxy and TLS guidance.
