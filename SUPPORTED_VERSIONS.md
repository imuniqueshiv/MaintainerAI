# Supported Versions

MaintainerAI follows [Semantic Versioning](https://semver.org/).

## Support Matrix

| Release series | Status       | Security fixes | Bug fixes | New features |
| -------------- | ------------ | -------------- | --------- | ------------ |
| `0.1.x`        | **Current**  | Yes            | Yes       | Yes          |
| Pre-`0.1`      | Unsupported  | No             | No        | No           |

## Definitions

- **Current** — Actively developed; receives features, bug fixes, and security patches.
- **Maintenance** — Receives critical bug fixes and security patches only.
- **Unsupported** — No further updates; upgrade to a supported series.

## Release Cadence

- **Patch** (`0.1.x`) — As needed for fixes and security updates
- **Minor** (`0.x.0`) — Feature releases with migration notes when required
- **Major** (`x.0.0`) — Reserved for breaking changes after `1.0.0`

While the project is in `0.x`, minor releases may include breaking changes.
Breaking changes will be called out in the [CHANGELOG](./CHANGELOG.md) and
release notes.

## Upgrade Guidance

1. Read the [CHANGELOG](./CHANGELOG.md) for the target version.
2. Review environment variable and configuration changes in `/docs`.
3. Test in a staging or local environment before production upgrades.
4. For Docker deployments, pin image tags to a specific version in production.

## Long-term Support

LTS policies will be announced before the `1.0.0` release. Until then, always
run the latest `0.1.x` patch when possible.
