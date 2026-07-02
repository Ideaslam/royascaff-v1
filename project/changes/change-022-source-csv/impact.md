# Impact Analysis — Change 022: CSV Source on New Foundation

## 1. Code Reconnaissance

### Feature State: Partial

The full infrastructure from changes 014–021 is in place. The **CSV connector itself** and the **API surface for connections/datasets** are the only missing pieces.

| Layer | State | Detail |
|-------|-------|--------|
| `ConnectorInterface` + `ConnectorRegistry` | ✅ Complete | `src/integrations/connectors/` — interface, registry, global module |
| `DataConnection` schema/repo/service | ✅ Complete | `src/modules/data/` — schema, repo, service (encrypt/decrypt) |
| `Dataset` schema/repo | ✅ Complete | `src/modules/data/` — full schema, repo (create, findById, updateMapping, setSyncDone, etc.) |
| `DatasetService` | 🔶 Partial | Exists but **missing**: `discoverSchemaWithAiProposal()` — no connector call on create, no AI mapping proposal |
| `SyncService` + `SyncRunRepository` + `DataSyncProcessor` | ✅ Complete | Full BullMQ sync queue, pipeline dispatch, filter refresh |
| `PipelineEngine` + all ingest steps (extract, apply-mapping, trim, type-cast, dedupe, load) | ✅ Complete | `src/modules/pipelines/steps/` |
| `column-mapping.md` prompt | ✅ Complete | `src/integrations/ai/prompts/column-mapping.md` |
| **`CsvConnector`** | ❌ Missing | Nothing in `src/integrations/connectors/` except interface + registry |
| **Backend DataConnection/Dataset/Sync controller + DTOs** | ❌ Missing | Only legacy `DataController` (CSV file endpoints) exists |
| **`createDashboard` with Dataset check** | 🔶 Partial Drift | Calls `csvFileRepo.findByIds()` + checks `CsvFileStatus.CONFIRMED`; must be updated to resolve `Dataset` records and check `syncStatus` |
| Frontend data models (Dataset/DataConnection/SyncRun) | ❌ Missing | Only `CsvFile`/`ColumnMetadata` exist |
| Frontend data service (Dataset/DataConnection/Sync API calls) | ❌ Missing | Only legacy CSV service methods |
| Frontend data pages (connections/datasets UI) | ❌ Missing | Only legacy `FilesListPage` + `UploadWizardPage` |

---

## 2. Ripple / Impact Map

| Area | Action | Reason |
|------|--------|--------|
| `DashboardsService.createDashboard` | **Modify** | Currently calls `csvFileRepo.findByIds` — must instead resolve `Dataset` IDs (with CsvFile fallback for existing dashboards) |
| `ConnectorsModule` | **Complete in place** | Add `CsvConnector` to providers/exports |
| `DataModule` | **Complete in place** | Register new controller + CsvConnector (via ConnectorsModule import which is @Global) |
| `GatherDatasetSchemasStep` | **Safe — no change** | Already handles both Dataset (new) and CsvFile (legacy) fallback |
| `DashboardDatasourceRepository` | **Safe — no change** | Already uses `datasetId` field |
| Legacy `DataController` (EP-DATA-01..08) | **Keep — no change** | Legacy CSV routes stay active for now per change-request out-of-scope |

---

## 3. Impact Classification

### Backend — Create New

1. `src/integrations/connectors/csv/csv.connector.ts` — `CsvConnector` implementing `ConnectorInterface`
2. `src/modules/data/controllers/datasets.controller.ts` — REST controller for DataConnection + Dataset + Sync endpoints (EP-DATA-09..22)
3. `src/modules/data/dto/dataset.dto.ts` — DTOs for all new endpoints

### Backend — Complete in Place

4. `src/modules/data/services/dataset.service.ts` — add `discoverSchemaWithAiProposal(workspaceSlug, datasetId)`:
   - Resolves connector (`ConnectorRegistry.resolve(dataset.sourceType)`)
   - Calls `connector.discoverSchema(connection, dataset)` → stores `Dataset.schema`
   - Calls AI with `column-mapping` prompt using discovered columns + `semanticFlag` options
   - Parses AI response → stores proposed `columnMapping` + `semanticFlag` on Dataset (as `aiProposedMapping` / `aiProposedSemanticFlag`, user can edit before confirming)
5. `src/integrations/connectors/connectors.module.ts` — add `CsvConnector` to providers + exports

### Backend — Modify

6. `src/modules/data/data.module.ts` — register `DatasetsController`, import `CsvConnector` provider
7. `src/modules/dashboards/services/dashboards.service.ts` `createDashboard()` — replace `csvFileRepo.findByIds` + `CONFIRMED` check with: try `datasetRepo.findByIds` → check `analyticsTable != null && syncStatus != SYNCING`; fall back to `csvFileRepo.findByIds` + `CONFIRMED` for backward compat
8. `src/modules/dashboards/dashboards.module.ts` — may need `DatasetRepository` import (if not already transitively available)

### Frontend — Create New

9. `src/app/core/models/data.models.ts` additions — `DataConnection`, `Dataset`, `SyncRun`, `DiscoveredColumn`, `AiSchemaProposal` interfaces (keep existing `CsvFile` + `ColumnMetadata`)
10. `src/app/core/services/data.service.ts` additions — methods for DataConnection CRUD, Dataset CRUD + discoverSchema + triggerSync + listSyncRuns + syncStatus polling
11. `src/app/pages/data/data-sources/data-sources.page.ts/.html` — landing page showing datasets list with status badges + "New CSV Dataset" button
12. `src/app/pages/data/csv-upload/csv-upload.page.ts/.html` — upload CSV → creates DataConnection + Dataset → schema discovery loading state → review discovered schema + AI-proposed columnMapping + semanticFlag → edit and confirm → trigger initial sync
13. `src/app/pages/data/dataset-detail/dataset-detail.page.ts/.html` — schema view, columnMapping editor, syncStatus, last sync info, sync history, "Re-sync" button

### Frontend — Modify

14. `src/app/app.routes.ts` — add new routes: `/app/data` → DataSourcesPage; `/app/data/csv-upload` → CsvUploadPage; `/app/data/datasets/:id` → DatasetDetailPage; keep `/app/data/files` + `/app/data/upload` for legacy

---

## 4. Plan Docs to Update

| Doc | Section | Update |
|-----|---------|--------|
| `modules.md` | S10 Connectors (SVC-CONN-CSV) | Mark as implemented; add `discoverSchemaWithAiProposal` note to DatasetService |
| `services/data.md` | SVC-DATA-DS | Add `discoverSchemaWithAiProposal()` method |
| `services/connectors.md` | SVC-CONN-CSV | Mark feature state from "planned" to implemented |
| `services/dashboards.md` | SVC-DASH | Update `createDashboard` deps + logic description |
| `endpoints/data.md` | EP-DATA-09..22 | Mark as implemented |
| `customer-portal/pages/data.md` | CSV Upload + DataSources | Update from planned → implemented |
| `change-log.md` | Row 022 | Update status to `✅ PASS` (after verify) |
| `data-model.md` | Dataset | Add `aiProposedMapping`, `aiProposedSemanticFlag` fields |

---

## 5. Dataset Schema Additions (minor)

The `Dataset` schema needs two temporary AI-proposal fields (shown to user for review, replaced on confirm):

| Field | Type | Purpose |
|-------|------|---------|
| `aiProposedMapping` | Object \| null | AI-suggested `columnMapping` from `column-mapping` prompt |
| `aiProposedSemanticFlag` | String \| null | AI-suggested `semanticFlag` |

---

## 6. CsvConnector Design

| Method | Behavior |
|--------|----------|
| `testConnection(conn)` | Decrypts credentials → gets `storageKey` → calls `storageProvider.exists(key)` → returns `{ ok, message }` |
| `discoverSchema(conn, dataset)` | Downloads CSV from R2 → reads header row → infers column types from first N rows → returns `DiscoveredColumn[]` |
| `extract(conn, dataset, opts)` | Streams CSV from R2 in batches → yields `Record<string, unknown>[]`; full sync = all rows, incremental = unsupported (returns all rows with a warning) |
| `normalize(rows, schema)` | Casts each value per `DiscoveredColumn.type`; drops columns not in schema |

CSV `DataConnection.credentials` shape:
```json
{ "storageKey": "uploads/{workspaceSlug}/{uuid}.csv" }
```

---

## 7. Risk

| Risk | Severity | Mitigation |
|------|----------|------------|
| Large CSV files held in memory during `extract` | Medium | Implement row-batching in CsvConnector; current `ExtractStep` already accumulates rows — acceptable for MVP, note as technical debt |
| `createDashboard` change could break existing dashboards using legacy CSV | High | Implement dual-path (Dataset first, CsvFile fallback) with no removal of legacy path |
| AI mapping proposal may suggest wrong mappings | Low | User reviews before confirming; mapping is schema-on-read, no data destructed |
| `discoverSchema` timeout on large CSVs | Medium | Only read first 500 rows for type inference; schema discovery is fast for header-only read |

---

## 8. Implementation Order

1. **`CsvConnector`** (backend) — self-contained, no new deps
2. **Register CsvConnector** in `ConnectorsModule` + update `DataModule`
3. **`DatasetService.discoverSchemaWithAiProposal()`** — needs connector + AI provider
4. **Dataset schema additions** (`aiProposedMapping`, `aiProposedSemanticFlag`)
5. **Backend DTOs + `DatasetsController`** — new endpoints EP-DATA-09..22
6. **`DashboardsService.createDashboard`** — update to Dataset path with CsvFile fallback
7. **Frontend models + service** — new API client
8. **Frontend pages** — DataSourcesPage, CsvUploadPage, DatasetDetailPage
9. **Routing** — update `app.routes.ts`
10. **Compile check**
