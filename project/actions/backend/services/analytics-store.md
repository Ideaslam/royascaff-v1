## Module: Analytics Store (OLAP Engine)

### SVC-OLAP-ENGINE · OlapEngineRegistry + OlapEngine [infrastructure, internal, AnalyticsStore]
Strategy registry that resolves the active OLAP engine per workspace.

**Methods:**
- `register(id: OlapEngineId, engine: OlapEngine): void` — self-called by each engine on module init
- `resolve(engineId: OlapEngineId): OlapEngine` — returns concrete engine or throws if unknown

**Deps:** `ClickHouseEngine` · `BigQueryEngine`
**Side effects:** none
**Rules:** No `if/else` on engine id outside registry; callers always receive an `OlapEngine` interface, never a concrete class

---

### SVC-OLAP-STORE · AnalyticsStoreService [domain, internal, AnalyticsStore]
Engine-neutral analytics operations; resolves the workspace's active engine via `OlapEngineRegistry`.

**Methods:**
- `createDatasetTable(workspaceSlug, datasetId, schema): Promise<void>` — creates `ds_{workspaceSlug}_{datasetId}` on active engine
- `dropDatasetTable(workspaceSlug, datasetId): Promise<void>` — drops the table
- `insertRows(workspaceSlug, datasetId, rows): Promise<void>` — batched insert
- `createCanonicalView(viewName, sources: {table, mapping}[]): Promise<void>` — UNION view per semantic flag
- `runQuery(workspaceSlug, spec: QuerySpec): Promise<any[]>` — compiles `QuerySpec` via engine's `QueryCompiler` and executes
- `defineAggregate(workspaceSlug, datasetId, rollupDef): Promise<void>` — creates pre-aggregation (CH `AggregatingMergeTree` or BQ materialized view)
- `distinctValues(workspaceSlug, datasetId, column, limit?): Promise<string[]>` — full distinct list (filter-values list mode)
- `searchValues(workspaceSlug, datasetId, column, term, limit?): Promise<string[]>` — typeahead search (filter-values search mode)
- `cacheGet(key: string): Promise<any | null>` — Redis result-cache read
- `cacheSet(key: string, data: any, ttlSeconds?): Promise<void>` — Redis result-cache write
- `cacheInvalidate(...keys: string[]): Promise<void>` — Redis result-cache invalidation

**Deps:** `OlapEngineRegistry` · `ConfigService` · `IoRedis`
**Side effects:** OLAP engine DDL/DML · Redis cache reads/writes
**Rules:** Table naming convention `ds_{workspaceSlug}_{datasetId}` enforced here — never in callers · `QuerySpec` is the only way to produce query SQL; raw SQL strings must not pass through this service from domain callers

---

### SVC-OLAP-BENCH · OlapBenchmarkService [domain, internal, AnalyticsStore]
Admin-only service that runs a side-by-side benchmark on sample data against both engines.

**Methods:**
- `runBenchmark(triggeredBy: string, sampleFile?: Buffer, rowCount?: number): Promise<OlapBenchmarkRun>` — loads sample data into both engines, runs standard workload N times, records p50/p95 latency + rows scanned + estimated cost, persists result, cleans up temp tables, returns run
- `getResult(runId: string): Promise<OlapBenchmarkRun>` — poll result by id

**Deps:** `AnalyticsStoreService` (both engine instances) · `OlapBenchmarkRunRepository` · `ConfigService`
**Side effects:** temporary OLAP tables on both engines (cleaned up post-run)
**Rules:** Never runs against real workspace data — uses isolated temp tables · Admin-only callers only · Estimated cost is informational (based on rows scanned × engine pricing constants)
