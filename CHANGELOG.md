# Changelog

All notable changes to MaintainerAI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
