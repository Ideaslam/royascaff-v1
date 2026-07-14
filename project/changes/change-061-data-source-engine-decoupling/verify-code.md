# Verify — change-061 (Phase 2: Data Source Engine decoupling)

## Sub-step 2a — Break connectors → data cycle  ✅ PASS

### What was implemented
- **Neutral connector SPI** at `integrations/connectors/contract/`: `DiscoveredColumn`,
  `SyncMode`, `ConnectorConnection`, `ConnectorDataset`, `StreamingSyncCapability`,
  `StreamingResumeStrategy` + barrel.
- **`ConnectorInterface` + all 7 connectors** (csv, google-sheets, sql-server, mongodb-atlas,
  shopify, salla, zid) + `mongo-schema-sampler` retyped against the contract — no `modules/data`
  imports remain in `integrations/connectors/**`.
- **Shared vocabulary moved to contract; data re-exports it:** `dataset.schema.ts` re-exports
  `DiscoveredColumn`; `sync-run.schema.ts` re-exports `SyncMode as SyncRunMode`. All existing
  data-side imports keep working (one-way data → contract).
- **OAuth credential-refresh inverted (Google Sheets):** connector no longer injects
  `DataConnectionRepository`; it writes refreshed plaintext to `connection.refreshedCredentials`.
  New `DataConnectionService.persistRefreshedCredentials()` encrypts + persists + clears it, called
  from `DataSyncProcessor` (success + failure paths) and `DataConnectionService.testConnection`.
- **`StreamingSyncCoordinator` + streaming types relocated** from `integrations/connectors/streaming/`
  to `modules/pipelines/streaming/` (ingest layer). `load.step` / `extract.step` / `pipelines.module`
  repointed. `StreamingSyncCapability` stays in the neutral contract.
- **`*DatasetService` (shopify/salla/zid) moved** to `modules/data/services/ecommerce/`; `data.module`
  + shopify/salla/zid controllers repointed.
- **`ConnectorsModule` de-globalized:** removed `@Global()` and `forwardRef(() => DataModule)`;
  `imports: []`. `DataModule` and `PipelinesModule` now import `ConnectorsModule` explicitly
  → one-way `data → connectors` dependency.

### Verification
- **Plan/code consistency:** matches change-request 2a scope + design-gate decisions
  (structural SPI, filters-only hooks deferred to 2b, return-creds OAuth).
- **AC #1 — zero data imports in connectors:** `grep` for `modules/data|DataConnectionDocument|
  DatasetDocument|SyncRunMode|DataModule` under `integrations/connectors/` → only comments remain. ✅
- **AC #2 — no `@Global`/`forwardRef` on ConnectorsModule:** confirmed. ✅
- **AC #4 — no connector→data-repo write:** `DataConnectionRepository` removed from GoogleSheets;
  refresh handled via `connection.refreshedCredentials` + data-side persist. ✅
- **Build:** `npm run build` → exit 0 (clean `nest build`, `dist/main.js` emitted). ✅
- **Boot:** `node dist/main.js` → "Nest application successfully started"; all 7 connectors register,
  all pipeline steps register, OLAP engine registers; **no DI / circular / unresolved-dependency
  errors**. ✅
- **Lints:** none on changed files. ✅

### Deferred within 2a (intentional, safe)
- Setup-time Google refresh persistence in `dataset.service` (`listEntities`/`discoverSchema`) not
  wired — not-persisting only causes a harmless re-refresh (Google refresh tokens are reusable);
  sync + testConnection paths are covered.

### Status: **2a PASS** — behavior-neutral, cycle broken, CI-green, boots.

---

## Sub-step 2b — Sync lifecycle hooks (remove data → dashboards)  ✅ PASS

### What was implemented
- **Neutral sync-lifecycle seam** in engine-core (`engine-core/sync-lifecycle.ts`): `SyncSucceededEvent`
  (workspaceSlug/datasetId/analyticsTable/rowsLoaded/mode — all primitives), `SyncLifecycleHook`
  interface, and `SyncLifecycleRegistry` (self-registration + best-effort `emitSyncSucceeded`,
  per-hook try/catch). Exported from `engine-core` barrel; provided + exported by `EngineCoreModule`.
- **Reporting-side hook** `FilterRefreshSyncHook` (`modules/filters/filter-refresh.sync-hook.ts`):
  implements `SyncLifecycleHook`, registers itself into the registry on `OnModuleInit`, and runs the
  exact prior filter-refresh logic (`filterMetaRepo.findByDatasetId` → `filterValuesService.computeAndStore`).
  Registered by `FiltersModule` (now imports `EngineCoreModule`).
- **`DataSyncProcessor` decoupled:** removed `FilterValuesService` + `FilterValueMetaRepository`
  imports/constructor deps and the private `refreshFilterValues` method; post-sync now calls
  `syncHooks.emitSyncSucceeded({...})`.

### Verification
- **AC #3 — processor zero dashboards imports:** `grep dashboards|FilterValues|FilterValueMeta` in
  `data-sync.processor.ts` → no matches. Filter refresh runs via the registered hook. ✅
- **Behavior-neutral:** hook reproduces the identical refresh path; `FiltersModule` is already
  instantiated (imported by data/pipelines/dashboards), so the hook always registers before any sync
  runs at runtime. ✅
- **Build:** `npm run build` → exit 0. ✅
- **Boot:** `node dist/main.js` → "Nest application successfully started"; `FiltersModule dependencies
  initialized`, `build-filters` step registered, OLAP engine registered; no DI/circular errors. ✅
- **Lints:** none on changed files. ✅

### Out of 2b scope (noted, not an AC)
- `modules/data/services/dataset.service.ts` still calls `FilterValueMetaRepository.deleteByDatasetId`
  for filter-meta cleanup on dataset delete → `DataModule` keeps `FiltersModule`. AC #3 targets the
  processor only; a future `onDatasetDeleted` hook could remove this last data→reporting import.

### Status: **2b PASS** — post-sync data→dashboards import removed; behavior-neutral; boots.
