# Impact Analysis — Parallel Schema Discovery Jobs

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema (Dataset) | complete | `roya-ai-dynamo-api/src/modules/data/schemas/dataset.schema.ts` | No `schemaDiscoveryStatus` / error / batchId / timestamps |
| Service (Dataset) | complete | `…/data/services/dataset.service.ts` | `createFromEntities` loops `await discoverSchemaWithAiProposal` sequentially; discover/refresh are sync HTTP |
| Column identify | complete | `…/data/services/column-identify.service.ts` | Unchanged AI logic — reuse as-is inside worker |
| Sync processor pattern | complete | `…/data/processors/data-sync.processor.ts` + `DATA_SYNC_QUEUE` | No `schema-discovery` queue/processor yet |
| Background jobs module | complete | `…/background-jobs/background-jobs.module.ts` | Queue list lacks schema-discovery; `JobType` enum optional (status lives on Dataset) |
| Endpoints | complete | `…/data/controllers/datasets.controller.ts` | EP-DATA-44/22/49 return after full AI; no retry-as-enqueue contract; no batch-oriented poll helper |
| FE models/service | complete | `frontend/…/core/models/data.models.ts`, `data.service.ts` | No discovery status fields; `discoverSchema` / `refreshAvailableColumns` expect sync 200 |
| Entity select UI | complete | `…/shared/components/entity-select-step/` | Single ProgressLoader over long `from-entities` call; no per-table status rows |
| Setup wizard | complete | `…/pages/data/setup/dataset-setup-wizard.page.*` | On entities selected → immediately loads datasets → jumps to `schema-review` (assumes discovery done) |
| Connect components | complete | `…/setup/connect/{csv,google-sheets,sql-server,mongodb-atlas}-connect.component.ts` | Call `discoverSchema()` synchronously after create |
| Dataset detail | complete | `…/pages/data/dataset-detail/` | Add column / refresh awaits sync EP-DATA-49 |
| Ingest IdentifyColumnsStep | complete | `…/pipelines/steps/identify-columns.step.ts` | Already async via `DATA_SYNC_QUEUE` ingest — **out of scope** for this UX (sync-time identify stays) |

Feature state: **complete** (modify — async parallelize setup/discovery paths that already exist)

Plan-vs-code drift: none material for this change. Docs correctly describe sequential `discoverSchemaWithAiProposal` in `createFromEntities`.

## Affected Modules
- **Data** — Dataset fields, DatasetService enqueue APIs, schema-discovery processor, endpoint contracts, wizard/status UI
- **Background Jobs** — register new BullMQ queue `schema-discovery` (reuse Dataset status; optional BackgroundJob record not required)
- **Pipelines** — no ingest step change; setup discovery becomes shared background work consumed by all features that call discover/refresh

## Plan Docs to Update
- [x] `project/plan/data-model.md` — Dataset discovery status fields + enum
- [x] `project/plan/modules.md` — Schema Discovery / Select What to Import / Manage Datasets behavior
- [x] `project/actions/backend/services/data.md` — createFromEntities enqueue; discover/refresh enqueue; retry; worker
- [x] `project/actions/backend/services/background-jobs.md` — SCHEMA_DISCOVERY_QUEUE (if documented)
- [x] `project/actions/backend/endpoints/data.md` — EP-DATA-44/22/49 contracts; optional batch poll EP
- [x] `project/actions/customer-portal/pages/data.md` — wizard discovery status step; source-detail; dataset-detail Add column polling
- [x] `project/rules.md` — only if async discovery rule needed (assess: short rule under Data)

## Ripple / Impact Map

| Item | Action | Classification |
|------|--------|----------------|
| Dataset schema + DTO + FE `Dataset` model | Add status/error/batch/timestamps | **Modify** |
| `DatasetService.createFromEntities` | Create datasets + enqueue jobs; return `schemaDiscoveryBatchId`; no await AI | **Modify** |
| `discoverSchemaWithAiProposal` / `refreshAvailableColumns` | Keep core logic; add enqueue wrappers that set status + queue job | **Modify** / **Complete** |
| New `SchemaDiscoveryProcessor` + queue | Worker calls existing discover/refresh; updates Dataset status | **Create** |
| EP-DATA-44 | 201 `{ datasetIds, createdIds, schemaDiscoveryBatchId }` — fast return | **Modify** |
| EP-DATA-22 / EP-DATA-49 | Enqueue → **202** `{ datasetId, schemaDiscoveryStatus }` (or DatasetDto with queued status) | **Modify** |
| Poll | Reuse `GET` dataset / connection datasets (include new fields); optional `?schemaDiscoveryBatchId=` filter | **Modify** / **Create** (filter only if missing) |
| Retry | Re-call EP-DATA-22 for failed dataset only | **Modify** (same endpoint) |
| `entity-select-step` + wizard | After create: show per-table status list, poll 5s, Continue when ≥1 success & none running | **Modify** |
| Connect components (CSV/Sheets/SQL/Mongo) | Enqueue discover + wait via poll/status UI instead of sync `toPromise` | **Modify** |
| Dataset-detail Add column / Refresh AI | Poll discovery status after enqueue | **Modify** |
| IdentifyColumnsStep (ingest) | No change | — |
| Admin panel | Out of scope | — |

## Reuse Opportunities
- Pattern: `DATA_SYNC_QUEUE` + `DataSyncProcessor` + Dataset/`SyncRun` status + FE `interval` poll (dataset-detail uses 2s; this change uses **5s**)
- `ColumnIdentifyService` / `discoverSchemaWithAiProposal` unchanged internally
- Existing ProgressLoader + PrimeNG Tag/Button for status list styling
- EP-DATA-42 list datasets for batch resume when user leaves wizard

## Risks
- **Complexity: M** — queue + FE multi-dataset gating + connect-path callers
- **Cross-module: Y** (Data + Background Jobs; FE wizard)
- **Migration: N** (defaults on new fields)
- Concurrent jobs may hit AI rate limits — mitigate with BullMQ concurrency (reasonable default, e.g. 3–5)
- HTTP status change 200→202 on EP-DATA-22/49 may break FE callers — update all callers in same change
- Idempotent re-select of already-discovered entities: should not re-enqueue unless retry/force; document behavior (existing datasets skipped in create loop already)

## Recommendation
- **Create:** `SCHEMA_DISCOVERY_QUEUE`, `SchemaDiscoveryProcessor`, wizard discovery-status UI (component or step)
- **Modify:** Dataset model/DTO, DatasetService create/discover/refresh, EP-DATA-44/22/49, entity-select + wizard + connect + dataset-detail, planning docs listed above
- **Complete:** N/A (feature already complete; behavior change to async parallel)
- **Do not change:** ingest `identify-columns` step, AI prompts, admin AI usage UI

## Risk summary
**Medium** complexity · cross-module **Y** · migration **N**
