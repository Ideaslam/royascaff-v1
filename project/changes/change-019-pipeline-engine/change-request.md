# Change Request

## Metadata
- **date**: 2026-07-02
- **change-type**: new-feature
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: high
- **status**: ✅ implemented — 2026-07-02

## Scope
- Module(s): new `pipelines` module
- Feature(s): generic pipeline engine + pipeline-type & step registries
- Endpoint(s): none now (internal engine)
- Service(s): `PipelineEngine`, `PipelineTypeRegistry`, `StepRegistry`, `PipelineRunRepository`

## Description
Build the **generic pipeline engine** that runs ordered, editable **steps** — each step is **AI-based or programmatic** (A6). This is the reusable execution core for ingestion cleaning and (via change-020) dashboard operations.

Desired behavior:
- **Step contract**: `id`, `type`, `config`, `position` (pre-load | post-load | standalone), `enabled`; `run(context) -> context`. A step may be **programmatic** (e.g. `type-cast`, `dedupe`, `trim`, `apply-mapping`, `build-aggregates`) or **AI-based** (e.g. `profile-data`, `clean-data` where AI generates a cleaning transform). AI steps resolve an **AI provider (change-016)** and a **prompt template key (change-017)**.
- **OLAP-engine awareness (change-014):** steps never emit raw dialect SQL directly. They operate through the **`OlapEngine` strategy** (staging/query/aggregate ops) using the **neutral query spec**; where a step must generate free-form SQL (advanced `clean-data`), it passes the workspace's `dialect` context to the prompt (change-017) so the output matches the active engine (ClickHouse or BigQuery).
- **Step registry**: steps self-register by type; engine resolves + executes in order.
- **Pipeline** = ordered list of step instances + a **pipeline type**. **Pipeline-type registry** holds named types, initially: `ingest` (extract → stage → [steps] → load → post-load aggregates/filters). Types are data/config-driven and **editable/reorderable**.
- Steps operate against an OLAP **staging table** (change-014, ClickHouse or BigQuery) and can act **before or after** load.
- **PipelineRun** records execution: per-step status, timings, inputs/outputs summary, errors — linked from `SyncRun`.
- The `DataSyncProcessor` (change-018) invokes `PipelineEngine.run('ingest', dataset, context)` instead of a hardcoded extract→load.

Out of scope: dashboard-operation pipeline types (change-020), concrete connectors (Phase C), filter store internals (change-021 — provides the `build-filters` step it registers).

## Acceptance Criteria
1. A step interface exists; both a programmatic step and an AI-based step can be implemented and registered.
2. A step registry resolves steps by type; the engine runs an ordered, enabled subset and threads a shared context.
3. AI steps resolve provider (003) and prompt (004) by key; a `clean-data` step can generate + apply a cleaning transform on the staging table via the OLAP strategy, correct for the workspace's active engine (ClickHouse or BigQuery).
4. The `ingest` pipeline type runs end-to-end: stage → steps → load → post-load, recording a `PipelineRun` with per-step status/timings.
5. Steps can be added, removed, and reordered via configuration without engine code changes.
6. `DataSyncProcessor` runs syncs through the engine (replacing any pass-through from change-018) with no regression.

## Notes (optional)
- Depends on: 014 (staging/load), 015 (dataset), 016 (AI provider), 017 (prompts), 018 (processor).
- Extensibility (A11): new step = implement + register; new pipeline type = define steps + register.
- Reference: `Phases.md` A6, B17, Extensibility Contract.
