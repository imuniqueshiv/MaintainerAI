# Sync Engine

**Phase:** 4 — Repository Synchronization  
**Target tag:** `v0.4.0-repository-sync`  
**Code root:** `server/sync/`

## Purpose

GitHub is the source of truth. MaintainerAI stores an idempotent, resumable local cache of repository data for the dashboard and future AI/automation phases.

The sync engine **acquires data only**. It does not score health, run AI, or execute automations.

## Triggers

| Trigger | Entry point | Mode |
| ------- | ----------- | ---- |
| Manual | `POST /api/v1/repos/:repoId/sync` | `full` or `incremental` |
| Webhook | `server/services/webhook-service` → `enqueueEntitySync` | `delta` / incremental |
| Scheduled | Repeatable BullMQ (when configured) | incremental |
| Cancel | `POST /api/v1/repos/:repoId/sync/cancel` | cooperative cancel |

API and webhook handlers never call Octokit for bulk sync. They create `SyncJob` rows and enqueue BullMQ jobs.

## Entities

| Entity | Queue | Worker |
| ------ | ----- | ------ |
| repository | `sync.repositories` | metadata refresh + reconcile |
| labels | `sync.labels` | Label upsert |
| milestones | `sync.milestones` | Milestone upsert |
| issues | `sync.issues` | Issue + labels/assignees |
| pull_requests | `sync.pullrequests` | PR fields + counts |
| contributors | `sync.contributors` | Contributor + RepoContributor |
| releases | `sync.releases` | Release upsert |
| branches | `sync.branches` | Branch upsert |
| statistics | `sync.statistics` | open issue/PR counts on Repository |

Dead-letter queue: `sync.deadletter` (permanent failures after max attempts).

## Checkpoints

`SyncCheckpoint` stores per-`(repositoryId, entity)`:

- `page` / `cursor` — pagination resume
- `since` — incremental watermark
- `completed` — entity finished for current run
- `lastSuccessAt` — observability

Full sync resets page/cursor. Incremental reuses `since`. Crashes leave checkpoints intact so the next job resumes.

## Idempotency

- Issues / PRs upsert by `githubId` (and unique `(repositoryId, number)`).
- Labels upsert by `(repositoryId, name)` with optional `githubId` backfill.
- Contributors upsert by `githubId`.
- Sync job BullMQ `jobId` includes ledger `syncJobId` to avoid duplicate enqueue storms.

## Retry & DLQ

- BullMQ: 5 attempts, exponential backoff (3s base).
- Permanent failure → `SyncJob` marked failed + payload copied to `sync.deadletter`.
- Checkpoints retained so a later manual sync can resume.

## Security

- Sync start/cancel and resource reads require session + `requireRepoAccess` (`repos:manage` / `repos:read`).
- Webhooks verified with `X-Hub-Signature-256` before enqueue.
- Installation tokens from Redis cache; never stored in Postgres.

## Read APIs

- Per-repo: `/api/v1/repos/:repoId/{issues,pulls,contributors,labels,milestones,releases,branches}`
- Sync control: `/api/v1/repos/:repoId/sync`, `/sync/cancel`, `/sync/history`, `/sync/checkpoints`
- Aggregate: `/api/v1/issues`, `/api/v1/pulls`, `/api/v1/contributors`, `/api/v1/activity`
- Stats: `/api/v1/sync/statistics`

## Known limitations

- PR `additions` / `deletions` / `commits` may be `0` when GitHub list endpoints omit them (no per-PR detail fan-out — rate-limit budget).
- Health scoring and automation remain out of scope (Phase 5+).
- Scheduled org-wide sync may require Redis + worker process running.

See also: `SYNC_ARCHITECTURE.md`, `PHASE4_IMPLEMENTATION_PLAN.md`.
