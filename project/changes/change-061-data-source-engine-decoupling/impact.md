# Impact Analysis — Phase 2: Data Source Engine decoupling (change-061)

Base: `roya-ai-dynamo-api/src`. Builds on change-060 (engine-core kernel at `src/engine-core/`).

## Code Reconnaissance

### Blocker 1 — connectors ↔ data cycle

| Element | State | Location | Evidence |
|---------|:-----:|----------|----------|
| `forwardRef(() => DataModule)` | present | `integrations/connectors/connectors.module.ts:22` | one-directional |
| `@Global()` on ConnectorsModule | present | `connectors.module.ts:20` | hides graph |
| `ConnectorInterface` typed vs data schemas | conflated | `connectors/connector.interface.ts:1-3` | `DataConnectionDocument`, `DatasetDocument`, `DiscoveredColumn`, `SyncRunMode` |
| Connector→data imports | 15 files | `integrations/connectors/**` | schemas/repos/services |
| `GoogleSheetsConnector` injects `DataConnectionRepository` | present | `google-sheets.connector.ts:48` (used L321 `updateCredentials`) | connector writes to data |
| `*DatasetService` owned by DataModule but under connectors/ | mismatch | `connectors/{shopify,salla,zid}/*-dataset.service.ts`; provided `data.module.ts:98-100` | 3 files |
| `StreamingSyncCoordinator` under connectors, provided by Pipelines | mismatch | `connectors/streaming/streaming-sync.coordinator.ts`; `pipelines.module.ts:70` | injects `SyncRunRepository` + `AnalyticsStoreService` |
| `streaming-sync.types.ts` imports data schemas | present | `connectors/streaming/streaming-sync.types.ts:1-3` | neutral-ize |

### Blocker 2 — data → reporting (filters)

| Element | State | Location |
|---------|:-----:|----------|
| `DataSyncProcessor` imports dashboards filter code | present | `data-sync.processor.ts:12-13` (`FilterValuesService`, `FilterValueMetaRepository` from `../../dashboards/...`) |
| Post-sync filter refresh call | inline | `data-sync.processor.ts:166` → `refreshFilterValues()` (250-278) → `FilterValuesService.computeAndStore` |
| DI path | via FiltersModule | `data.module.ts` imports `FiltersModule` (re-provides dashboards code) |
| Other post-sync effects | inline | metering `limitService.increment*` (155-161, cross-cutting); failure notification (181-183, cross-cutting); schema-drift (76-108, data) |

### Not a blocker (recon simplification)

| Element | Finding |
|---------|---------|
| `AnalyticsStoreService` | Clean shared OLAP facade; used by ingest (write) **and** reporting (read: `runQuery`/`distinctValues`/`searchValues`). Stays shared. |
| `OlapModule`/`OlapEngineRegistry` | Shared `@Global()` infra; only `AnalyticsStoreService` resolves the registry. No move needed. |
| Ingest steps | Only `extract`/`identify-columns`/`load` touch data (`SyncRun*`, `DatasetRepository`, `ColumnIdentifyService`); transform steps are pure. |

**Feature state:** complete + working — this is a **refactor** (decoupling), behavior-neutral.

## Affected Modules
- **Connectors (S10)** — neutral SPI; retype interface + all connectors; drop `@Global()`/`forwardRef`; OAuth cred-refresh inversion.
- **Data (4)** — import connector SPI types; own the `*DatasetService` files; persist refreshed OAuth creds; register/relocate `StreamingSyncCoordinator`; `DataSyncProcessor` uses sync hooks.
- **engine-core** — add `SyncLifecycleHooks` seam (token + registry interface).
- **Filters (S12) / Reporting** — register the post-sync filter-refresh hook.
- **Pipelines/ingest (S11)** — move streaming coordinator wiring; ingest LoadStep unchanged behavior.

## Sub-step plan (each build+boot+smoke verified)
- **2a** — break connectors→data cycle (SPI + moves + OAuth inversion + module de-globalization).
- **2b** — sync lifecycle hooks + remove data→dashboards import.

## Code Impact (create / modify / move)

### Create
- `integrations/connectors/contract/` — neutral SPI types (`connector-connection`, `connector-dataset`, `discovered-column`, `sync-mode`, `extract-options`, `connection-test-result`, `data-source-entity`, `streaming-capability`) + barrel.
- `engine-core/sync-lifecycle.ts` — `SyncLifecycleHooks` interface + `SYNC_LIFECYCLE_HOOKS` token + a small registry.

### Modify
- `connector.interface.ts` + all 7 connectors + `connector.registry.ts` — retype to SPI; remove data imports.
- `google-sheets.connector.ts` — return refreshed creds instead of writing via `DataConnectionRepository`.
- `data/schemas/{dataset,sync-run}.schema.ts` — source `DiscoveredColumn`/sync-mode from SPI (or re-export).
- `connectors.module.ts` — drop `@Global()`/`forwardRef`; adjust providers/exports.
- `data.module.ts` — provide moved `*DatasetService`; wire connectors explicitly.
- `data-sync.processor.ts` — replace inline filter refresh with hook dispatch; drop dashboards imports.
- reporting/filters side — register the filter-refresh hook.

### Move (physical)
- `connectors/{shopify,salla,zid}/*-dataset.service.ts` → `modules/data/services/ecommerce/`.
- `connectors/streaming/*` → ingest layer (`modules/pipelines/` or `modules/data/`), neutral-typed.

## Ripple / risk map

| Item | Action | Risk |
|------|--------|------|
| Every connector `extract/discoverSchema/testConnection/normalize/listEntities` signature | retype to SPI (structural — documents still satisfy) | M |
| `DiscoveredColumn`/`SyncRunMode` consumers across data | import from SPI | M (mechanical, wide) |
| OAuth token refresh persistence | invert to caller | M (touches Google Sheets sync path) |
| `StreamingSyncCoordinator` relocation | move + re-provide; `LoadStep` injection path | M |
| Post-sync filter refresh via hook | ensure hook registered before first sync; identical call args | M |
| ConnectorsModule de-globalization | add explicit imports where connectors were used implicitly | M (DI resolution) |

## Risk
- **Complexity:** High · **Cross-module:** Yes · **Migration:** No (no schema/collection/credential changes).
- **Highest risks:** retyping the connector SPI across all connectors without behavior change; OAuth
  refresh inversion; de-globalizing `ConnectorsModule` (DI wiring); hook ordering for filter refresh.
- **Mitigation:** two sub-steps, each verified by `nest build` + boot + a smoke sync per source family
  and a post-sync filter-refresh check.

## Recommendation
- **Do 2a then 2b**, verifying between them. Defer physical `libs/` move (Phase 4), reporting
  contracts (Phase 3), and `TenantContext` adoption.
