# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: (pending `v0.3.0-github-app` tag) |
| 0.2.x   | :white_check_mark: |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

See [SUPPORTED_VERSIONS.md](./SUPPORTED_VERSIONS.md) for the full support matrix.

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

Please report security issues privately using one of the following channels:

1. **GitHub Security Advisories** (preferred):  
   [Report a vulnerability](https://github.com/imuniqueshiv/MaintainerAI/security/advisories/new)
2. **Email**: security@maintainerai.dev

Include as much of the following as possible:

- Description of the vulnerability
- Steps to reproduce
- Affected versions / commit hashes
- Potential impact
- Suggested remediation (if known)
- Proof of concept (if safe to share privately)

## Response Policy

| Stage                    | Target timeline      |
| ------------------------ | -------------------- |
| Acknowledgement          | Within **72 hours**  |
| Initial assessment       | Within **7 days**    |
| Status update            | At least every **7 days** while open |
| Fix / mitigation release | Based on severity    |

### Severity handling

| Severity | Typical response                                      |
| -------- | ----------------------------------------------------- |
| Critical | Immediate triage; hotfix within days when feasible    |
| High     | Prioritized fix in the next patch release             |
| Medium   | Scheduled into an upcoming minor or patch release     |
| Low      | Tracked and addressed as capacity allows              |

## Disclosure Timeline

We follow coordinated disclosure:

1. Reporter privately discloses the issue.
2. Maintainers confirm and assess impact.
3. A fix is developed and tested.
4. A security advisory and patched release are prepared.
5. Public disclosure occurs after a fix is available, or by mutual agreement.

We ask reporters to allow a reasonable window (typically **90 days**) before
public disclosure, unless the issue is already being actively exploited.

## Security Best Practices

When deploying or contributing to MaintainerAI:

- Never commit secrets, tokens, or private keys
- Use environment variables and secret managers for credentials
- Rotate GitHub App private keys and OAuth secrets regularly
- Keep dependencies up to date via Dependabot PRs
- Prefer least-privilege scopes for GitHub Apps and tokens
- Enable branch protection and required status checks on default branches
- Review AI provider API key permissions and rate limits
- Run self-hosted instances behind TLS and authenticated reverse proxies

## Safe Harbor

We consider security research conducted in good faith under this policy to be
authorized. We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations and service disruption
- Do not exploit the vulnerability beyond what is needed to demonstrate it
- Report findings promptly through the channels above
