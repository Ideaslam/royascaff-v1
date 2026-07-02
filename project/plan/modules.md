# Modules & Features

## 1. AnalyticsStore
- Scope: BE `src/integrations/olap/` (engine providers) + `src/modules/analytics-store/`
- Audience: internal (consumed by pipeline, dashboards, connectors)
- Entities: `OlapBenchmarkRun`
- Depends on: `Workspace`, `Admin`

### Features
1. **OLAP Engine Strategy** [backend-only] — pluggable `OlapEngine` interface with `ClickHouseEngine` and `BigQueryEngine` implementations; `OlapEngineRegistry` resolves active engine per workspace; `QueryCompiler` per engine translates a dialect-neutral `QuerySpec` to engine SQL; dialect partials expose SQL capabilities for prompt injection
2. **Analytics Store Operations** [backend-only] — `AnalyticsStoreService` provides engine-neutral: create/drop per-dataset table, batch insert rows, create canonical union views per semantic flag, run a `QuerySpec`, define pre-aggregation rollup, and compute distinct/search values for filters
3. **Redis Result Cache** [backend-only] — reusable cache helper keyed by `widget + filters-hash`; store, read, and invalidate; engine-agnostic
4. **Admin OLAP Benchmark** [both] — admin runs a benchmark against sample data on both engines simultaneously; `OlapBenchmarkService` loads sample data, executes a standard query workload, records latency (p50/p95), rows scanned, and estimated cost per engine; persists results as `OlapBenchmarkRun`; admin panel shows side-by-side comparison with a recommended engine badge
