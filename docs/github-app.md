# GitHub App Setup

Connecting a GitHub App enables live repository data, webhooks, and automation
actions. Until the App is configured, the UI can run with sample data for local
development.

## Create the GitHub App

1. Open GitHub → **Settings** → **Developer settings** → **GitHub Apps** → **New GitHub App**.
2. Set the app name (for example, `MaintainerAI`).
3. Set the **Homepage URL** to your deployment URL.
4. Set the **Webhook URL** to `https://<your-domain>/api/github/webhooks` (when available).
5. Set a strong **Webhook secret** and store it as `GITHUB_APP_WEBHOOK_SECRET`.

## Recommended permissions

Start with the minimum required and expand as features land:

| Permission        | Access   | Reason                          |
| ----------------- | -------- | ------------------------------- |
| Metadata          | Read     | Repository discovery            |
| Contents          | Read     | Repository context              |
| Issues            | Read & write | Triage and automation       |
| Pull requests     | Read & write | Review workflows            |
| Checks            | Read     | Status visibility               |
| Members (org)     | Read     | Org-level insights (optional)   |

Subscribe to webhook events you intend to handle (issues, pull requests, installation, etc.).

## Install the App

1. Generate a **private key** and store the PEM contents in `GITHUB_APP_PRIVATE_KEY`.
2. Copy the **App ID**, **Client ID**, and **Client secret** into your environment.
3. Install the App on a user account or organization.
4. Select the repositories MaintainerAI should manage.

## Environment mapping

```bash
GITHUB_APP_ID=
GITHUB_APP_CLIENT_ID=
GITHUB_APP_CLIENT_SECRET=
GITHUB_APP_PRIVATE_KEY=
GITHUB_APP_WEBHOOK_SECRET=
GITHUB_APP_SLUG=maintainerai
```

See [configuration.md](./configuration.md).

## Security tips

- Rotate private keys and client secrets periodically
- Prefer organization-owned Apps for team deployments
- Restrict repository selection to what you need
- Never commit PEM files or secrets to git

## Troubleshooting

| Symptom | Check |
| ------- | ----- |
| Install URL fails | App slug and public page URL |
| Webhooks not received | Public HTTPS endpoint, secret mismatch |
| 401 from GitHub API | App ID / private key mismatch or expired credentials |
| Missing repos | Installation repository selection |
