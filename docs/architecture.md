# Architecture

MaintainerAI is a Next.js application focused on maintainer workflows for GitHub
repositories. The current release prioritizes a polished UI foundation with
clear extension points for GitHub App integration, AI providers, and automation.

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
│  Shared: layout, copilot panel, command palette, UI kit      │
└─────────────────────────────┬────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
   GitHub App API      AI Providers         Future services
   (installations,     (OpenAI /            (DB, queues,
    webhooks, PRs)      Anthropic / ...)     plugins)
```

## Source map

| Area | Location | Responsibility |
| ---- | -------- | -------------- |
| Routes | `app/` | Pages and layouts |
| Feature UI | `components/*` | Domain screens and widgets |
| Primitives | `components/ui` | Buttons, cards, inputs, tabs |
| Layout shell | `components/layout` | Sidebar and navbar |
| Hooks | `hooks/` | Client-side behavior |
| Domain helpers | `lib/` | Types, utils, mock data |

## Data today vs tomorrow

**Today:** many views are driven by typed mock data in `lib/mock-data.ts` so the
UI can be developed and reviewed without live credentials.

**Tomorrow:** GitHub App webhooks and APIs will replace mocks with live
repository state, while keeping the same UI surfaces where possible.

## Design principles

- Preserve existing folder structure and UI contracts
- Prefer additive features over breaking refactors
- Keep secrets and provider credentials outside the repository
- Make self-hosting a first-class path

## Related docs

- [GitHub App](./github-app.md)
- [Configuration](./configuration.md)
- [Roadmap](../ROADMAP.md)
