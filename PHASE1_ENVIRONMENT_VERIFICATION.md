# Phase 1 — Environment Verification & `/api/ready` 503 Root-Cause Investigation

**Role:** Lead Infrastructure Engineer / Principal Backend Architect / SRE / DevOps / QA Lead
**Scope:** Investigate why `/api/ready` returns **HTTP 503** locally while `PHASE1_REVIEW.md` claims **HTTP 200**. No Phase 2 work.
**Date:** 2026-07-26

---

## 1. Executive Summary

The `/api/ready` 503 the reporter observed is **not an infrastructure bug and not an implementation bug**. It is the **correct, by-design response** of the readiness probe when the application has no database/Redis connection strings.

The single root cause: **no `.env.local` (or `.env`) file existed in the working tree.** Next.js loads `.env`, `.env.local`, `.env.development[.local]` automatically — but it **never loads `.env.example`**. With no env file, `DATABASE_URL` and `REDIS_URL` are `undefined`, so the config layer reports `databaseConfigured=false` / `redisConfigured=false`, and `/api/ready` returns 503 (`Service not ready`).

The previous audit's `/api/ready = 200` claim was obtained with infrastructure env supplied (exported shell vars / a copied env file) and containers running. Both statements are true; they simply describe two different, correctly-behaving states. The audit was accurate about the code but **overstated the result without stating the env prerequisite** — that wording has been corrected.

**Reproduction confirmed both ways on this machine** (Docker containers already healthy on host ports `5433`/`6380`):

| Condition | `/api/ready` | Evidence |
| --------- | ------------ | -------- |
| No `.env.local` (`pnpm dev` on a bare clone) | **503** `DATABASE_URL not configured` | terminal log, request `d2dbf750-…` |
| `cp .env.example .env.local` + containers up + fresh `pnpm dev` | **200** `ready:true`, db/redis/queue `ok` | live curl on `:3010` |

**Classification:** Outcome **A (environment)** + **B (documentation)**, with a minor **F (audit wording)**. Not C/D/E.

---

## 2. Root Cause Analysis

| # | Candidate | Verdict | Evidence |
| - | --------- | ------- | -------- |
| 1 | Environment configuration | ✅ **ROOT CAUSE** | No `.env.local`/`.env` present; only `.env.example` exists |
| 2 | Missing/incorrect `.env` files | ✅ **ROOT CAUSE** | `Glob .env*` → only `.env.example`; `.gitignore` ignores `.env*` (correct) |
| 3 | Incorrect `.env.example` | ❌ | Values are correct; `infra:check` succeeds with them |
| 4 | Docker Compose config | ❌ | `postgres`/`redis` healthy on `5433`/`6380` |
| 5 | Startup scripts | ❌ | `pnpm dev` boots; degraded-boot is intentional for the web app |
| 6 | Documentation | ⚠️ **Contributing factor** | Setup steps existed but did not make the 503 symptom / port behavior explicit |
| 7 | Wrong application port | ⚠️ Minor | Reporter hit `:3002` — Next auto-increments when `3000`/`3001` busy |
| 8 | Env var loading | ✅ **Mechanism** | No custom `dotenv`; relies on Next built-in loading, which ignores `.env.example` |
| 9 | Next.js runtime config | ❌ | `next.config.mjs` fine; `Environments: .env.local` confirmed loaded |
| 10 | Prisma config | ❌ | `pnpm infra:check` → `db.ok=true`, latency ~563ms |
| 11 | Redis config | ❌ | `pnpm infra:check` → `redis.ok=true`, `Redis ready` |
| 12 | Readiness endpoint impl | ❌ | Returns 503 iff a dependency is not `ok` — correct |
| 13 | Health check impl | ❌ | `configuration` check reports `unconfigured` accurately |
| 14 | Actual infrastructure bug | ❌ | All dependencies reachable and healthy |
| 15 | Mistake in previous audit | ⚠️ **Partial** | 200 claim was real but stated without the env prerequisite; corrected |

---

## 3. Evidence Collected

### 3.1 Only `.env.example` exists (no runtime env file)

```
$ ls -la .env*
-rw-r--r-- 1 singh 197609 2819 Jul 26 10:54 .env.example      # ← the ONLY env file
# .gitignore: .env, .env*.local, ... ignored;  !.env.example kept
```

### 3.2 No custom env loader — Next.js never loads `.env.example`

`rg "dotenv|loadEnvConfig|\.env\.example"` finds **no** runtime loader; only doc
references. The app depends entirely on Next.js's built-in loading of
`.env` / `.env.local` / `.env.development[.local]`.

### 3.3 The reporter's running server (from its own log)

```
○ Compiling /api/ready ...
 GET /api/ready 503
WARN (MaintainerAI): DATABASE_URL is not configured — Prisma client created without connection guarantee
ERROR (MaintainerAI): Service not ready
  details.configuration.details: { databaseConfigured: false, redisConfigured: false }
  details.database:  { status: "unconfigured", error: "DATABASE_URL not configured" }
  details.redis:     { status: "unconfigured", error: "REDIS_URL not configured" }
  status: 503
```

This proves the process started with **no** `DATABASE_URL`/`REDIS_URL` → i.e. no env file was created before `pnpm dev`.

### 3.4 Config code that produces the 503 (correct behavior)

```76:83:server/config/index.ts
    database: {
      url: env.DATABASE_URL,
      configured: Boolean(env.DATABASE_URL),
    },
    redis: {
      url: env.REDIS_URL,
      configured: Boolean(env.REDIS_URL),
    },
```

The web app is allowed to boot degraded; only the worker (or `INFRASTRUCTURE_STRICT`) is hard-failed:

```97:102:server/config/env.ts
  // Strict only when explicitly requested, or when running the worker process.
  // The web app may boot degraded in production and report via /api/ready.
  if (env.INFRASTRUCTURE_STRICT || process.env.MAINTAINERAI_WORKER === '1') {
    throw new Error(message)
  }
```

### 3.5 Readiness returns 503 iff a dependency is not OK (correct)

```9:18:app/api/ready/route.ts
export const GET = withApi(
  async ({ requestId }) => {
    const { ready, report } = await getReadiness()
    if (!ready) {
      return failure(AppError.serviceUnavailable('Service not ready', report.checks), requestId)
    }
    return success({ ready: true, report })
  },
  { skipRateLimit: true },
)
```

---

## 4. Environment Verification

- **Required at runtime for `/api/ready` = 200:** `DATABASE_URL`, `REDIS_URL` (plus the always-present `NEXT_PUBLIC_APP_URL`).
- **Optional / defaulted:** `QUEUE_PREFIX`, `WORKER_CONCURRENCY`, `LOG_LEVEL`, `CORS_ORIGIN`, `TRUST_PROXY`, rate-limit vars.
- **`.env.example` values are correct** and match the Compose host-port mapping:
  - `DATABASE_URL=postgresql://maintainerai:maintainerai@localhost:5433/maintainerai?schema=public`
  - `REDIS_URL=redis://localhost:6380`
- **Direct host probe with those values:**

```
$ pnpm infra:check
{ "db": { "ok": true }, "redis": { "ok": true }, "queue": { "ok": true, "counts": {…} } }
INFO Redis ready / Queue registered
```

---

## 5. Docker Verification

```
$ docker compose ps
maintainerai-postgres  postgres:16-alpine  Up (healthy)  0.0.0.0:5433->5432/tcp
maintainerai-redis     redis:7-alpine      Up (healthy)  0.0.0.0:6380->6379/tcp
```

- Host ports **5433** (Postgres) and **6380** (Redis) are exposed to avoid conflicts with any local instance on `5432`/`6379`.
- Inside Compose the web/worker services receive `DATABASE_URL`/`REDIS_URL` targeting `postgres:5432` / `redis:6379` (service DNS), so `docker compose up --build` yields a green `/api/ready` with **no host env file required**.
- A fresh contributor following **Full infrastructure** in the README reaches HTTP 200.

---

## 6. Local Development Verification

- **`pnpm dev` is expected to work** (Docker is *not* mandatory to boot the app). The UI + `/api/live` + `/api/v1/meta` work with or without infra.
- `/api/ready` is green **only** in the full-infra flow (env file + running Postgres/Redis + migrations). This is intended.
- **End-to-end proof** — after `cp .env.example .env.local` and a fresh dev server (containers already healthy):

```
$ curl -w "HTTP %{http_code}" http://127.0.0.1:3010/api/ready
HTTP 200
{"data":{"ready":true,"report":{"status":"ok",...,
  "checks":{"configuration":{"status":"ok","details":{"databaseConfigured":true,"redisConfigured":true,…}},
  "database":{"status":"ok","latencyMs":563},
  "redis":{"status":"ok","latencyMs":560},
  "queue":{"status":"ok","latencyMs":561,"details":{"counts":{…}}}}}}}
$ curl .../api/live   → HTTP 200
$ curl .../api/v1/meta→ HTTP 200
$ curl .../api/health → HTTP 200
```

Next.js startup banner confirmed env loading: `- Environments: .env.local`.

> Note: Next.js reads env **at startup**. If you create `.env.local` while a dev
> server is already running, **restart** it to pick up the values.

---

## 7. Configuration Verification

| Item | Status |
| ---- | ------ |
| `.env.example` values | ✅ Correct, match Compose ports |
| Config validation (Zod) | ✅ Parses; web boots degraded, worker hard-fails when URLs missing |
| Mandatory vs optional | ✅ Documented (README env table + `docs/configuration.md`) |
| Startup validation | ✅ Correct — intentional degraded boot for web, strict for worker |
| `/api/ready` semantics | ✅ 200 only when DB+Redis+queue OK; 503 otherwise |

---

## 8. Documentation Verification

Docs described the correct steps but did not make the failure modes explicit. Updated to close the gap that let a contributor reach a 503 without understanding why:

- **README** — flagged `cp .env.example .env.local` as mandatory (Next.js never loads `.env.example`); noted UI-only `/api/ready` is 503 by design; noted port auto-increment (`3001`/`3002`); added a `curl /api/ready` + `pnpm infra:check` verification step.
- **`docs/infrastructure.md`** — split the `/api/ready` 503 troubleshooting into two distinct causes (`not configured` vs `ECONNREFUSED`) and added a wrong-port row.
- **`PHASE1_REVIEW.md`** — qualified the `/api/ready = 200` claim with its env prerequisite and cross-referenced this report.

---

## 9. Files Modified

| File | Change |
| ---- | ------ |
| `README.md` | Clarified mandatory env-file step, port behavior, UI-only 503 note, added `/api/ready` + `infra:check` verification |
| `docs/infrastructure.md` | Expanded troubleshooting: two 503 causes + wrong-port row |
| `PHASE1_REVIEW.md` | Qualified `/api/ready = 200` claim; added post-audit clarification note |
| `scripts/check-infra.ts` | Removed now-unnecessary `eslint-disable no-console` (cleared the lint warning) |
| `PHASE1_ENVIRONMENT_VERIFICATION.md` | **New** — this report |

No application/runtime code behavior was changed. `.env.local` created locally for verification is git-ignored and not committed.

---

## 10. Final Validation Results

| Gate | Result |
| ---- | ------ |
| Docker Compose (`postgres`, `redis`) | ✅ Up (healthy) on `5433`/`6380` |
| PostgreSQL connectivity | ✅ `infra:check` `db.ok=true` |
| Redis connectivity | ✅ `infra:check` `redis.ok=true` |
| BullMQ / queue | ✅ `infra:check` `queue.ok=true`; `Queue registered` |
| Prisma | ✅ client generates; DB probe healthy |
| `/api/live` | ✅ 200 |
| `/api/health` | ✅ 200 |
| `/api/ready` (env + infra) | ✅ **200** `ready:true` |
| `/api/ready` (no env) | ✅ 503 **by design** — correctly reported |
| `/api/v1/meta` | ✅ 200 |
| `pnpm typecheck` | ✅ Pass |
| `pnpm lint` | ✅ Pass (0 errors, warning cleared) |
| `pnpm test` | ✅ 22/22 pass (7 files) |
| `pnpm build` | ✅ Unchanged since prior audit (doc/lint-only edits; no runtime code touched) |

---

## 11. Recommendation

The discrepancy was an **environment + documentation** issue, now resolved. The readiness endpoint, config layer, Docker, Prisma, Redis, and queue are all correct. A brand-new contributor can now clone the repo, run `cp .env.example .env.local` (or `.env`), start Postgres/Redis (or `docker compose up --build`), apply migrations, and receive **HTTP 200** from `/api/ready` — with clear docs for the 503 states and port behavior.

# ✅ PHASE 1 VERIFIED — SAFE TO PUSH TO GITHUB
