# Governance

MaintainerAI is an open-source project maintained by volunteers and community
contributors. This document describes how decisions are made and who is
responsible for what.

## Principles

- **Transparency** — Decisions and rationale are documented in issues, PRs, and discussions.
- **Meritocracy** — Sustained, high-quality contributions lead to greater responsibility.
- **Safety first** — Security and user trust take priority over feature velocity.
- **Compatibility** — We avoid breaking changes without clear migration paths.

## Roles

### Contributors

Anyone who participates by opening issues, discussions, documentation, or code.
Contributors are expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md)
and [Contributing Guide](./CONTRIBUTING.md).

### Triagers

Trusted community members who help label issues, reproduce bugs, and guide
newcomers. Triagers do not merge pull requests by default.

### Maintainers

Maintainers have write access to the repository. They:

- Review and merge pull requests
- Triage issues and security reports
- Cut releases and maintain the changelog
- Uphold project standards and the Code of Conduct

### Lead Maintainers

Lead maintainers set technical direction, resolve escalations, and manage
repository administration (branch protection, secrets, access).

Current repository owner: [@imuniqueshiv](https://github.com/imuniqueshiv)

## Review Process

1. All changes land through pull requests.
2. At least one maintainer approval is required for merge (two for sensitive areas such as auth, security, or release automation).
3. CI must pass before merge.
4. Authors should respond to review feedback within a reasonable time or mark the PR as draft / closed.
5. Maintainers may request changes, approve, or close PRs that are out of scope.

## Decision Making

Day-to-day decisions are made by maintainers through PR review.

For larger changes (architecture, breaking APIs, governance updates):

1. Open a GitHub Discussion or RFC-style issue.
2. Allow at least **7 days** for community feedback when practical.
3. Maintainers reach consensus; if consensus fails, lead maintainers decide and document the outcome.

## Becoming a Maintainer

Maintainers are invited based on:

- Consistent, high-quality contributions
- Constructive code review and community participation
- Alignment with project values and security practices

Nominations may be made by existing maintainers. Access changes are recorded in
project discussions or private maintainer channels as appropriate.

## Conflict Resolution

1. Attempt to resolve directly and respectfully.
2. Escalate to maintainers via a private channel if needed.
3. Code of Conduct violations follow the enforcement process in
   [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

## Amendments

Changes to this governance document require a pull request and approval from
at least two maintainers (or the lead maintainer if only one is active).
