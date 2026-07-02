# Change Request

## Metadata
- **date**: 2026-07-02
- **status**: implemented
- **change-type**: new-feature
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: medium

## Scope
- Module(s): `pipelines` (build-filters step), Dashboards (filter reads), `analytics-store`
- Feature(s): query-backed filter values with cardinality guard
- Endpoint(s): filter-values read endpoint(s) for the dashboard
- Service(s): `FilterValuesService`, `build-filters` pipeline step

## Description
Make dashboard filters **query-backed** rather than sample-based (A10), while avoiding two anti-patterns: computing distinct values for every column, and recomputing on every dashboard open.

Desired behavior:
- When the AI selects a column as a **filter** (during `dashboard-generate`, change-020), a **`build-filters` step** computes distinct values **only for those columns**.
- Storage: a `dataset_filter_values(datasetId, column, value, count)` table in the workspace's OLAP engine (change-014, ClickHouse or BigQuery) as source of truth; small lists cached in Redis/Mongo for instant dashboard open.
- **Cardinality guard**: if distinct count ≤ threshold (e.g. 1000) → store the full list (`mode = list`); if above → **do not** store the full list, mark `mode = search` and serve values on demand via the OLAP strategy's `searchValues` (typeahead) — compiled to `LIKE + LIMIT` per engine.
- Refresh: recompute affected filter values **on sync completion** (incremental where possible), not on dashboard open.
- Dashboard read path returns filter options from the store (list mode) or exposes a search endpoint (search mode).

Out of scope: the widget query itself (change-020), sync scheduling (change-029).

## Acceptance Criteria
1. Distinct values are computed **only** for AI-selected filter columns, at generate time and on sync completion.
2. Values persist in `dataset_filter_values` in the active OLAP engine (ClickHouse or BigQuery) with a Redis/Mongo cache for fast reads.
3. Cardinality guard: columns ≤ threshold store a full list; columns above threshold use `search` mode (no full list stored).
4. `search` mode serves typeahead results via the OLAP strategy `searchValues` (compiled to `LIKE + LIMIT` per engine) on demand.
5. Opening a dashboard reads filter options from the store/cache without recomputing distinct values.
6. A dataset re-sync refreshes its filter values without a full dashboard regenerate.

## Notes (optional)
- Depends on: 014 (OLAP strategy), 015 (dataset), 019 (step registry), 020 (filter selection during generate).
- Threshold is configurable; default ~1000 distinct.
- Reference: `Phases.md` A10, B21.
