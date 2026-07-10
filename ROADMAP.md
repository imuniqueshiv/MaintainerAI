# Roadmap

This roadmap describes where MaintainerAI is headed. Priorities may shift based
on community feedback, security needs, and contributor capacity.

Track progress via [GitHub Issues](https://github.com/imuniqueshiv/MaintainerAI/issues)
and [Discussions](https://github.com/imuniqueshiv/MaintainerAI/discussions).

---

## Current (v0.1)

- AI-assisted maintainer dashboard UI
- Repository health overview and activity timelines
- Issue and pull request management surfaces
- Automation builder foundation
- Onboarding flow for GitHub-connected workflows
- Open-source project infrastructure (docs, CI, governance)

---

## Next

- Production GitHub App installation and webhook handling
- Real repository data sync (replace mock data paths)
- Secure environment-based configuration for AI providers
- Self-hosting hardening (Docker healthchecks, reverse-proxy guides)
- Expanded test coverage and CI quality gates
- Contributor onboarding improvements (`good first issue` labeling)

---

## Future

### GitHub App

- Full installation lifecycle (install, suspend, uninstall)
- Fine-grained permission model and org-level policies
- Webhook-driven automation triggers
- Comment and label actions with audit trails

### CLI

- `maintainerai` CLI for local and CI usage
- Auth via device flow / GitHub App tokens
- Commands for health checks, triage suggestions, and release notes

### SDK

- TypeScript SDK for embedding MaintainerAI capabilities
- Stable public API surface with versioned contracts
- Webhook event helpers and typed responses

### Plugin Marketplace

- Community plugins for triage, labeling, and release workflows
- Signed plugin manifests and sandboxing guidelines
- First-party plugins for common maintainer tasks

### VS Code Extension

- Inline PR and issue insights
- Copilot-style maintainer assistance in the editor
- One-click actions for common repository hygiene tasks

### Self Hosting

- One-command Docker Compose stacks
- Helm charts for Kubernetes
- Air-gapped / enterprise deployment guides
- Backup, restore, and upgrade runbooks

---

## Long-term Vision

MaintainerAI aims to be the open-source operating system for repository
maintainers: an AI-native control plane that reduces triage burden, improves
contributor experience, and keeps projects healthy at any scale—whether you run
a single library or hundreds of repositories across an organization.

We believe maintainership should be sustainable, transparent, and community-owned.
Everything we ship should make that easier.
