# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: modify-feature
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Dashboards, `pipelines`
- Feature(s): dashboard operations as pipelines; multi-datasource dashboards
- Endpoint(s): existing dashboard generate/update/add-widget routes (behavior refactored)
- Service(s): `DashboardsService` (refactor), new pipeline types

## Description
Express **dashboard operations as pipeline types** instead of one-shot AI calls (A6), and make dashboard generation consume **multiple datasets** (A9).

Desired behavior:
- Register pipeline types on the engine (change-006):
  - `dashboard-generate`: datasets → widget definitions (today's main flow, now a sequence of steps: gather dataset schemas/mappings → select widgets → build query definitions → build filters (hook to change-008)).
  - `add-widget`: existing dashboard + request → new widget (sequential steps, not a single prompt).
  - `edit-widget`: existing widget + request → updated widget.
- **Multi-datasource**: generation and query building read **all datasets linked to the dashboard** (via the M:N from change-002), across sources, using canonical views where semantic flags match.
- Widget `queryDefinition` is stored as the **dialect-neutral query spec** and executed via the analytics-store (change-001), which compiles it to the workspace's active engine (**ClickHouse or BigQuery**); filters inject into the spec, not raw SQL.
- Redis result-cache (change-001) is used for widget data; invalidation hooks to sync completion.

Out of scope: filter-value computation internals (change-008 — this consumes its `build-filters` step/API), connectors (Phase C).

## Acceptance Criteria
1. `dashboard-generate`, `add-widget`, and `edit-widget` run as registered pipeline types with per-step `PipelineRun` records.
2. A dashboard built from **≥ 2 datasets** (including different sources) generates widgets spanning them.
3. Widget `queryDefinition` (neutral spec) executes on the workspace's active OLAP engine (ClickHouse or BigQuery) and returns data; dashboard filters apply to the spec.
4. Add-widget and edit-widget operate via pipelines and produce valid widgets without a full regenerate.
5. Widget results are cached in Redis and invalidated when a contributing dataset re-syncs.
6. Existing dashboard behavior (generate, view, export, share) works end-to-end on the new path (no functional regression).

## Notes (optional)
- Depends on: 001, 002, 003, 004, 006, and 008 (filters) for the build-filters step.
- Preserves today's multi-file dashboard capability, generalized to datasets.
- Reference: `Phases.md` A6, A9, B20, B22.
