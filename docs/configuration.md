# Configuration

MaintainerAI is configured primarily through environment variables loaded by
`server/config` (Zod-validated). Application code must import `config` /
`getConfig()` instead of reading `process.env` directly.

## Loading order

1. Process environment (Docker / host / CI)
2. `.env` / `.env.local` (local development; gitignored)
3. Schema defaults in `server/config/env.ts`

```bash
cp .env.example .env.local
```

For Docker Compose full stack, also copy to `.env` (Compose reads it for some workflows) or rely on `docker-compose.yml` service `environment` blocks.

## Application

| Variable                  | Default                 | Description                             |
| ------------------------- | ----------------------- | --------------------------------------- |
| `NODE_ENV`                | `development`           | `development` \| `test` \| `production` |
| `APP_ENV`                 | mirrors `NODE_ENV`      | Logical environment label               |
| `NEXT_PUBLIC_APP_URL`     | `http://localhost:3000` | Public base URL                         |
| `PORT`                    | `3000`                  | HTTP port                               |
| `HOSTNAME`                | `0.0.0.0`               | Bind host                               |
| `NEXT_TELEMETRY_DISABLED` | —                       | Disables Next.js telemetry when set     |
| `LOG_LEVEL`               | `info`                  | Pino level                              |
| `LOG_PRETTY`              | auto in dev             | Pretty logs when true                   |

## Infrastructure (Phase 1)

| Variable                | Required            | Description                               |
| ----------------------- | ------------------- | ----------------------------------------- |
| `DATABASE_URL`          | For ready/worker    | PostgreSQL connection string              |
| `REDIS_URL`             | For ready/worker    | Redis connection string                   |
| `QUEUE_PREFIX`          | No (`maintainerai`) | BullMQ key prefix                         |
| `WORKER_CONCURRENCY`    | No (`5`)            | Worker concurrency                        |
| `INFRASTRUCTURE_STRICT` | No (`false`)        | Fail startup if DB/Redis missing          |
| `SKIP_ENV_VALIDATION`   | No                  | Soft-parse env (used during `next build`) |

## Security / HTTP

| Variable               | Default | Description                                               |
| ---------------------- | ------- | --------------------------------------------------------- |
| `CORS_ORIGIN`          | `*`     | `*` or comma-separated origins                            |
| `TRUST_PROXY`          | `false` | Trust `X-Forwarded-For` only behind a known reverse proxy |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limit window                                         |
| `RATE_LIMIT_MAX`       | `120`   | Max requests per window per key                           |

## Future milestones (optional, unused in Phase 1)

Documented in `.env.example`:

- Auth / OAuth: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GITHUB_OAUTH_*`
- GitHub App: `GITHUB_APP_*`, `GITHUB_WEBHOOK_SECRET`
- AI: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`
- Storage: `STORAGE_*`
- Observability: `SENTRY_DSN`

## Validation tips

- Restart the process after changing env files
- Redact secrets before sharing logs
- Use separate credentials for development and production
- `/api/ready` is the authoritative check that infrastructure is wired
- See [Infrastructure](./infrastructure.md) for Compose and worker setup
