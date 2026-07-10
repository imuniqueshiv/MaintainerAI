# Configuration

MaintainerAI is configured primarily through environment variables.

## Loading order

1. Process environment (Docker / host)
2. `.env.local` (local development; gitignored)
3. Defaults in application code where applicable

Copy the example file:

```bash
cp .env.example .env.local
```

## Application

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public base URL of the app |
| `NEXT_TELEMETRY_DISABLED` | `1` | Disables Next.js telemetry when set |

## GitHub App

| Variable | Required | Description |
| -------- | -------- | ----------- |
| `GITHUB_APP_ID` | For live sync | Numeric GitHub App ID |
| `GITHUB_APP_CLIENT_ID` | For OAuth | App client ID |
| `GITHUB_APP_CLIENT_SECRET` | For OAuth | App client secret |
| `GITHUB_APP_PRIVATE_KEY` | For API auth | PEM private key (use `\n` for newlines in single-line env stores) |
| `GITHUB_APP_WEBHOOK_SECRET` | For webhooks | Shared webhook secret |
| `GITHUB_APP_SLUG` | Optional | App URL slug |

## AI providers

| Variable | Default | Description |
| -------- | ------- | ----------- |
| `AI_PROVIDER` | `openai` | `openai`, `anthropic`, `azure`, or `custom` |
| `AI_API_KEY` | — | Provider API key |
| `AI_MODEL` | `gpt-4o-mini` | Model identifier |
| `AI_BASE_URL` | — | Optional custom base URL |

Keep provider keys in a secret manager for production deployments.

## Optional integrations

| Variable | Description |
| -------- | ----------- |
| `DATABASE_URL` | Future persistence layer |
| `REDIS_URL` | Future queue / cache |
| `SENTRY_DSN` | Error monitoring |

## Validation tips

- Restart the dev server after changing `.env.local`
- Redact secrets before sharing logs in issues
- Prefer separate credentials for development and production
