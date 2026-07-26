# Architecture

MaintainerAI is a Next.js application focused on maintainer workflows for GitHub
repositories. Phase 1 adds a production infrastructure layer beneath the existing UI.

## High-level diagram

```text
┌──────────────────────────────────────────────────────────────┐
│                         Clients                              │
│              Browser · future CLI / SDK / Extension          │
└─────────────────────────────┬────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                    MaintainerAI Web App                      │
│                 Next.js App Router (React 19)                │
│  ┌────────────┬─────────────┬──────────────┬──────────────┐  │
│  │ Dashboard  │ Issues/PRs  │ Automation   │ Settings     │  │
│  └────────────┴─────────────┴──────────────┴──────────────┘  │
│  API: /api/live · /api/health · /api/ready · /api/v1/meta    │
│  Shared: layout, copilot panel, command palette, UI kit      │
└───────────────┬──────────────────┬───────────────────────────┘
                │                  │
                ▼                  ▼
        server/* (infra)     Worker (BullMQ)
        config·logger·db     infrastructure.heartbeat
        cache·queue·security
                │                  │
                ▼                  ▼
           PostgreSQL            Redis
```

## Source map

| Area           | Location            | Responsibility                               |
| -------------- | ------------------- | -------------------------------------------- |
| Routes         | `app/`              | Pages and layouts                            |
| API            | `app/api/`          | Health and meta (Phase 1)                    |
| Feature UI     | `components/*`      | Domain screens and widgets                   |
| Infrastructure | `server/*`          | Config, logging, errors, DB, Redis, queues   |
| Prisma         | `prisma/`           | Schema + migrations                          |
| Hooks          | `hooks/`            | Client-side behavior                         |
| Domain helpers | `lib/`              | Types, utils, mock data, API client scaffold |
| Worker         | `scripts/worker.ts` | Background job consumer                      |

## Data today vs tomorrow

**Today (Phase 1):** product views still use typed mock data in `lib/mock-data.ts`.
Infrastructure (Postgres, Redis, queues, health APIs) is live. See `MOCK_MIGRATION.md`.

**Tomorrow:** GitHub App webhooks and APIs replace mocks with live repository state
while keeping the same UI surfaces (Phases 2–6).

## Design principles

- Preserve existing folder structure and UI contracts
- Prefer additive features over breaking refactors
- Keep secrets and provider credentials outside the repository
- Make self-hosting a first-class path
- Import `config` from `server/config` — never scatter `process.env` reads

## Related docs

- [Infrastructure](./infrastructure.md)
- [Configuration](./configuration.md)
- [Docker](./docker.md)
- [GitHub App](./github-app.md)
- [Roadmap](../ROADMAP.md)
- [SYSTEM_ARCHITECTURE.md](../SYSTEM_ARCHITECTURE.md)
- [PRODUCT_SPEC.md](../PRODUCT_SPEC.md)
