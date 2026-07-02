# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-module
- **target-app**: admin-panel
- **affected-repos**: backend+admin
- **priority**: high

## Scope
- Module(s): new `analytics-store` module + `integrations/olap/*` providers (`clickhouse`, `bigquery`) + admin `olap-benchmark`
- Feature(s): pluggable OLAP engine (Strategy pattern), dialect-neutral query spec, canonical views, aggregate cache tiers, **admin engine benchmark + recommendation**
- Endpoint(s): admin `POST /admin/olap/benchmark` (run), `GET /admin/olap/benchmark/:id` (results)
- Page(s)/View(s): admin-panel: **OLAP Engine Benchmark** screen
- Service(s): `OlapEngine` (strategy interface), `OlapEngineRegistry`, `ClickHouseEngine`, `BigQueryEngine`, `AnalyticsStoreService`, `QueryCompiler`, `OlapBenchmarkService`

## Description
Introduce the **OLAP layer as a Strategy pattern** so each workspace/account uses **either ClickHouse or BigQuery** for dataset storage + analytical queries. MongoDB stays the store for all existing app data.

Problem: raw data today is one dynamic Mongo collection per file (`csvdata_{fileId}`), queried via Mongo aggregation — doesn't scale and locks us to one engine. We want to run both OLAP engines, compare them, and recommend one per account.

Desired behavior:
- **`OlapEngine` strategy interface** — domain-neutral operations: `createDatasetTable`, `dropDatasetTable`, `insertRows` (batched), `createCanonicalView`, `runQuery(querySpec)`, `defineAggregate` (materialized rollup), `distinctValues` / `searchValues` (for filters). Concrete strategies: **`ClickHouseEngine`** and **`BigQueryEngine`**, each isolated in `integrations/olap/*` and self-registered in an **`OlapEngineRegistry`** keyed by engine id (`clickhouse | bigquery`).
- **Per-account/workspace engine selection** — the active engine is resolved from the workspace's `olapEngine` field (set at account creation — see change-002). All analytics-store operations resolve the engine via the registry for the current workspace. `datasetId`/`workspaceSlug` are opaque inputs here.
- **Dialect-neutral query spec + `QueryCompiler`** — callers (widgets, filters, aggregates) build a **structured query spec** (source table/view, aggregations, filters, group-by, order, limit); each engine's `QueryCompiler` translates the spec to its own SQL dialect. Raw dialect SQL is confined to engine implementations, **not** exposed to callers or prompts.
- **Canonical views** per semantic flag (UNION of mapped dataset tables) implemented per engine.
- **Aggregate cache tiers**: Redis result-cache helper (`widget + filters-hash`, engine-agnostic); per-engine pre-aggregation (ClickHouse `AggregatingMergeTree` / BigQuery materialized views) behind `defineAggregate`.
- **Admin engine benchmark + recommendation** (folded into the foundation): an **admin-only** capability to compare both engines on **sample data**:
  - Admin picks a sample dataset (upload/select) and a representative query workload (or use a built-in default workload).
  - `OlapBenchmarkService` loads the sample into **both** ClickHouse and BigQuery, runs the same **neutral query spec** workload on each, and records per-engine **latency (p50/p95), rows scanned, and estimated cost**.
  - Results persist as a benchmark run; the admin screen shows a side-by-side comparison and a **recommended engine** (best latency/cost trade-off, configurable weighting).
  - Sample data + temp tables are cleaned up after the run; the benchmark never touches customer workspace data.

Out of scope: connectors, pipeline engine, dataset/connection domain model, filter store internals, dashboard changes. (Per-end-user auto-recommendation at signup is not built here; the admin benchmark informs the default.)

## Acceptance Criteria
1. `OlapEngine` strategy interface defines table, view, insert, query(spec), aggregate, and distinct/search operations; `ClickHouseEngine` and `BigQueryEngine` both implement it and self-register in `OlapEngineRegistry` by id.
2. The active engine is resolved per workspace via `olapEngine`; switching the workspace value routes all analytics-store operations to the other engine with **no caller code changes**.
3. `AnalyticsStoreService` creates/describes/drops per-dataset tables and batch-inserts rows on **both** engines.
4. A **dialect-neutral query spec** executes on both engines via each `QueryCompiler`, returning equivalent typed rows; no raw user input is interpolated into SQL.
5. A canonical view (union of ≥ 2 mapped dataset tables) works on both engines; a `defineAggregate` rollup can be created and queried on both.
6. Redis result-cache store/read/invalidate works engine-agnostically; MongoDB app data is untouched and the app boots.
7. Adding a new OLAP engine requires only implementing `OlapEngine` + a `QueryCompiler` + one registry entry (no caller changes).
8. An admin can run a benchmark on sample data across both engines and view a side-by-side comparison (latency p50/p95, rows scanned, estimated cost) with a **recommended engine**; benchmark endpoints are admin-only and sample data/temp tables are cleaned up after the run.

## Notes (optional)
- Depends on: none (first). Foundation pair with 002 (which adds the `olapEngine` field on the workspace/account). Enables all subsequent Phase B changes.
- **Prompt impact (see 004):** because queries flow through the neutral query spec, generation prompts stay dialect-agnostic. Only free-form AI SQL steps (advanced clean-data) receive a `{{dialect}}` hint.
- Keep all engine specifics in `integrations/olap/*`; `analytics-store` exposes only engine-neutral operations.
- Extensibility (A11): registry + strategy; no engine `if/else` outside the strategies.
- Switching a workspace's engine after data exists requires a full re-sync into the new engine (note for change-016).
- Reference: root `Phases.md` A1, A4, A8 (prompt/dialect), A10 cache, A11, B13.
