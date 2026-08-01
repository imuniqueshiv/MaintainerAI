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

## Authentication (Phase 2)

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `NEXTAUTH_URL` | For OAuth callbacks | Canonical app URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` / `AUTH_SECRET` | For sign-in | Auth.js secret (≥16 chars); `openssl rand -base64 32` |
| `GITHUB_OAUTH_CLIENT_ID` | For sign-in | GitHub OAuth App client id |
| `GITHUB_OAUTH_CLIENT_SECRET` | For sign-in | GitHub OAuth App client secret |
| `AUTH_STRICT` | No (`false`) | Fail startup when OAuth secrets missing |
| `AUTH_SESSION_MAX_AGE_SECONDS` | No (`2592000`) | Session TTL (30 days) |
| `AUTH_SESSION_UPDATE_AGE_SECONDS` | No (`86400`) | Auth.js session update age |
| `AUTH_CSRF_PROTECT` | No (on in prod) | Extra CSRF checks for mutating APIs |

GitHub OAuth App **Authorization callback URL**:

```text
{NEXTAUTH_URL}/api/auth/callback/github
```

See [AUTHENTICATION_FLOW.md](../AUTHENTICATION_FLOW.md) and [RBAC_DOCUMENTATION.md](../RBAC_DOCUMENTATION.md).

## GitHub App (Phase 3)

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `GITHUB_APP_ID` | For App features | Numeric App ID |
| `GITHUB_APP_CLIENT_ID` | Recommended | App client id |
| `GITHUB_APP_CLIENT_SECRET` | Recommended | App client secret |
| `GITHUB_APP_PRIVATE_KEY` | For App features | PEM private key (`\n` escaped OK) |
| `GITHUB_WEBHOOK_SECRET` | For App features | Webhook HMAC secret |
| `GITHUB_APP_SLUG` | No (`maintainerai`) | Public app slug for install URLs |
| `GITHUB_APP_STRICT` | No (`false`) | Fail startup when App env missing |
| `GITHUB_WEBHOOK_INLINE` | No (`false`) | Dispatch webhooks in-process (skip BullMQ) |

GitHub App URLs:

```text
Callback: {NEXT_PUBLIC_APP_URL}/api/v1/auth/github/callback
Webhook:  {NEXT_PUBLIC_APP_URL}/api/webhooks/github
```

See [GITHUB_APP_SETUP.md](../GITHUB_APP_SETUP.md) and [WEBHOOKS.md](../WEBHOOKS.md).

## Future milestones (optional, unused in Phase 3)

Documented in `.env.example`:

- AI: `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `AI_BASE_URL`
- Storage: `STORAGE_*`
- Observability: `SENTRY_DSN`

## Validation tips

- Restart the process after changing env files
- Redact secrets before sharing logs
- Use separate credentials for development and production
- `/api/ready` is the authoritative check that infrastructure is wired
- `/api/v1/auth/session` reports whether the caller is authenticated and whether OAuth is configured
- See [Infrastructure](./infrastructure.md) for Compose and worker setup
