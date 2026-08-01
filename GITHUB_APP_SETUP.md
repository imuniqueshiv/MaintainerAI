# GitHub App Setup — MaintainerAI Phase 3

This guide configures a GitHub App for local development and production.  
**Never commit private keys or webhook secrets.** Use environment variables only.

## Prerequisites

- Phase 2 auth working (`NEXTAUTH_*`, `GITHUB_OAUTH_*`)
- PostgreSQL + Redis running (`pnpm infra:check`)
- App reachable at `NEXT_PUBLIC_APP_URL` (default `http://localhost:3000`)

## 1. Create the GitHub App

1. Open [GitHub → Settings → Developer settings → GitHub Apps](https://github.com/settings/apps) (or your org’s settings).
2. **New GitHub App**
3. Suggested values:

| Field | Value |
| ----- | ----- |
| GitHub App name | `MaintainerAI` (or unique local name) |
| Homepage URL | `http://localhost:3000` (prod: your public URL) |
| Callback URL | `{APP_URL}/api/v1/auth/github/callback` |
| Setup URL (optional) | `{APP_URL}/install` |
| Webhook URL | `{APP_URL}/api/webhooks/github` |
| Webhook secret | Generate with `openssl rand -hex 32` |

4. **Permissions (Phase 3 minimum)**

| Permission | Access |
| ---------- | ------ |
| Repository metadata | Read-only |
| Administration | Read-only (optional; helps installation account details) |

Subscribe to events:

- `Installation`
- `Installation repositories`
- `Repository`

Do **not** enable issue/PR content sync permissions for Phase 3 product features (you may still request them for future phases; handlers ignore those events).

5. Where can this GitHub App be installed? → **Any account** (or Only on this account for private testing).
6. Create the app. Note:
   - **App ID**
   - **Client ID** / **Client secret** (if shown)
   - **Slug** (from the public page URL `github.com/apps/<slug>`)
7. Generate a **private key** and download the `.pem` file. Store it securely outside the repo.

## 2. Environment variables

Copy `.env.example` → `.env.local` (and `.env` for Compose) and set:

```bash
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=
GITHUB_WEBHOOK_SECRET=
GITHUB_APP_SLUG=maintainerai
# GITHUB_APP_STRICT=false
```

### Private key formatting

Prefer a single-line value with escaped newlines:

```bash
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----\n"
```

The server normalizes `\n` sequences into real newlines. Never log this value.

## 3. Local development

```bash
cp .env.example .env.local
# fill OAuth + GitHub App placeholders
docker compose up -d postgres redis
pnpm db:migrate:deploy
pnpm dev
pnpm worker   # processes webhook jobs when Redis is up
```

For GitHub to reach local webhooks, use a tunnel (ngrok, Cloudflare Tunnel, etc.):

```text
Webhook URL: https://<tunnel>/api/webhooks/github
Callback URL: https://<tunnel>/api/v1/auth/github/callback
```

Update the GitHub App URLs to match the tunnel host while developing.

## 4. Installation flow

1. Sign in with GitHub OAuth (`/api/auth/signin/github`).
2. Open `/install` → **Install on GitHub**.
3. `GET /api/v1/auth/github/install-url` issues a CSRF `state` cookie and returns the GitHub install URL.
4. After approving on GitHub, browser hits `/api/v1/auth/github/callback?installation_id=…&state=…`.
5. MaintainerAI **requires** matching `state` cookie + query, verifies the user’s OAuth token can see the installation (`GET /user/installations`), upserts `Installation` without reassigning ownership, links/creates `Organization` by GitHub account id only, seeds repository metadata, then redirects to `/onboarding/select-repositories`.
6. Select-repos uses `replace: true` so deselected repositories are disconnected.

## 5. Production deployment

1. Create a production GitHub App (or reuse one) with HTTPS URLs.
2. Set secrets in your host/orchestrator (never bake PEM into images).
3. Run migrations: `pnpm db:migrate:deploy`
4. Run web + worker processes (`docker compose up --build` or equivalent).
5. Confirm:
   - `GET /api/v1/github/app` (authenticated) shows `configured: true`
   - Webhook deliveries appear in GitHub App → Advanced → Recent Deliveries
   - `WebhookEvent` rows appear in Postgres

## 6. Uninstall / reconnect

- **Local disconnect:** `DELETE /api/v1/github/installations/:id` (marks installation deleted, soft-deletes repos).
- **GitHub uninstall:** webhook `installation.deleted` marks the same.
- **Reconnect:** run install flow again (upsert by `githubInstallationId`).

## 7. Troubleshooting

| Symptom | Check |
| ------- | ----- |
| 503 on install-url | Missing `GITHUB_APP_ID` / private key / webhook secret |
| Invalid private key | PEM must contain `BEGIN`; escape `\n` correctly |
| Invalid webhook signature | `GITHUB_WEBHOOK_SECRET` must match the App settings |
| Callback 401 | User must be signed in before completing install |
| No repos | Installation may have zero repository access; adjust on GitHub |

See also: `WEBHOOKS.md`, `docs/configuration.md`, `PHASE3_IMPLEMENTATION_PLAN.md`.
