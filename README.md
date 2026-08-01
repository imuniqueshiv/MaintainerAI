<p align="center">
  <img src="public/icon.svg" alt="MaintainerAI logo" width="120" height="120" />
</p>

<h1 align="center">MaintainerAI</h1>

<p align="center">
  <strong>AI-powered GitHub repository management and automation for open-source maintainers.</strong>
</p>

<p align="center">
  Triage issues, review pull requests, measure repository health, and automate maintainer workflows—from a single command center.
</p>

<p align="center">
  <a href="https://github.com/imuniqueshiv/MaintainerAI/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <a href="https://github.com/imuniqueshiv/MaintainerAI/releases"><img src="https://img.shields.io/github/v/release/imuniqueshiv/MaintainerAI?include_prereleases&sort=semver" alt="Release" /></a>
  <a href="https://github.com/imuniqueshiv/MaintainerAI/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/imuniqueshiv/MaintainerAI/ci.yml?branch=main&label=CI" alt="CI" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" /></a>
  <a href="https://github.com/imuniqueshiv/MaintainerAI/issues"><img src="https://img.shields.io/github/issues/imuniqueshiv/MaintainerAI" alt="Issues" /></a>
  <a href="https://github.com/imuniqueshiv/MaintainerAI/stargazers"><img src="https://img.shields.io/github/stars/imuniqueshiv/MaintainerAI?style=social" alt="Stars" /></a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#features">Features</a> ·
  <a href="/docs">Docs</a> ·
  <a href="#contributing">Contributing</a> ·
  <a href="./ROADMAP.md">Roadmap</a>
</p>

---

<!-- Banner: replace with a full-width product screenshot when available -->
<p align="center">
  <img src="public/placeholder.svg" alt="MaintainerAI banner — dashboard overview" width="100%" />
</p>

## Why MaintainerAI?

Open-source maintainership does not scale with stars alone. Issues pile up, pull requests stall, and contributor experience suffers when maintainers lack tooling built for their workflow.

MaintainerAI gives maintainers an **AI-native control plane** for GitHub repositories:

- See repository health at a glance
- Triage issues and PRs with context
- Automate repetitive maintainer tasks
- Guide contributors with clearer workflows
- Self-host or extend the platform as it grows

Built for individuals, community teams, and organizations that care about sustainable open source.

## Features

- **Repository command center** — Track health scores, automation status, and activity across repos
- **Issue & PR workflows** — Structured views for triage, review, and prioritization
- **AI copilot** — In-app assistance for maintainer tasks and generation flows
- **Automation builder** — Design rules that reduce repetitive work
- **Contributor insights** — Understand who is contributing and where help is needed
- **Onboarding** — Connect GitHub, select repositories, and enable automation step by step
- **Marketplace foundation** — Extensible surface for future plugins and integrations
- **Dark / light themes** — Comfortable for long maintainer sessions

## Screenshots

| Dashboard                            | Issues                            | Pull Requests                            |
| ------------------------------------ | --------------------------------- | ---------------------------------------- |
| ![Dashboard](public/placeholder.svg) | ![Issues](public/placeholder.svg) | ![Pull Requests](public/placeholder.svg) |

| Automation                            | Insights                            | Settings                            |
| ------------------------------------- | ----------------------------------- | ----------------------------------- |
| ![Automation](public/placeholder.svg) | ![Insights](public/placeholder.svg) | ![Settings](public/placeholder.svg) |

> Replace placeholders in `public/` and `docs/assets/` with real product captures as the UI stabilizes.

## Demo

- **Live demo**: Coming soon — watch [Discussions → Announcements](https://github.com/imuniqueshiv/MaintainerAI/discussions/categories/announcements)
- **Local demo**: Follow [Quick Start](#quick-start) and open `http://localhost:3000`

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                     MaintainerAI Web UI                     │
│              Next.js App Router · React · Tailwind          │
├───────────────┬─────────────────────┬───────────────────────┤
│  Dashboard    │  Issues / PRs       │  Automation / Copilot │
│  Repos        │  Contributors       │  Settings / Onboarding│
├───────────────┴─────────────────────┴───────────────────────┤
│                 Shared components · hooks · lib             │
├─────────────────────────────────────────────────────────────┤
│  Live: Auth · Orgs · GitHub App · Webhooks · Repo metadata  │
│  Future: Repo sync · AI Providers · Automation · API / SDK  │
└─────────────────────────────────────────────────────────────┘
```

See [docs/architecture.md](./docs/architecture.md) for a deeper walkthrough.

## Tech Stack

| Layer       | Technology                                                  |
| ----------- | ----------------------------------------------------------- |
| Framework   | [Next.js](https://nextjs.org/) 16 (App Router)              |
| Language    | [TypeScript](https://www.typescriptlang.org/)               |
| UI          | React 19, Tailwind CSS 4, Base UI / shadcn-style components |
| Icons       | Lucide React                                                |
| Theming     | `next-themes`                                               |
| Package mgr | [pnpm](https://pnpm.io/)                                    |
| CI          | GitHub Actions                                              |
| Containers  | Docker · Docker Compose · Dev Containers                    |

## Folder Structure

```text
MaintainerAI/
├── app/                 # Next.js App Router pages, layouts, API routes
│   └── api/             # Health, readiness, liveness, meta
├── components/          # UI and feature components
├── server/              # Backend infrastructure (config, db, cache, queue, …)
├── prisma/              # Schema + migrations (DATABASE_DESIGN.md)
├── scripts/             # Worker entrypoint and tooling
├── docs/                # Project documentation
├── hooks/               # React hooks
├── lib/                 # Shared utilities, types, API client scaffold
├── tests/               # Infrastructure unit tests (Vitest)
├── public/              # Static assets
├── .github/             # Issue templates, workflows, funding
├── Dockerfile           # web / worker / migrate targets
├── docker-compose.yml   # postgres + redis + migrate + web + worker
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (optional, required for Postgres/Redis/worker)

### UI only (mock data)

```bash
git clone https://github.com/imuniqueshiv/MaintainerAI.git
cd MaintainerAI
pnpm install
cp .env.example .env.local   # required — Next.js loads .env.local, never .env.example
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000). If port `3000` is busy, Next.js
picks the next free port (e.g. `3001`, `3002`) — check the terminal for the exact URL.

> `/api/ready` intentionally returns **HTTP 503** in this UI-only mode because
> Postgres/Redis are not running. That is expected. For a green `/api/ready`, use
> **Full infrastructure** below. Skipping `cp .env.example .env.local` yields
> `DATABASE_URL not configured` — the env file is mandatory.

### Full infrastructure + auth (Phase 1–2)

```bash
cp .env.example .env.local   # or .env — either is loaded; .env.example is NOT
# Set NEXTAUTH_SECRET, GITHUB_OAUTH_CLIENT_ID, GITHUB_OAUTH_CLIENT_SECRET
docker compose up -d postgres redis
pnpm install
pnpm db:generate
pnpm db:migrate:deploy
pnpm dev          # terminal 1 — web UI + API
pnpm worker       # terminal 2 — BullMQ worker
```

Verify the stack is ready (expect `HTTP 200` with `"ready":true`):

```bash
curl -i http://localhost:3000/api/ready
pnpm infra:check   # direct DB + Redis + queue probe from the host
curl -i http://localhost:3000/api/v1/auth/session
```

Host ports for local tooling: Postgres `5433`, Redis `6380` (see `.env.example`).

Probes: `/api/live` · `/api/health` · `/api/ready` · `/api/v1/meta`  
Auth: `/api/auth/*` · `/api/v1/auth/session` · `/api/v1/users/me` · `/api/v1/orgs`

Docs: [AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md) · [RBAC_DOCUMENTATION.md](./RBAC_DOCUMENTATION.md)

Full guide: [docs/installation.md](./docs/installation.md) · [docs/infrastructure.md](./docs/infrastructure.md) · [docs/development.md](./docs/development.md)

## Docker Setup

```bash
# Required for the production web service image:
export NEXTAUTH_SECRET="$(openssl rand -base64 32)"
# Optional for live OAuth inside Compose:
# export GITHUB_OAUTH_CLIENT_ID=...
# export GITHUB_OAUTH_CLIENT_SECRET=...

docker compose up --build
```

Starts PostgreSQL, Redis, migrations, the web app, and the worker on port `3000`.
`NEXTAUTH_SECRET` is **required** (Compose fails fast if unset).

Details: [docs/docker.md](./docs/docker.md)

## Self Hosting

MaintainerAI is designed to run on your own infrastructure:

1. `docker compose up --build` (recommended) or `pnpm build && pnpm start` + `pnpm worker`
2. Configure environment variables (see below)
3. Place TLS termination at your reverse proxy
4. Restrict network access and rotate secrets regularly

Guide: [docs/deployment.md](./docs/deployment.md)

## Environment Variables

Copy `.env.example` to `.env.local` (or `.env` for Compose) and adjust values.
Configuration is validated by `server/config` — do not read `process.env` in app code.

| Variable                | Description                            | Required                  |
| ----------------------- | -------------------------------------- | ------------------------- |
| `NEXT_PUBLIC_APP_URL`   | Public app URL                         | Yes                       |
| `DATABASE_URL`          | PostgreSQL connection string           | For `/api/ready` + worker |
| `REDIS_URL`             | Redis connection string                | For `/api/ready` + worker |
| `NEXTAUTH_URL`          | Auth.js canonical URL                  | For OAuth callbacks       |
| `NEXTAUTH_SECRET`       | Auth.js session secret (≥16 chars)     | For sign-in               |
| `GITHUB_OAUTH_CLIENT_ID` / `_SECRET` | GitHub OAuth App credentials | For sign-in        |
| `GITHUB_APP_ID` | GitHub App ID | Phase 3 install/API |
| `GITHUB_APP_CLIENT_ID` / `_SECRET` | GitHub App OAuth (optional) | Phase 3 |
| `GITHUB_APP_PRIVATE_KEY` | App PEM private key | Phase 3 |
| `GITHUB_WEBHOOK_SECRET` | Webhook HMAC secret | Phase 3 |
| `GITHUB_APP_SLUG` | App slug for install URL | Phase 3 (default `maintainerai`) |
| `QUEUE_PREFIX`          | BullMQ prefix (default `maintainerai`) | No                        |
| `LOG_LEVEL`             | Pino log level                         | No                        |
| `AI_*`                  | AI providers                           | Phase 5+                  |

See [docs/configuration.md](./docs/configuration.md).

## GitHub App Setup

Step-by-step: **[GITHUB_APP_SETUP.md](./GITHUB_APP_SETUP.md)** · Webhooks: **[WEBHOOKS.md](./WEBHOOKS.md)**

1. Create a GitHub App (metadata + installation events)
2. Set callback `{APP_URL}/api/v1/auth/github/callback` and webhook `{APP_URL}/api/webhooks/github`
3. Add `GITHUB_APP_*` credentials to `.env.local` (placeholders only in git)
4. Sign in, open `/install`, approve on GitHub
5. Select/connect repositories; dashboard reads live metadata via `/api/v1/repos`

## AI Providers

MaintainerAI is provider-agnostic. Configure `AI_PROVIDER` and `AI_API_KEY` for your preferred vendor. Keep keys out of git; use secret managers in production.

## Scripts

| Script                   | Description                          |
| ------------------------ | ------------------------------------ |
| `pnpm dev`               | Start development server             |
| `pnpm build`             | `prisma generate` + production build |
| `pnpm start`             | Start production server              |
| `pnpm worker`            | Start BullMQ worker                  |
| `pnpm test`              | Run infrastructure unit tests        |
| `pnpm lint`              | Run ESLint                           |
| `pnpm typecheck`         | Run TypeScript checks                |
| `pnpm db:generate`       | Generate Prisma client               |
| `pnpm db:migrate`        | Create/apply migrations (dev)        |
| `pnpm db:migrate:deploy` | Apply migrations (CI/prod)           |
| `pnpm format`            | Format with Prettier                 |
| `pnpm format:check`      | Check formatting                     |
| `pnpm prepare`           | Install Husky hooks                  |

## Contributing

We welcome contributions of all kinds—code, docs, design, and triage.

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)
2. Browse [`good first issue`](https://github.com/imuniqueshiv/MaintainerAI/labels/good%20first%20issue) and [`help wanted`](https://github.com/imuniqueshiv/MaintainerAI/labels/help%20wanted)
3. Open a discussion for larger ideas before large PRs

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for Current, Next, Future, and long-term vision—including GitHub App, CLI, SDK, Plugin Marketplace, VS Code Extension, and Self Hosting.

## FAQ

**Is MaintainerAI free?**  
Yes. It is open source under the MIT License. Self-host at no licensing cost.

**Does it work without a GitHub App?**  
The UI runs locally with sample data. Live repository sync requires GitHub App (or token) configuration.

**Can I use my own AI models?**  
Yes. Configure a compatible provider via environment variables.

**Where do I report security issues?**  
See [SECURITY.md](./SECURITY.md)—do not use public issues.

More answers: [docs/faq.md](./docs/faq.md)

## License

Distributed under the [MIT License](./LICENSE).  
Copyright © 2026 MaintainerAI Contributors.

## Contributors

Thanks to everyone who helps build MaintainerAI.

<a href="https://github.com/imuniqueshiv/MaintainerAI/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=imuniqueshiv/MaintainerAI" alt="Contributors" />
</a>

## Sponsors

Sponsorship keeps the project sustainable.

<!-- Update .github/FUNDING.yml with your real sponsor links -->

- GitHub Sponsors: configure in [`.github/FUNDING.yml`](./.github/FUNDING.yml)
- Open Collective / custom sponsors: add links here as they become available

## Acknowledgements

MaintainerAI is inspired by the craft and openness of projects such as Next.js, Payload CMS, Supabase, Appwrite, Plane, Hoppscotch, and Docmost—and by the maintainers who keep open source alive.
