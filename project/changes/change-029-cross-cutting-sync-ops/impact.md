# Impact Analysis — change-029: Cross-Cutting Sync Ops

## 1. Reconnaissance

### What already exists
| Feature | Status |
|---|---|
| `SyncRun` schema (status, rowsIn, rowsLoaded, startedAt, finishedAt, errorMessage) | ✅ Exists |
| `SyncRunRepository` (create, markRunning, markDone, markFailed, markCancelled, findByDataset) | ✅ Exists |
| `SyncService.listRuns()` | ✅ Exists |
| `GET /data/datasets/:id/sync-runs` (EP in `DatasetsController`) | ✅ Exists |
| `Dataset.lastSyncAt`, `Dataset.lastSyncErrorMessage`, `Dataset.syncStatus` | ✅ Exists |
| `NotificationsService.notify()` + `NotificationType` enum | ✅ Exists |
| `SubscriptionLimitService.check()` + `SubscriptionLimitKey` enum | ✅ Exists |
| `SubscriptionPlan.maxDataUploadsPerMonth` / `maxDataUpdatesPerMonth` | ✅ Exists |
| BullMQ retry (`attempts: 3, backoff: exponential`) in `SyncService.triggerSync()` | ✅ Exists |

### What is missing (the real gap for change-029)
| Feature | Gap |
|---|---|
| Schema-drift detection (D31) | No `SchemaDriftService`; no drift fields on `Dataset`; no user-facing drift endpoint |
| Retry a failed sync run manually (D33) | `POST .../sync-runs/:runId/retry` endpoint missing |
| Sync-failure notification (D33) | Processor never calls `NotificationsService` on failure; `SYNC_FAILED` notification type missing |
| Subscription limits for **synced rows** (D34) | `MAX_SYNCED_ROWS_PER_MONTH` key + plan field missing; no enforcement in processor |
| Subscription limits for **sync frequency** (D34) | `MAX_SYNCS_PER_DAY` key + enforcement missing |
| Admin per-source health overview (D33) | No admin endpoint/page aggregating sync health |
| "Last updated X ago" | Frontend only — `Dataset.lastSyncAt` exists; needs UI rendering |

## 2. Scope of Change-029

Focus on the **missing** items only. Existing infrastructure is extended, not replaced.

### D31 — Schema Drift

**Detect:** on each sync the processor compares fresh `discoverSchema()` columns against `Dataset.schema`. Computes:
- `added` — columns present in new schema but not in stored
- `removed` — columns in stored schema not in new
- `retyped` — columns present in both but with different canonical type
- Safe additions auto-applied; `removed` + `retyped` flagged as **breaking**

**Store:** new `schemaDrift` field on `SyncRun` (embedded object, nullable).  
**Surface:** `GET /data/datasets/:id/sync-runs` already returns `SyncRun` — drift data rides along.  
**Action on breaking drift:** set `Dataset.hasSchemaDrift = true`; `DataSyncProcessor` sends a `SYNC_SCHEMA_DRIFT` notification; sync continues with the old schema (safe fallback).

### D33 — Observability + Manual Retry

**Retry endpoint:** `POST /data/datasets/:id/sync-runs/:runId/retry` — re-queues a FAILED run.  
**Failure notification:** `DataSyncProcessor.process()` catch block calls `NotificationsService.notify()` with new `NotificationType.SYNC_FAILED`.  
**Admin health:** `GET /admin/data/sync-health` — aggregate by workspace/source type showing last run status, last sync time, failure rate.

### D34 — Subscription Limits for Sync

**New limit keys:** `MAX_SYNCED_ROWS_PER_MONTH`, `MAX_SYNCS_PER_DAY`  
**New plan fields:** `maxSyncedRowsPerMonth` (0 = unlimited), `maxSyncsPerDay` (0 = unlimited)  
**New user subscription counters:** `syncedRowsThisMonth`, `syncsToday`, `syncsTodayResetAt`  
**Enforcement:** `SyncService.triggerSync()` checks both limits before enqueuing; processor adds `rowsLoaded` to `syncedRowsThisMonth` after a successful run.

## 3. New / Modified Files

### Backend — New
| File | Purpose |
|---|---|
| `src/modules/data/services/schema-drift.service.ts` | Compare old vs new schema; return drift report |
| `src/modules/admin/controllers/sync-health.controller.ts` | `GET /admin/data/sync-health` |

### Backend — Modified
| File | Change |
|---|---|
| `src/modules/notifications/schemas/notification.schema.ts` | Add `SYNC_FAILED`, `SYNC_SCHEMA_DRIFT` to `NotificationType` |
| `src/modules/data/schemas/sync-run.schema.ts` | Add `schemaDrift` embedded field |
| `src/modules/data/schemas/dataset.schema.ts` | Add `hasSchemaDrift: boolean` |
| `src/modules/subscriptions/constants/usage-types.ts` | Add `MAX_SYNCED_ROWS_PER_MONTH`, `MAX_SYNCS_PER_DAY` |
| `src/modules/subscriptions/schemas/subscription-plan.schema.ts` | Add `maxSyncedRowsPerMonth`, `maxSyncsPerDay` |
| `src/modules/subscriptions/schemas/user-subscription.schema.ts` | Add `syncedRowsThisMonth`, `syncsToday`, `syncsTodayResetAt` |
| `src/modules/subscriptions/services/subscription-limit.service.ts` | Add `getPlanLimit` + `getCurrentUsage` cases; add `incrementSyncedRows()`, `incrementSyncsToday()` |
| `src/modules/data/services/sync.service.ts` | Check limits in `triggerSync()`; add `retryRun()` method |
| `src/modules/data/controllers/datasets.controller.ts` | Add `POST .../sync-runs/:runId/retry` endpoint |
| `src/modules/data/processors/data-sync.processor.ts` | Call `SchemaDriftService`; call `NotificationsService` on failure + drift; call `limitService.incrementSyncedRows()` on done |
| `src/modules/data/data.module.ts` | Provide `SchemaDriftService`; import `SubscriptionsModule` |

### Frontend — New
| File | Purpose |
|---|---|
| `src/app/pages/data/dataset-detail/dataset-detail.page.ts` | Per-dataset sync history + "last updated X ago" + retry |
| `src/app/pages/data/dataset-detail/dataset-detail.page.html` | Template |

### Frontend — Modified
| File | Change |
|---|---|
| `src/app/core/models/data.models.ts` | Add `SyncRunDrift`, `SyncRun.schemaDrift`, `Dataset.hasSchemaDrift` |
| `src/app/core/services/data.service.ts` | Add `retrySyncRun()` method |
| `src/app/app.routes.ts` | Route already exists as `/app/data/datasets/:id` — confirm |

## 4. New Endpoints

| ID | Method | Path | Description |
|---|---|---|---|
| EP-DATA-39 | POST | `/data/datasets/:id/sync-runs/:runId/retry` | Re-queue a FAILED sync run |
| EP-ADMIN-SH-1 | GET | `/admin/data/sync-health` | Admin: per-source sync health summary |

## 5. Risks
| Risk | Mitigation |
|---|---|
| `getCurrentUsage` in limit service needs DB query per trigger | Lightweight counter in `UserSubscription` doc — single findOne, no aggregation |
| Schema drift during incremental sync may mask data loss | Keep stored schema unchanged on breaking drift; flag only; user must explicitly re-map |
| Retry of a FAILED run may still fail if root cause not fixed | Retry is user-initiated; BullMQ retry count resets on new job |

## 6. Implementation Order
1. `notification.schema.ts` — add new notification types
2. `sync-run.schema.ts` — add `schemaDrift` field
3. `dataset.schema.ts` — add `hasSchemaDrift`
4. `subscription-plan.schema.ts` + `user-subscription.schema.ts` — add sync limit fields
5. `usage-types.ts` — add new limit keys
6. `subscription-limit.service.ts` — extend `getPlanLimit`, `getCurrentUsage`, add increment methods
7. `schema-drift.service.ts` — new service
8. `sync.service.ts` — add limit checks + `retryRun()`
9. `datasets.controller.ts` — add retry endpoint
10. `data-sync.processor.ts` — wire drift + notifications + row-count increment
11. `data.module.ts` — provide SchemaDriftService; import SubscriptionsModule
12. `sync-health.controller.ts` (admin) + register in admin module
13. Frontend models + service method
14. Frontend dataset-detail page (TS + HTML)
15. Compile check (backend + frontend)
16. Update change-log
