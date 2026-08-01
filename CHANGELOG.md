# Changelog

All notable changes to MaintainerAI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Phase 4 Repository Sync:** `server/sync` engine, isolated `sync.*` BullMQ workers + DLQ, SyncJob/SyncCheckpoint ledger, Milestone/Release/Branch models, webhook-driven entity enqueue, sync control + resource APIs, dashboard Issues/PRs/Contributors/Activity/Repos sync status on synchronized data
- Docs: `SYNC_ENGINE.md`, `SYNC_ARCHITECTURE.md`, `PHASE4_IMPLEMENTATION_PLAN.md`, `PHASE4_COMPLETION_SUMMARY.md`, `PHASE4_REVIEW.md`, `PHASE4_RELEASE_AUDIT.md`
- Prisma migration `20260801200000_phase4_repository_sync`
- Docker worker reliability: hoist Prisma client for pnpm, copy `auth.ts`, replace ESM-only `@octokit/app` with `@octokit/auth-app` + REST for App JWT calls

### Added (Phase 3)

- **Phase 3 GitHub App:** `server/github` Octokit layer, install URL/callback, installation + repository metadata APIs, webhook platform (`installation` / `installation_repositories` / `repository`), BullMQ `github.webhooks` worker, live dashboard/repos/github-app UI data
- Release hardening: mandatory install CSRF state, installation access verification, org hijack prevention, webhook idempotency/claim, Compose worker App env, webhook rate-limit skip, select-repos replace disconnect
- `GITHUB_APP_SETUP.md`, `WEBHOOKS.md`, `PHASE3_IMPLEMENTATION_PLAN.md`, `PHASE3_RELEASE_AUDIT.md`
- Prisma migration `20260801120000_phase3_github_app` (Installation + Repository additive fields)
- RBAC permissions: `github:read`, `github:manage`, `repos:read`, `repos:manage`

### Added (Phase 2)

- **Phase 2 Authentication:** Auth.js (GitHub OAuth), database sessions, users/orgs/members/invitations APIs, RBAC
- `AUTHENTICATION_FLOW.md` and `RBAC_DOCUMENTATION.md`
- Prisma migration `20260801000000_phase2_auth` (user prefs + `Invitation`)

### Added (earlier)

- Open-source foundation: license, governance, security policy, and contribution guides
- GitHub issue forms, pull request template, and discussion templates
- CI workflows for lint, typecheck, build, CodeQL, Dependabot, and release scaffolding
- Docker, Docker Compose, and Dev Container support
- Project documentation under `/docs`
- Phase 1 engineering foundation (Prisma, Redis, BullMQ, health probes)

## [0.1.0] - 2026-07-10

### Added

- Initial MaintainerAI dashboard UI for repository management
- Repository health scoring and automation indicators
- Issue and pull request review surfaces
- AI copilot panel and command palette
- Onboarding flow for GitHub connection and repository selection
- Automation builder, insights, contributors, and marketplace pages
- Theme support (light / dark / system)

[Unreleased]: https://github.com/imuniqueshiv/MaintainerAI/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/imuniqueshiv/MaintainerAI/releases/tag/v0.1.0
