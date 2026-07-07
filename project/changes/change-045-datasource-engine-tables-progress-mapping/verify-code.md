# Verify Code — change-045: Data-source engine (grouping, selection, progress, mapping)

## Plan Consistency (pre-build)
- [x] Endpoints exist in specs (`data.md`: EP-DATA-42..45, modified EP-DATA-41/23)
- [x] Services exist in specs (`connectors.md`, `data.md`, `pipelines.md`)
- [x] Data model updated (`data-model.md`: `SyncRun.progress`/`phase`)
- [x] Routes match (`/app/data`, `/app/data/sources/:connectionId`, `/app/data/connect/:type`)
- [x] Auth declared (all data endpoints under authenticated `data` controller)
- [x] Recon findings reflected (connector/pipeline/wizard code inspected first)

## Code Verification (post-build)

### 1. Grouping (AC 1–4)
- [x] `GET /data/connections/:id/datasets` (EP-DATA-42) in `DatasetsController` ✓
- [x] `data-sources.page` regrouped: one card per `DataConnection` via `sourceGroups` computed (fetches datasets + connections with `forkJoin`) ✓
- [x] NEW `source-detail.page` at route `data/sources/:connectionId` lists tables with per-table status/rows/actions ✓
- [x] Zid connection → one source card with N tables (grouped by `connectionId`) ✓

### 2. Selection engine (AC 5–8)
- [x] `ConnectorInterface.listEntities()` added; implemented by zid/salla/shopify/google_sheets/sql_server/mongodb_atlas ✓
- [x] `GET /data/connections/:id/entities` (EP-DATA-43) + `POST /data/connections/:id/datasets/from-entities` (EP-DATA-44) ✓
- [x] `select-entities` step kind added to `WizardStepKind` (BE + FE) and inserted by `PipelineTypeRegistry.getSetupFlow` for selection-capable sources; csv skips it ✓
- [x] Shared `EntitySelectStepComponent` wired into wizard; e-commerce OAuth callbacks now `connectFromOAuth` (connection + webhook only, no auto-provision) ✓

### 3. Mapping (AC 12–14)
- [x] `CANONICAL_SYNONYMS` + `prefillMappingByName` name-match prefill in `canonical-fields.config.ts` ✓
- [x] `discoverSchemaWithAiProposal` applies prefill; `confirmMapping`/`updateMapping` throw `UnprocessableEntityException` with structured `{ missing: [...] }` ✓
- [x] `SchemaReviewStepComponent` shows canonical-mapping UI for all sources, highlights required-unmapped fields, disables Confirm until mapped; wizard parses 422 into `serverMissing` ✓

### 4. Progress (AC 9–11)
- [x] `SyncRun` schema + repository carry `progress` (0–100) and `phase` (`SyncRunPhase`) ✓
- [x] `ExtractStep` (10→60%) and `LoadStep` (65→95%) update `SyncRun` progress/phase; `SyncRunRepository` provided to pipelines module ✓
- [x] `GET /data/datasets/:id/sync-runs/:runId` (EP-DATA-45) returns run with progress/phase ✓
- [x] Shared `ProgressLoaderComponent` (percentage + phase label); polled via `getSyncRun` on dataset-detail and source-detail during active syncs ✓

### 5. Editability (AC 15)
- [x] Source detail page: Add tables (re-enters wizard w/ `?connectionId=`), sync (full/incremental) with live loader, remove table, delete source; per-table configure opens dataset detail (descriptions/mapping/schedule) ✓

### 6. Quality (AC 16–17)
- [x] Backend `npx tsc -p tsconfig.json --noEmit` → exit 0 ✓
- [x] Frontend `ng build` → exit 0 (only pre-existing Sass `@import` deprecation warnings) ✓
- [x] No hardcoded external URLs in frontend — all calls via `DataService`/`apiUrl` ✓
- [x] New source needs only: connector (+`listEntities`), registry line, connect component, optional setup-flow override — shared steps untouched ✓

## Overall: PASS
