# Change Request

## Metadata
- **date**: 2026-07-14
- **change-type**: refactor
- **target-app**: backend-only
- **affected-repos**: backend
- **priority**: medium

## Scope
- Module(s): `engine-core` (kernel), `integrations/connectors`, `modules/data`, `modules/dashboards`
- Feature(s): none new — pipeline **extensibility seam** (registration-driven)
- Endpoint(s): none (behavior-neutral; `GET /data/sources/setup-flow/:type` output unchanged)
- Service(s): trim `PipelineTypeRegistry` + `PipelineEngine`; add data-source & dashboard pipeline registrars

## Description

**Goal:** make the pipeline architecture *clean and extensible by registration* so that adding a new
**data source type** or a new **dashboard/pipeline feature** never requires editing the neutral engine
kernel. This completes the extensibility outcome designed in `isolation-architecture.md` §8 and removes
the "feature knowledge in the kernel" flagged by the change-060 note.

### Problem (today)
The neutral kernel `src/engine-core/pipeline-type.registry.ts` still hardcodes **feature knowledge**:
- Per-source ingest deltas `SOURCE_INGEST_OVERRIDES` and wizard traits `NO_SCHEDULE_SOURCES` /
  `ENTITY_SELECTION_SOURCES` (name specific sources: `csv`, `shopify`, `salla`, `zid`, `sql_server`,
  `mongodb_atlas`).
- All pipeline **type definitions** (`ingest`, `dashboard-generate`, `add-widget`, `edit-widget`)
  seeded in the registry constructor.
- `PipelineEngine.run` special-cases `pipelineType === 'ingest' && sourceType` to resolve per-source
  steps.

Consequence: **adding a new data source type or pipeline type forces edits to the neutral kernel** —
violating the neutral-kernel boundary (locked by change-063 ESLint) and the "extensible by
registration" principle. (Adding a *step* is already clean.)

### Desired behavior (after)
- **Kernel = pure mechanics.** `PipelineTypeRegistry` keeps only `register` / `resolve` / `list` /
  `setSteps` / `has`. `PipelineEngine.run` runs `opts.steps ?? typeDef.steps` — no source special-case.
  No source names, no seeded types, no wizard tables in `engine-core`.
- **Each data source owns its pipeline profile.** `ConnectorInterface` gains an optional
  `pipelineProfile` (ingest step overrides + wizard traits). Adding a source = one connector file.
- **Owning engines register their pipeline types at bootstrap:**
  - data-source engine (`modules/data`) registers the `ingest` type and resolves per-source ingest
    steps + setup flow from connector profiles.
  - reporting engine (`modules/dashboards`) registers `dashboard-generate` / `add-widget` /
    `edit-widget`.
- **A new ingest step added to the default ingest pipeline still applies to every source
  automatically** (it already does — this change preserves and clarifies that).

### Who is affected
Backend only. No API contract, DTO, queue, collection, or user-facing behavior changes.
Frontend/admin unaffected (`setup-flow` payload identical).

### Out of scope
- `dashboard-from-template` pipeline drift (documented, absent in code) — tracked separately.
- Physical `libs/` monorepo move (blueprint Phase 4, deferred).
- Delivery adapters / MCP (blueprint Phase 5).

## Acceptance Criteria
1. `src/engine-core/` contains **no source-type names** and **no seeded pipeline-type definitions**;
   `PipelineTypeRegistry` exposes only registration/lookup mechanics; `PipelineEngine.run` has no
   `ingest`/`sourceType` special-case and honors an optional `steps` override.
2. `ConnectorInterface.pipelineProfile` exists (neutral type in `engine-core`), and all 7 connectors
   (`csv`, `google_sheets`, `shopify`, `salla`, `zid`, `sql_server`, `mongodb_atlas`) declare a profile
   that reproduces the current per-source overrides + wizard traits **exactly**.
3. The `ingest` pipeline type + per-source resolution + `getSetupFlow` are owned by a data-source
   engine service; the three dashboard pipeline types are registered by a reporting-side registrar; all
   register at bootstrap.
4. Behavior-neutral: `GET .../setup-flow/:type` returns identical flows for all 7 sources; ingest,
   dashboard-generate, add-widget, edit-widget run identically; app boots and all steps/types register.
5. `nest build` exits 0; ESLint boundary rules (change-063) still report **0** violations (kernel stays
   neutral).
6. Planning docs updated in place (`actions/backend/services/pipelines.md`, `profile.md`,
   `rules.md` as needed); `verify-code.md` = PASS; `change-log.md` row appended.

## Notes
- Connectors importing `engine-core` types is allowed by the change-063 boundary rules (only
  `**/modules/**` is restricted for connectors); the kernel never imports connectors/modules.
- Registration ordering is safe: all registrars run in `onModuleInit` during bootstrap, before any
  pipeline is resolved at runtime (jobs/API calls).
