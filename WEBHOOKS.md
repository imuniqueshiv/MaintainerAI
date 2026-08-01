# Webhooks — MaintainerAI Phase 3

## Endpoint

```http
POST /api/webhooks/github
```

Public endpoint (no Auth.js session). Protected by HMAC signature verification.

### Required headers

| Header | Purpose |
| ------ | ------- |
| `X-Hub-Signature-256` | `sha256=<hex>` HMAC of raw body using `GITHUB_WEBHOOK_SECRET` |
| `X-GitHub-Delivery` | Unique delivery id (idempotency key) |
| `X-GitHub-Event` | Event name |

### Response

| Status | Meaning |
| ------ | ------- |
| `202` | Accepted and queued (or processed inline if Redis unavailable) |
| `200` | Duplicate delivery (already recorded) |
| `401` | Invalid signature |
| `400` | Missing headers / bad payload |
| `503` | GitHub App not configured |

## Security

1. **Signature verification** — timing-safe compare of SHA-256 HMAC (`server/github/webhooks.ts`).
2. **Replay / idempotency** — unique `WebhookEvent.deliveryId`; duplicates short-circuit.
3. **Rate limiting** — webhook route uses `skipRateLimit: true` so GitHub delivery bursts are not 429'd by the API limiter. Other `/api/v1` routes remain rate-limited.
4. **No secrets in logs** — payloads may be stored encrypted-at-rest by your DB policies; tokens are never logged.

## Processing pipeline

```text
POST /api/webhooks/github
  → verify signature
  → insert WebhookEvent (status=received)
  → enqueue BullMQ job on queue `github.webhooks`
  → worker dispatches by event name
```

If Redis is not configured, **or** `GITHUB_WEBHOOK_INLINE=true`, dispatch runs **inline** after insert (suitable for small/dev installs). Production Compose runs a dedicated `worker` with the same `GITHUB_APP_*` credentials.

Worker entrypoint: `pnpm worker` (`scripts/worker.ts` starts `startGitHubWebhookWorker()`).

## Handled events (Phase 3)

| Event | Actions (examples) | Behavior |
| ----- | ------------------ | -------- |
| `installation` | created, deleted, suspend, unsuspend, new_permissions_accepted | Upsert/suspend/delete local `Installation` |
| `installation_repositories` | added, removed | Connect metadata / soft-delete repos |
| `repository` | edited, deleted, archived, … | Refresh metadata or soft-delete |

All other events are **persisted and marked processed**, then ignored (no business logic).

## Out of scope

Issue, pull request, push, and release processing belong to Phase 4+. Do not add handlers here without expanding the product milestone.

## Local testing

```bash
# With a known secret in .env.local
BODY='{"action":"created","installation":{"id":1}}'
SIG="sha256=$(printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$GITHUB_WEBHOOK_SECRET" | awk '{print $2}')"

curl -sS -X POST "$NEXT_PUBLIC_APP_URL/api/webhooks/github" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: installation" \
  -H "X-GitHub-Delivery: test-$(date +%s)" \
  -H "X-Hub-Signature-256: $SIG" \
  -d "$BODY"
```

## Operations

- Inspect deliveries in GitHub App → **Advanced** → Recent Deliveries.
- Inspect rows: `WebhookEvent` (`deliveryId`, `event`, `status`, `processedAt`).
- Failed jobs retry via BullMQ (`attempts: 3`, exponential backoff).
- Redeliver from GitHub UI if needed; idempotency prevents double-apply when `deliveryId` matches.

See `GITHUB_APP_SETUP.md` for App configuration.
