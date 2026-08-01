# GitHub App Setup

> Canonical guide: **[GITHUB_APP_SETUP.md](../GITHUB_APP_SETUP.md)**  
> Webhooks: **[WEBHOOKS.md](../WEBHOOKS.md)**

Connecting a GitHub App enables installation management and repository metadata
in Phase 3. Until the App is configured, authenticated APIs return
`configured: false` / `503` where appropriate; marketing pages may still show sample data.

## Quick facts (Phase 3)

| Item | Value |
| ---- | ----- |
| Callback | `{APP_URL}/api/v1/auth/github/callback` |
| Webhook | `{APP_URL}/api/webhooks/github` |
| Env prefix | `GITHUB_APP_*`, `GITHUB_WEBHOOK_SECRET` |
| Worker queue | `github.webhooks` (`pnpm worker`) |

Do not use the legacy placeholder path `/api/github/webhooks` or `GITHUB_APP_WEBHOOK_SECRET`.

Follow the root [GITHUB_APP_SETUP.md](../GITHUB_APP_SETUP.md) for create/install/troubleshoot steps.
