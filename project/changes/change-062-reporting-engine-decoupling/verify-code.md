# Verify — change-062 (Phase 3: Reporting Engine decoupling)

## Sub-step 3a — Break dashboards ↔ sharing cycle  ✅ PASS

### What was implemented
- **Consumer-owned port** `modules/dashboards/contract/share-token-resolver.ts`: `ShareTokenResolver`
  interface, `ResolvedShareToken` type, and `ShareTokenResolverRegistry` (single-resolver register +
  `resolveShareToken`, throws `GoneException` if none registered). Provided + exported by `DashboardsModule`.
- **Sharing implements + self-registers:** `SharingService implements ShareTokenResolver, OnModuleInit`;
  `onModuleInit()` registers itself into the registry. Its existing `resolveShareToken` already returns
  `{ dashboardId, workspaceSlug, permission }` → zero behavior change.
- **Dashboards decoupled:** `DashboardsService` injects `ShareTokenResolverRegistry` instead of
  `SharingService` (2 call sites repointed); removed unused `Inject` + `forwardRef` imports.
- **Cycle removed:** `DashboardsModule` no longer imports `SharingModule` (dropped `forwardRef`);
  `SharingModule` imports `DashboardsModule` **without** `forwardRef` → one-way `sharing → dashboards`.

### Verification
- **AC #1 — dashboards zero sharing imports:** `grep -i sharing modules/dashboards/**` → only doc-comment
  mentions in the port file; no code imports; `DashboardsModule` does not import `SharingModule`. ✅
- **AC #2 — no `forwardRef` in sharing:** removed; share-token resolution runs via the registered port. ✅
- **Build:** `nest build` → exit 0. ✅
- **Boot:** `node dist/main.js` → "Nest application successfully started"; `SharingModule` +
  `DashboardsModule` initialize with **no forwardRef/circular errors**; sharing + dashboards + export
  routes all mapped. ✅
- **Lints:** no new errors from these edits (pre-existing eslint/prettier debt in `dashboards.service.ts`
  is unrelated and unchanged; build gate is `tsc`/`nest build`).

### Status: **3a PASS** — dashboards↔sharing cycle inverted to one-way; behavior-neutral; boots.

---

## Sub-step 3b — Reporting depends on data contract only  ✅ PASS

### What was implemented
- **Read-only data contract** `modules/data/contract/data-source-resolver.ts`: `IDataSourceResolver`
  (`getDatasetMeta` → `{ id, name, analyticsTable, isSyncing }`; `getCsvFileMetas` →
  `{ id, isConfirmed }[]`), `DatasetMeta`/`CsvFileMeta` types, `DATA_SOURCE_RESOLVER` token. The
  contract exposes **semantic booleans** so reporting needs no data status enums.
- **Data-side impl** `DataSourceResolverService` wraps `DatasetRepository` + `CsvFileRepository`
  (maps `syncStatus === SYNCING` → `isSyncing`, `status === CONFIRMED` → `isConfirmed`). `DataModule`
  provides `DataSourceResolverService` + `{ provide: DATA_SOURCE_RESOLVER, useExisting }` and exports
  the token.
- **Dashboards repointed:** `DashboardsService` injects `@Inject(DATA_SOURCE_RESOLVER)` and uses it for
  dataset metadata (`buildQuerySpec`) and readiness (`resolveDatasetIds`), preserving the exact
  `BadRequestException` messages. Removed `DatasetRepository`/`CsvFileRepository`/`SyncStatus`/
  `CsvFileStatus` imports; `SyncRunMode.FULL` → `SyncMode.FULL` (sourced from the connector contract).
  Interface imported via `import type` (isolatedModules + emitDecoratorMetadata).

### Verification
- **AC #3 — dashboards zero data repo/schema imports:** `grep` for
  `SyncRunMode|datasetRepo|csvFileRepo|SyncStatus|CsvFileStatus|data/repositories|data/schemas` in
  `modules/dashboards/**` → no matches. Only `modules/data/contract/**` (allowed) + `DataModule`
  module-import (token provider; physical drop deferred to Phase 4). Queries stay on
  `AnalyticsStoreService`. ✅
- **Behavior-neutral:** resolver reproduces the identical readiness semantics + error messages; sync
  mode value unchanged (`SyncMode.FULL === SyncRunMode.FULL === 'full'`).
- **Build:** `nest build` → exit 0 (after fixing the decorated-param type to `import type`). ✅
- **Boot:** `node dist/main.js` → "Nest application successfully started"; `DATA_SOURCE_RESOLVER`
  resolves; no DI/circular errors. ✅
- **Lints:** new files clean; no new errors in `dashboards.service.ts` (pre-existing eslint debt only).

### Out of Phase 3 scope (deferred to Phase 4)
- `DashboardsModule` still module-imports `DataModule` (only to obtain the `DATA_SOURCE_RESOLVER`
  provider). Full module-import removal + physical `libs/reporting-engine` relocation + dashboard
  pipeline-step ownership move are Phase 4.

### Status: **3b PASS** — reporting reads data via contract only; behavior-neutral; boots.
