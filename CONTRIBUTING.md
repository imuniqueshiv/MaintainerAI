# Contributing to MaintainerAI

Thank you for contributing. This guide explains how to set up your environment,
submit changes, and collaborate with maintainers.

Please also read our [Code of Conduct](./CODE_OF_CONDUCT.md) and
[Governance](./GOVERNANCE.md).

## Table of Contents

- [Development Setup](#development-setup)
- [Branch Naming](#branch-naming)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Issue Claiming](#issue-claiming)
- [Testing](#testing)
- [Linting](#linting)
- [Review Expectations](#review-expectations)
- [Communication Guidelines](#communication-guidelines)

## Development Setup

### Prerequisites

- **Node.js** `20` or later (see `.nvmrc`)
- **pnpm** `9` or later (`corepack enable && corepack prepare pnpm@latest --activate`)
- **Git**
- A GitHub account

### Clone and install

```bash
git clone https://github.com/imuniqueshiv/MaintainerAI.git
cd MaintainerAI
pnpm install
cp .env.example .env.local
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Docker (optional)

```bash
docker compose up --build
```

### Dev Container / Codespaces

Open the repository in VS Code with the Dev Containers extension, or launch a
GitHub Codespace. The `.devcontainer` configuration installs dependencies and
forwards port `3000`.

## Branch Naming

Use descriptive prefixes:

| Prefix     | Use case                          |
| ---------- | --------------------------------- |
| `feat/`    | New features                      |
| `fix/`     | Bug fixes                         |
| `docs/`    | Documentation only                |
| `chore/`   | Tooling, deps, maintenance        |
| `refactor/`| Code restructuring without behavior change |
| `test/`    | Tests only                        |
| `ci/`      | Continuous integration            |

Examples: `feat/github-app-webhooks`, `fix/sidebar-overflow`, `docs/docker-guide`.

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(optional scope): <description>

[optional body]

[optional footer]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:

```text
feat(automation): add rule preview panel
fix(issues): correct priority badge colors
docs(readme): clarify GitHub App setup
```

Commit messages are validated with Commitlint via Husky on `commit-msg`.

## Pull Request Process

1. Fork the repository (or create a branch if you have write access).
2. Create a branch from `main` using the naming conventions above.
3. Make focused changes — prefer small, reviewable PRs.
4. Ensure lint, typecheck, and build succeed locally:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```
5. Open a pull request using the template.
6. Link related issues with `Fixes #123` or `Closes #123` when applicable.
7. Respond to review feedback promptly.
8. Do not force-push after review unless requested; prefer additive commits.

### PR checklist (summary)

- [ ] Title follows Conventional Commit style
- [ ] Description explains **why**, not only **what**
- [ ] Tests / manual verification noted
- [ ] Docs updated when behavior or configuration changes
- [ ] No secrets or credentials included

## Coding Standards

- Prefer clear, readable TypeScript over clever abstractions
- Match existing patterns in `app/`, `components/`, and `lib/`
- Use the `@/` path alias for imports
- Keep UI and business-logic changes minimal unless the issue requires them
- Do not reformat unrelated files
- Avoid introducing new dependencies without discussion on larger PRs

## Issue Claiming

1. Comment on the issue: `I'd like to work on this`.
2. Wait for a maintainer to assign you when possible.
3. If there is no activity for **7 days**, others may take over after commenting.
4. `good first issue` and `help wanted` labels are ideal starting points.

Do not claim more issues than you can actively progress.

## Testing

Automated test suites will expand over time. For now:

- Manually verify affected routes and components
- Confirm light and dark themes still render correctly
- Run `pnpm build` to catch type and compile errors
- Note reproduction and verification steps in the PR

When adding tests, place them near the code they cover and document how to run them.

## Linting

```bash
pnpm lint          # ESLint
pnpm format:check  # Prettier check
pnpm typecheck     # TypeScript
```

Staged files are linted via lint-staged on pre-commit. Fix issues before pushing.

## Review Expectations

**Authors**

- Keep PRs focused and well described
- Provide screenshots for UI-visible changes
- Call out breaking changes and migration steps

**Reviewers**

- Be respectful and specific
- Prefer questions and suggestions over demands
- Approve when the change is correct, safe, and maintainable—not when it matches personal style preferences alone

Typical first review target: within a few business days, depending on maintainer availability.

## Communication Guidelines

- Use [GitHub Discussions](https://github.com/imuniqueshiv/MaintainerAI/discussions) for ideas and questions
- Use issues for actionable bugs and features
- Keep conversation technical and inclusive
- Assume good intent; escalate CoC concerns privately per [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- Security reports must go through [SECURITY.md](./SECURITY.md)—never public issues

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](./LICENSE).
