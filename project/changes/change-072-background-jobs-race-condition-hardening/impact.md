# Impact Analysis — Background Jobs Race Condition Hardening

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Distributed Lock | **none** | — | No lock service exists. No Redlock, no Redis SET NX, no MongoDB transactions for concurrency control |
| Stale Job Recovery | **none** | — | No mechanism to detect/recover stuck SYNCING/RUNNING/GENERATING statuses after crashes |
| Sync Guard | **complete (unsafe)** | `sync.service.ts:59-61` | Check-then-act: reads `syncStatus`, throws if SYNCING, then separately sets SYNCING in processor. Race window between read and write |
| Schema Discovery Guard | **complete (unsafe)** | `dataset.service.ts:380-385` | Same pattern: reads `schemaDiscoveryStatus`, throws if QUEUED/RUNNING, then separately updates to QUEUED |
| Dashboard Gen Guard | **complete (unsafe)** | `dashboards.service.ts:651-652` | Same: reads status, throws if GENERATING, then separately sets GENERATING |
| Sync Processor | **complete** | `data-sync.processor.ts` | Sets SYNCING at line 75, handles errors at 201-224. Does NOT reset status on Bull retry |
| Schema Discovery Processor | **complete** | `schema-discovery.processor.ts` | Swallows all errors (no rethrow), single attempt, no Bull retry |
| CSV Analysis Processor | **complete** | `csv-analysis.processor.ts` | Swallows all errors, single attempt, no Bull retry |
| Dashboard Gen Processor | **complete** | `dashboard-generation.processor.ts` | Swallows all errors, single attempt, no Bull retry |
| Subscription Activation | **complete** | `subscription-activation.processor.ts` | 5 attempts, but `activateFromPayment` not idempotent |
| Rollover Processor | **complete (safe)** | `subscription-period-rollover.processor.ts` | Fixed `jobId` prevents duplicate schedulers — good pattern |
| Scheduled Sync Cron | **complete (unsafe)** | `scheduled-sync.service.ts:22-31` | `@Cron` fires on ALL instances. No deduplication |
| AI Provider | **complete (no retry)** | `anthropic.provider.ts` | No retry for transient errors (429/500/timeout), no concurrency limiter |
| Dataset Repository | **complete** | `dataset.repository.ts:377-399` | `setSyncing`/`setSyncDone`/`setSyncError` are simple `findByIdAndUpdate` — no conditional guards |
| BullMQ Config | **complete (defaults)** | all 6 processors | No `lockDuration`, `stalledInterval`, or `maxStalledCount` tuning |

Feature state: **complete** (all features work but lack multi-instance safety)

## Affected Modules

- **common** (NEW) — Create `DistributedLockService` (Redis SET NX/PX + Lua release)
- **background-jobs** — Add `StaleJobRecoveryService`, register stale-recovery repeatable job
- **data** — Atomic sync/schema-discovery guards, cron dedup, processor retry/status-reset
- **dashboards** — Atomic generation guard
- **ai-processing** — Add Bull retry config to CSV analysis + dashboard generation processors
- **subscriptions** — Idempotency check in activation processor
- **integrations/ai** — Internal retry + concurrency limiter in `AnthropicProvider`

## Plan Docs to Update
- [ ] `services/data.md` — document DistributedLockService, StaleJobRecoveryService
- [ ] `rules.md` — add concurrency/locking rules

## Code Changes — Detailed

### NEW: Distributed Lock Service

| Action | File | Description |
|--------|------|-------------|
| **Create** | `src/common/services/distributed-lock.service.ts` | Redis-based lock: `acquireLock(key, ttlMs)`, `releaseLock(key, token)`, `withLock(key, ttlMs, fn)` using `SET key token NX PX ttl` + Lua-scripted release |
| **Create** | `src/common/distributed-lock.module.ts` | `@Global()` NestJS module providing `DistributedLockService` |
| **Modify** | `src/app.module.ts` | Import `DistributedLockModule` |

### NEW: Stale Job Recovery Service

| Action | File | Description |
|--------|------|-------------|
| **Create** | `src/modules/background-jobs/services/stale-job-recovery.service.ts` | `OnModuleInit` + Bull repeatable job (every 5min, fixed jobId). Detects: datasets stuck `syncing` > 30min, `running` discovery > 15min, `processing` background jobs > 20min, `generating` dashboards > 15min. Resets status + logs |
| **Modify** | `src/modules/background-jobs/background-jobs.module.ts` | Register `STALE_RECOVERY_QUEUE`, add processor provider |

### A. Race Conditions — Atomic Guards

| Action | File | Change |
|--------|------|--------|
| **Modify** | `dataset.repository.ts` | Add `atomicSetSyncing(slug, id)` → `findOneAndUpdate({ _id, syncStatus: { $ne: 'syncing' } }, { $set: { syncStatus: 'syncing' } })` returns null if already syncing. Add `atomicSetSchemaDiscoveryQueued(slug, id, patch)` → same pattern for `schemaDiscoveryStatus: { $nin: ['queued','running'] }` |
| **Modify** | `sync.service.ts` | Replace `if (dataset.syncStatus === SYNCING) throw` with `atomicSetSyncing()` + null check. Wrap enqueue in Redis lock `sync:dataset:{id}` |
| **Modify** | `dataset.service.ts` | Replace check-then-act in `enqueueSchemaDiscovery` with `atomicSetSchemaDiscoveryQueued()` + null check. Redis lock `schema:{id}` |
| **Modify** | `dashboards.service.ts` | Replace status check with atomic `findOneAndUpdate({ _id, status: { $ne: 'generating' } }, { $set: { status: 'generating' } })` |
| **Modify** | `dashboard.repository.ts` | Add `atomicSetGenerating(slug, id)` method |

### B. Cron Deduplication

| Action | File | Change |
|--------|------|--------|
| **Modify** | `scheduled-sync.service.ts` | Remove `@Cron` decorators. Convert to Bull repeatable jobs with fixed `jobId` (`scheduled-hourly-sync`, `scheduled-daily-sync`). Register in `onModuleInit`. Add a lightweight processor or reuse existing logic |
| **Modify** | `data.module.ts` | If ScheduleModule no longer needed, evaluate removal (may still be used elsewhere) |

### C. Consistent Retry Strategy

| Action | File | Change |
|--------|------|--------|
| **Modify** | `schema-discovery.processor.ts` | Classify errors as transient vs permanent. Rethrow transient errors so Bull retries. Permanent errors still swallowed with FAILED status |
| **Modify** | `dataset.service.ts` (enqueue) | Add `attempts: 2, backoff: { type: 'exponential', delay: 5000 }` to schema discovery queue options |
| **Modify** | `csv-analysis.processor.ts` | Same transient/permanent error split. Rethrow transient for Bull retry |
| **Modify** | `dashboard-generation.processor.ts` | Same pattern |
| **Modify** | `data-sync.processor.ts` | At start of `process()`, call `datasetRepo.setSyncing()` to reset syncStatus on Bull retry attempts |

### D. AI Provider Resilience

| Action | File | Change |
|--------|------|--------|
| **Modify** | `anthropic.provider.ts` | Add `withRetry(fn, maxRetries=3)` wrapper around `client.messages.create()`. Retry on: 429 (honor Retry-After), 500/502/503, ECONNRESET, ETIMEDOUT. Exponential backoff (1s, 2s, 4s). Add concurrency limiter (semaphore, max 10 concurrent) |

### E. Subscription Activation Idempotency

| Action | File | Change |
|--------|------|--------|
| **Modify** | `subscription-activation.processor.ts` | Before calling `activateFromPayment`, check if subscription already active for this payment. If yes, log and skip |

### F. BullMQ Worker Configuration

| Action | File | Change |
|--------|------|--------|
| **Modify** | all 6 processors | Add `@Processor(QUEUE, { lockDuration, stalledInterval, maxStalledCount })` options appropriate to job type |

## Ripple Set

| Item | Impact | Action |
|------|--------|--------|
| `SyncService.continueRun()` | Same check-then-act for `syncStatus` | Apply same atomic guard |
| `SyncService.triggerSyncForDataSource()` | Calls `triggerSync` in loop — naturally gets atomic guard | Verify works correctly |
| `DatasetService.enqueueSchemaDiscoveryForDataSource()` | Calls `enqueueSchemaDiscovery` in loop | Verify handles ConflictException from atomic guard |
| Webhook-triggered syncs (Shopify/Salla/Zid) | Call `syncService.triggerSync()` | Naturally protected by atomic guard |
| `DatasetService.updateSchemaSelectionColumns()` | Checks `syncStatus === SYNCING` to block schema edits during sync | Consider making atomic but lower priority (read-only check is acceptable here) |
| `DatasetService.refreshAvailableColumns()` | Same sync-in-progress check | Same as above |
| Payment `markPaidIfPending` | Already atomic `findOneAndUpdate({ status: PENDING })` | No change needed — good pattern ✓ |
| Subscription rollover | Already uses fixed `jobId` for dedup | No change needed — good pattern ✓ |

## Risk

- **Complexity**: Medium — cross-cutting but each change is mechanically simple
- **Cross-module**: Yes — touches 7 modules but changes are isolated per module
- **Migration**: No — no schema changes, no data migration
- **Regression risk**: Low — atomic guards are strictly more restrictive (reject duplicates that previously raced); stale recovery is additive; retry is additive
- **Testing**: Manual verification with concurrent requests + process kill tests

## Recommendation

- **Create**: `DistributedLockService`, `DistributedLockModule`, `StaleJobRecoveryService`
- **Modify**: `sync.service.ts`, `dataset.service.ts`, `dataset.repository.ts`, `dashboards.service.ts`, `dashboard.repository.ts`, `scheduled-sync.service.ts`, `data-sync.processor.ts`, `schema-discovery.processor.ts`, `csv-analysis.processor.ts`, `dashboard-generation.processor.ts`, `anthropic.provider.ts`, `subscription-activation.processor.ts`, `subscription-period-rollover.processor.ts`, `background-jobs.module.ts`, `app.module.ts`, `data.module.ts`
