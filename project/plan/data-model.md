# Data Model

## Conventions
- PKs: `_id: ObjectId` (MongoDB) or engine-native key (ClickHouse / BigQuery).
- Workspace-scoped Mongo collections follow the `ws_{slug}_{collection}` naming convention.
- OLAP dataset tables follow `ds_{workspaceSlug}_{datasetId}`.
- Timestamps: `createdAt`, `updatedAt` (auto via Mongoose `timestamps: true`).

---

## 1. OlapBenchmarkRun
Purpose: stores the results of a single admin-triggered benchmark run comparing both OLAP engines on sample data.
Collection: `olap_benchmark_runs` (global, not workspace-scoped — admin use only)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | ObjectId | PK | — |
| `triggeredBy` | ObjectId | required | → `users._id` |
| `status` | Enum | required; `pending \| running \| done \| failed` | — |
| `sampleRowCount` | Number | required | — |
| `workloadDescription` | String | optional | — |
| `clickhouse` | Object | nullable | see sub-fields below |
| `clickhouse.p50Ms` | Number | nullable | latency p50 (ms) |
| `clickhouse.p95Ms` | Number | nullable | latency p95 (ms) |
| `clickhouse.rowsScanned` | Number | nullable | — |
| `clickhouse.estimatedCostUsd` | Number | nullable | — |
| `clickhouse.error` | String | nullable | — |
| `bigquery` | Object | nullable | see sub-fields below |
| `bigquery.p50Ms` | Number | nullable | latency p50 (ms) |
| `bigquery.p95Ms` | Number | nullable | latency p95 (ms) |
| `bigquery.rowsScanned` | Number | nullable | — |
| `bigquery.estimatedCostUsd` | Number | nullable | — |
| `bigquery.error` | String | nullable | — |
| `recommendation` | Enum | nullable; `clickhouse \| bigquery \| inconclusive` | — |
| `recommendationReason` | String | nullable | — |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: one admin user triggers many benchmark runs
Indexes: index `status`; index `createdAt` desc; index `triggeredBy`

---

## 2. OlapQuerySpec (type — not a stored entity)
Purpose: dialect-neutral query descriptor passed to `QueryCompiler`; never stored as-is (widget `queryDefinition` stores the spec JSON).

| Field | Type | Notes |
|-------|------|-------|
| `source` | String | table or view name |
| `aggregations` | Array\<{fn, field, alias}\> | e.g. `{fn:'sum', field:'revenue', alias:'total'}` |
| `filters` | Array\<{field, op, value}\> | injected at query time |
| `groupBy` | String[] | — |
| `orderBy` | Array\<{field, dir}\> | — |
| `limit` | Number | optional |
| `dateRange` | Object | optional `{field, from, to}` |
