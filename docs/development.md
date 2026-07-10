# Development

Guide for contributors working on MaintainerAI.

## Setup

Follow [installation.md](./installation.md), then:

```bash
pnpm install
pnpm dev
```

## Project layout

| Path | Role |
| ---- | ---- |
| `app/` | Next.js App Router pages |
| `components/` | UI and feature components |
| `hooks/` | Client hooks |
| `lib/` | Shared utilities, types, mock data |
| `public/` | Static assets |
| `docs/` | Project documentation |

## Scripts

| Command | Purpose |
| ------- | ------- |
| `pnpm dev` | Dev server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript `--noEmit` |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check |

## Git hooks

Husky runs on commit:

- **pre-commit** — lint-staged (ESLint + Prettier on staged files)
- **commit-msg** — Commitlint (Conventional Commits)

## Branch and commit rules

See [CONTRIBUTING.md](../CONTRIBUTING.md).

## Dev Containers / Codespaces

Open the repo in VS Code Dev Containers or GitHub Codespaces. The
`.devcontainer/devcontainer.json` file installs pnpm dependencies and forwards
port `3000`.

## Coding guidelines

- Prefer small, focused changes
- Do not reformat unrelated files
- Match existing TypeScript and component patterns
- Use the `@/` import alias
- Avoid new dependencies unless discussed for larger changes

## Manual verification

Until automated UI tests expand:

1. Exercise affected routes in the browser
2. Check light and dark themes
3. Run `pnpm lint && pnpm typecheck && pnpm build`
