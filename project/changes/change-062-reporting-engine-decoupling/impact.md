# Impact Analysis — Phase 3: Reporting Engine decoupling (change-062)

Base: `roya-ai-dynamo-api/src`. Builds on change-060 (engine-core kernel) + change-061 (data engine
decoupling: connector SPI, sync lifecycle hooks).

## Code Reconnaissance

### Blocker 1 — dashboards ↔ sharing cycle

| Element | State | Location | Evidence |
|---------|:-----:|----------|----------|
| `forwardRef(() => SharingModule)` | present | `dashboards/dashboards.module.ts:47` | masks cycle |
| `forwardRef(() => DashboardsModule)` | present | `sharing/sharing.module.ts:17` | masks cycle |
| `DashboardsService` injects `SharingService` | present | `dashboards.service.ts:56,91-92` (`@Inject(forwardRef())`) | used only at L831, L898 |
| Consumer need | narrow | `sharingService.resolveShareToken(token)` → `{dashboardId, workspaceSlug, permission}` | 2 call sites |
| `SharingService` injects dashboards repos | present | `sharing.service.ts:12-14,25-27` (`DashboardRepository`, `ChartWidgetRepository`, `ChartDataCacheRepository`) | natural arrow sharing→dashboards |
| Other `SharingService` consumers | none | repo-wide grep | only `SharingController` (same module) |

**Break:** invert control — dashboards owns a `ShareTokenResolver` **port** + registry; sharing implements
+ self-registers. dashboards no longer imports sharing at all.

### Blocker 2 — dashboards → data internals

| Element | State | Location | Evidence |
|---------|:-----:|----------|----------|
| `DataModule` imported by DashboardsModule | present | `dashboards.module.ts:18,41` | module coupling |
| `DatasetRepository.findById` | used | `dashboards.service.ts:24,732,934` | reads `analyticsTable`, `syncStatus` |
| `CsvFileRepository.findByIds` | used | `dashboards.service.ts:22,948` | reads `status` |
| Data enums | used | `dashboards.service.ts:23 (CsvFileStatus), 25 (SyncStatus), 50 (SyncRunMode)` | readiness checks + sync trigger |
| OLAP queries | already shared | `dashboards.service.ts:46,87,713` (`AnalyticsStoreService.runQuery`) | `IQueryExecutor` satisfied |

**Break:** add read-only `IDataSourceResolver` (dataset + csv metadata) provided by the data engine;
repoint dashboards.service onto it; move `SyncMode` import to the connector contract.

### Not a blocker (recon simplification)

| Element | Finding |
|---------|---------|
| **Export** | `export.module` imports `DashboardsModule` only; `export.service` no data imports. One-way, clean. |
| **Filters** | No `modules/data` imports; post-sync refresh hook already registered (change-061 / 2b). |
| **AnalyticsStoreService** | Shared OLAP read facade — reporting keeps using it directly (= `IQueryExecutor`). |
| **Dashboard pipeline steps** (generate/widget-crud) | Live in `modules/pipelines`; physical ownership move deferred to Phase 4. |

**Feature state:** complete + working — this is a **refactor** (decoupling), behavior-neutral.

## Affected Modules
- **Dashboards** — own `ShareTokenResolver` port + registry; inject registry instead of `SharingService`;
  inject `IDataSourceResolver` instead of data repos; drop `forwardRef(SharingModule)`.
- **Sharing** — implement + self-register the port; drop `forwardRef(DashboardsModule)` → plain import.
- **Data** — add `IDataSourceResolver` contract + `DataSourceResolverService`; provide/export the token.
- **engine-core / contract** — none new (reuse connector contract for `SyncMode`).
- **Export / Filters** — unchanged.

## Sub-step plan (each build+boot+smoke verified)
- **3a** — break dashboards↔sharing cycle (port + registry + self-registration; remove both `forwardRef`).
- **3b** — reporting → data contract only (`IDataSourceResolver`; repoint dashboards.service).

## Code Impact (create / modify)

### Create
- `modules/dashboards/contract/share-token-resolver.ts` — `ShareTokenResolver` interface,
  `ResolvedShareToken` type, `ShareTokenResolverRegistry` (register + resolve).
- `modules/data/contract/data-source-resolver.ts` — `IDataSourceResolver` + `DatasetMeta` / `CsvFileMeta`
  + `DATA_SOURCE_RESOLVER` token.
- `modules/data/services/data-source-resolver.service.ts` — impl wrapping `DatasetRepository` +
  `CsvFileRepository`.

### Modify
- `dashboards/dashboards.module.ts` — provide/export `ShareTokenResolverRegistry`; drop
  `forwardRef(SharingModule)`; (3b) inject via `DATA_SOURCE_RESOLVER`.
- `dashboards/services/dashboards.service.ts` — use registry for share-token; use resolver for
  dataset/CSV metadata; drop `modules/data` repo/schema imports; source `SyncMode` from connector contract.
- `sharing/sharing.module.ts` — import `DashboardsModule` without `forwardRef`; register the port adapter.
- `sharing/services/sharing.service.ts` — `implements ShareTokenResolver`, `OnModuleInit` self-register.
- `data/data.module.ts` — provide + export `DataSourceResolverService` under `DATA_SOURCE_RESOLVER`.

## Ripple / risk map

| Item | Action | Risk |
|------|--------|------|
| Share-token resolution path (anonymous share access, change-051) | route through registry; identical return shape | M |
| Registry availability | sharing self-registers on init; sharing always loaded → resolver present before any request | L |
| Dashboard readiness checks (dataset syncStatus / csv status) | via resolver; preserve `BadRequestException` messages | M |
| `SyncRunMode.FULL` in dashboard-from-template trigger | source `SyncMode` from connector contract (same value) | L |
| DashboardsModule still module-imports DataModule (for token) | acceptable; physical drop deferred to Phase 4 | L |

## Risk
- **Complexity:** Medium · **Cross-module:** Yes · **Migration:** No (no schema/collection changes).
- **Highest risks:** preserving anonymous share-token access behavior; identical readiness-check errors.
- **Mitigation:** two sub-steps, each verified by `nest build` + boot + smoke (share-link view + dashboard
  create readiness).

## Recommendation
- **Do 3a then 3b**, verifying between them. Defer physical `libs/` move, pipeline-step ownership move,
  and dropping the `DataModule` module-import (all Phase 4).
