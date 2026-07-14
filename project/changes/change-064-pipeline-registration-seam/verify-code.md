# Verify — change-064 (Pipeline registration seam / extensibility)  ✅ PASS

Behavior-neutral refactor: the neutral engine kernel now holds only registration/lookup mechanics;
all pipeline-type definitions and per-source ingest/wizard knowledge moved to the owning engines and
are added by registration.

## What was implemented
- **engine-core (kernel) trimmed to pure mechanics:**
  - `pipeline-type.registry.ts` — removed seeded types, `SOURCE_INGEST_OVERRIDES`, `NO_SCHEDULE_SOURCES`,
    `ENTITY_SELECTION_SOURCES`, `resolveIngestForSource`, `getSetupFlow`. Now: `register` / `resolve` /
    `has` / `setSteps` / `list` only. No source-type names, no seeded defs.
  - `pipeline.engine.ts` — removed the `pipelineType === 'ingest' && sourceType` special-case; runs
    `opts.steps ?? typeDef.steps`. Dropped `sourceType` from `RunPipelineOptions`, added `steps?`.
  - `pipeline.interface.ts` — added neutral `SourcePipelineProfile` / `SourceStepOverride` /
    `SourceWizardTraits`.
- **Connectors own their profile:** `ConnectorInterface.pipelineProfile?` (+ re-export of the neutral
  type). All 7 connectors declare a profile reproducing the prior maps 1:1:
  - `csv` → `{ wizard: { chooseConnection: false, oneShot: true } }`
  - `google_sheets` → `{}` (full default ingest + standard wizard)
  - `shopify` / `salla` / `zid` → `{ ingestOverrides: { 'apply-mapping': { enabled: false } }, wizard: { entitySelection: true } }`
  - `sql_server` / `mongodb_atlas` → `{ ingestOverrides: { 'apply-mapping': { enabled: false } } }`
- **Owning-engine registrars (bootstrap `onModuleInit`):**
  - `DataSourcePipelineService` (`modules/data/pipeline/`) — registers `ingest` (owns
    `DEFAULT_INGEST_STEPS`), plus `resolveIngestSteps()` + `getSetupFlow()` from connector profiles.
  - `DashboardPipelineRegistrar` (`modules/dashboards/pipeline/`) — registers `dashboard-generate` /
    `add-widget` / `edit-widget`.
- **Repointed callers:** `dataset.service.getSetupFlow` → `DataSourcePipelineService`;
  `data-sync.processor` passes `steps: resolveIngestSteps(sourceType)` (no more `sourceType` to engine).
  Providers wired in `DataModule` + `DashboardsModule`.

## Verification (scoped to changed areas)

- **AC #1 — kernel neutral:** `engine-core/` contains no source-type name and no seeded type;
  `PipelineTypeRegistry` = mechanics only; `PipelineEngine.run` has no ingest/sourceType branch and
  honors `opts.steps`. ✅ (grep: `resolveIngestForSource` / kernel `getSetupFlow` → only the new data
  service + controller delegate remain)
- **AC #2 — connector profiles present & exact:** `pipelineProfile` on all 7 connectors, 1:1 with the
  removed kernel maps. ✅
- **AC #3 — owning-engine registration at bootstrap:** clean boot logs:
  `PipelineTypeRegistry Pipeline type registered: ingest (9 steps)` (data engine) +
  `dashboard-generate (6)` / `add-widget (5)` / `edit-widget (4)` (reporting registrar). ✅
- **AC #4 — behavior-neutral:** ingest ran identically before/after (`Pipeline[ingest] done: 7 steps`
  for google_sheets — 7 enabled of 9); `ingest` registers 9 steps = `DEFAULT_INGEST_STEPS` length;
  setup-flow logic is a 1:1 port (choose-connection only when `chooseConnection`, select-entities only
  when `entitySelection`, `oneShot` → "Confirm & Sync"), reproducing prior output for all 7 sources.
  dashboard-generate / add-widget / edit-widget step lists unchanged. ✅
- **AC #5 — build + boundaries:** `nest build` → exit 0. `no-restricted-imports` (change-063 boundary
  rules) on `engine-core` + `connectors` + new pipeline dirs → **0** violations (connectors→engine-core
  is allowed; kernel imports neither modules nor integrations). App boots: `Nest application
  successfully started` on port 3000. ✅
- **Code layering:** engine kernel untouched by feature knowledge; each engine owns its pipeline
  definitions; delegation only (controllers → services). ✅

## Notes / not in scope
- `dashboard-from-template` drift (documented, absent in code) intentionally excluded (tracked in
  open items). Pre-existing prettier/type-lint noise in `zid.connector.ts` is unrelated (not
  `no-restricted-imports`) and left untouched.
- No API/DTO/queue/collection/migration changes; frontend/admin unaffected (setup-flow payload
  identical).

## Status: **PASS** — pipeline architecture is register-only extensible; kernel neutral; behavior identical; build + boot green.
