# Impact Analysis — Connector Interface & Sync Queue

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| `ConnectorInterface` | none | — | No adapter pattern; CSV parsing done inline in `DataService` |
| `ConnectorRegistry` | none | — | No registry |
| `ConnectorsModule` | none | — | No integration module for connectors |
| `DATA_SYNC_QUEUE` | none | `background-jobs.module.ts` | Only `CSV_ANALYSIS_QUEUE` + `DASHBOARD_GENERATION_QUEUE` existed |
| `DataSyncProcessor` | none | — | No processor for the new queue |
| `SyncService` | none | — | No service to enqueue/manage sync runs |
| Incremental sync (watermark) | none | — | No watermark concept anywhere |
| `ConnectorInterface.extract()` | none | — | No async-iterable batch extraction pattern |

**Existing code affected:**

| Code | Why it matters |
|------|----------------|
| `background-jobs.module.ts` | Must register `DATA_SYNC_QUEUE` + `BullModule` queue entry |
| `data.module.ts` | Must provide `DataSyncProcessor`, `SyncService`, import `ConnectorsModule` |
| `app.module.ts` | Must import `ConnectorsModule` |

Feature state: **fully greenfield; no existing connector code to migrate**

---

## Affected Modules

- **`src/integrations/connectors/`** (new) — `ConnectorInterface`, `ConnectorRegistry`, `ConnectorsModule`
- **`src/modules/data/processors/`** (new) — `DataSyncProcessor`
- **`src/modules/data/services/`** (new) — `SyncService`
- **`src/modules/background-jobs/`** (modify) — add `DATA_SYNC_QUEUE` constant + BullMQ registration
- **`src/modules/data/data.module.ts`** (modify) — register new processor + service + import ConnectorsModule
- **`src/app.module.ts`** (modify) — import `ConnectorsModule`

---

## Plan Docs to Update

- [x] `project/actions/backend/services/` — add `SyncService` spec
- [x] `project/plan/modules.md` — add Connectors integration module

---

## Files Created

```
src/integrations/connectors/connector.interface.ts
src/integrations/connectors/connector.registry.ts
src/integrations/connectors/connectors.module.ts
src/modules/data/processors/data-sync.processor.ts
src/modules/data/services/sync.service.ts
```

## Files Modified

```
src/modules/background-jobs/background-jobs.module.ts  # +DATA_SYNC_QUEUE
src/modules/data/data.module.ts                        # +SyncService, +DataSyncProcessor
src/app.module.ts                                      # +ConnectorsModule
```

---

## Risk

- **Complexity: M** — async-iterable batch extraction pattern, full/incremental mode switching, watermark tracking — all new but isolated.
- **Cross-module: Y (minor)** — `background-jobs`, `data`, `app` root all touched.
- **Migration: N** — new queue/processor runs alongside existing queues with no conflict.
- **External: N** — no external service SDK required at this stage (concrete connectors added in Phase C).

---

## Recommendation

### Implementation order within this CR
1. Define `ConnectorInterface` (testConnection, discoverSchema, extract, normalize).
2. Create `ConnectorRegistry` (`@Global()` provider).
3. Create `ConnectorsModule` (global).
4. Register `DATA_SYNC_QUEUE` in `background-jobs.module.ts`.
5. Create `DataSyncProcessor` (stub extract→normalize→load).
6. Create `SyncService` (enqueue jobs, create `SyncRun` records).
7. Wire into `data.module.ts` and `app.module.ts`.
