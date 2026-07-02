# Impact Analysis — Data Source Model

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| `DataConnection` schema | none | — | Only `CsvFile` schema existed under `data/schemas/`; no credentials model |
| `Dataset` schema | none | — | No Dataset entity; file-level `CsvFile` conflated connection + dataset + sync state |
| `SyncRun` schema | none | — | Sync state stored inline on `CsvFile`; no separate run history |
| Credentials encryption | none | — | No encryption utility anywhere |
| `DataConnectionRepository` | none | — | Does not exist |
| `DatasetRepository` | none | — | Does not exist |
| `SyncRunRepository` | none | — | Does not exist |
| Canonical field dictionary | none | — | No semantic-flag concept; no mapping dictionary |
| `DashboardDatasource.fileId` | exists | `schemas/dashboard-datasource.schema.ts` | Field name `fileId`; must rename to `datasetId` |
| `CreateDashboardDto.fileIds` | exists | `dto/dashboard.dto.ts` | Must rename to `datasetIds` |
| `Workspace.olapEngine` | none | `schemas/workspace.schema.ts` | Field missing; must add |
| `DataModule` providers | partial | `data.module.ts` | Only `CsvFile`-centric providers registered |

**Existing code affected (ripple):**

| Code | Why it matters |
|------|----------------|
| `DashboardsService.createDashboard()` | Validates CSV files by id; updated to accept `datasetIds` |
| `DashboardDatasourceRepository` | `findByDashboardId` returns documents with `fileId`; migrated to `datasetId` |
| `DashboardsService.copyDashboard()` | Copies datasource links; must use new field name |

Feature state: **greenfield new entities; partial modification of dashboard schema**

---

## Affected Modules

- **`src/modules/data/`** (new schemas/repos/services) — `DataConnection`, `Dataset`, `SyncRun`, canonical-fields config, `DataConnectionService`, `DatasetService`
- **`src/modules/dashboards/`** (modify) — `DashboardDatasource` field rename, `CreateDashboardDto` field rename, `DashboardsService` method updates
- **`src/modules/workspace/`** (modify) — add `olapEngine` field to `WorkspaceSchema`
- **`src/common/utils/`** (new) — `credentials-encryption.util.ts`
- **`src/config/config.ts`** (modify) — add `dataConnections.encryptionKey`
- **`src/modules/analytics-store/`** (consume) — `AnalyticsStoreModule` imported by `DataModule`

---

## Plan Docs to Update

- [x] `project/plan/data-model.md` — add `DataConnection`, `Dataset`, `SyncRun` schemas + enums
- [x] `project/plan/modules.md` — update Data module feature inventory

---

## Files Created

```
src/modules/data/schemas/data-connection.schema.ts
src/modules/data/schemas/dataset.schema.ts
src/modules/data/schemas/sync-run.schema.ts
src/modules/data/repositories/data-connection.repository.ts
src/modules/data/repositories/dataset.repository.ts
src/modules/data/repositories/sync-run.repository.ts
src/modules/data/services/data-connection.service.ts
src/modules/data/services/dataset.service.ts
src/modules/data/config/canonical-fields.config.ts
src/common/utils/credentials-encryption.util.ts
```

## Files Modified

```
src/modules/dashboards/schemas/dashboard-datasource.schema.ts   # fileId → datasetId
src/modules/dashboards/dto/dashboard.dto.ts                     # fileIds → datasetIds
src/modules/dashboards/services/dashboards.service.ts           # createDashboard / copy updates
src/modules/workspace/schemas/workspace.schema.ts               # +olapEngine field
src/modules/data/data.module.ts                                 # register new providers/repos
src/config/config.ts                                            # +dataConnections.encryptionKey
```

---

## Risk

- **Complexity: M** — three new entities, credential encryption, and schema migration of the M:N table — all additive; no deletion of existing data or routes.
- **Cross-module: Y** — workspace, dashboards, and data modules all touched.
- **Migration: N** — CSV data stays; new entities coexist. Migration to Dataset-based path happens in change-022.
- **Breaking: Y (minor)** — `CreateDashboardDto.fileIds` renamed to `datasetIds`; any existing API clients must update, but API is internal/controlled.

---

## Recommendation

### Implementation order within this CR
1. Add `Workspace.olapEngine` field.
2. Create `DataConnection` schema + repository + service (with credentials encryption).
3. Create `Dataset` schema + canonical-fields config + repository + service.
4. Create `SyncRun` schema + repository.
5. Rename `DashboardDatasource.fileId` → `datasetId` and update DTO + service methods.
6. Register all new providers/repos in `DataModule`.
7. Add `dataConnections.encryptionKey` to `config.ts`.
