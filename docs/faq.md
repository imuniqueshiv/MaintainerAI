# FAQ

## General

### What is MaintainerAI?

MaintainerAI is an open-source, AI-assisted platform for GitHub repository
management—helping maintainers triage issues, review pull requests, measure
health, and automate repetitive work.

### Is it free?

Yes. MaintainerAI is released under the [MIT License](../LICENSE). You can
self-host without licensing fees.

### Is this production-ready?

The open-source foundation (docs, CI, Docker, governance) is production-oriented.
Application features are evolving; start with local/demo usage and follow the
[roadmap](../ROADMAP.md) for GitHub App and live-data milestones.

## Setup

### Do I need a GitHub App to try it?

No. You can run the UI locally with sample data. A GitHub App is required for
live repository sync and webhook-driven automation.

### Which Node.js version should I use?

Node.js 20+. The repository includes `.nvmrc` for convenience.

### Why pnpm instead of npm?

pnpm provides faster, disk-efficient installs and deterministic lockfiles that
match our CI setup.

## AI

### Which AI providers are supported?

Configuration supports OpenAI, Anthropic, Azure, and custom base URLs. See
[configuration.md](./configuration.md).

### Will my code be sent to an AI provider?

Only when AI features are enabled and invoked. Self-hosters control provider
choice and keys. Review your provider's data policies before enabling AI in
sensitive environments.

## Security & contributing

### How do I report a vulnerability?

Follow [SECURITY.md](../SECURITY.md). Do not open public issues for active
vulnerabilities.

### How do I contribute?

Read [CONTRIBUTING.md](../CONTRIBUTING.md), then browse `good first issue` and
`help wanted` labels.

### Where can I ask questions?

Use [GitHub Discussions](https://github.com/imuniqueshiv/MaintainerAI/discussions)
or the Question issue form for tracked questions.
