# Impact Analysis — Pipeline Registration Seam (extensibility)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Kernel — engine | complete | `engine-core/pipeline.engine.ts` | `run()` special-cases `ingest`+`sourceType` (feature leak) |
| Kernel — type registry | complete | `engine-core/pipeline-type.registry.ts` | hardcodes source names, wizard tables, seeded type defs (feature leak) |
| Kernel — step registry | complete | `engine-core/step.registry.ts` | already neutral (steps self-register) — no change |
| Kernel — interfaces | complete | `engine-core/pipeline.interface.ts` | needs neutral `SourcePipelineProfile` type + optional `steps` on run opts |
| Connector SPI | complete | `integrations/connectors/connector.interface.ts` + 7 connectors | no per-source `pipelineProfile` yet |
| Ingest trigger | complete | `modules/data/processors/data-sync.processor.ts:118` | passes `sourceType`; must pass resolved `steps` |
| Setup flow | complete | `modules/data/services/dataset.service.ts:97` | delegates to kernel `getSetupFlow` (to be moved) |
| Dashboard triggers | complete | `dashboards.service.ts:501/560`, `ai-processing/.../dashboard-generation.processor.ts:44` | rely on kernel-seeded types |

Feature state: **complete** (behavior-neutral refactor of an existing, working pipeline system).

## Affected Modules
- **engine-core** — trim `PipelineTypeRegistry` (drop seeds + source/wizard tables + `resolveIngestForSource`/`getSetupFlow`); trim `PipelineEngine.run` (drop `ingest`/`sourceType` branch, add optional `steps`); add neutral `SourcePipelineProfile` types + optional `steps` field.
- **integrations/connectors** — add `pipelineProfile?` to `ConnectorInterface`; declare it on all 7 connectors (behavior-neutral mapping of current overrides/traits). *(connectors may import `engine-core` — allowed by change-063 rules.)*
- **modules/data** (data-source engine) — new `DataSourcePipelineService`: `onModuleInit` registers `ingest` type (owns `DEFAULT_INGEST_STEPS`), `resolveIngestSteps(sourceType)` + `getSetupFlow(sourceType)` from connector profiles; provide in `DataModule`; repoint `dataset.service.getSetupFlow` + `data-sync.processor`.
- **modules/dashboards** (reporting engine) — new `DashboardPipelineRegistrar`: `onModuleInit` registers `dashboard-generate` / `add-widget` / `edit-widget` (owns those step lists); provide in `DashboardsModule`.

## Plan Docs to Update
- [x] `project/actions/backend/services/pipelines.md` — relocate ownership notes: kernel = mechanics only; ingest type + per-source resolution owned by data-source engine (connector `pipelineProfile`); dashboard types owned by reporting registrar. Update the change-060 note + registered-types table.
- [x] `project/profile.md` — extend the engine-isolation note: extensibility seam (register-only for new source types + pipeline types; kernel neutral of feature knowledge).
- [ ] `project/rules.md` — add/confirm the extension recipe rule ("new source/pipeline type = register, never edit engine-core") if not already covered.
- [ ] `data-model.md` — no change. `endpoints/` — no change (setup-flow output identical).

## Ripple / callers (all repointed, none broken)
- `PipelineEngine.run` callers: `data-sync.processor` (ingest → pass `steps`), `dashboards.service` (add/edit-widget), `ai-processing/dashboard-generation.processor` (dashboard-generate). Type keys unchanged → dashboard callers need no change once registrars run.
- `resolveIngestForSource` — only caller is the engine (removed). `getSetupFlow` — only caller `dataset.service` (repointed). `setSteps` — no external callers (kept as mechanics).

## Risk: complexity **M**, cross-module **Y** (kernel + connectors + data + dashboards), migration **N**
- Main risk: registration **ordering** — mitigated (all registrars run at bootstrap `onModuleInit`, before any runtime resolve).
- Second risk: behavior drift in per-source flows — mitigated by exact 1:1 mapping of existing overrides/traits into connector profiles + setup-flow parity check for all 7 sources.

## Recommendation
- **Modify**: `engine-core` (kernel trim + neutral profile type), `ConnectorInterface` + 7 connectors, `dataset.service`, `data-sync.processor`.
- **Create**: `DataSourcePipelineService` (data-source engine), `DashboardPipelineRegistrar` (reporting engine).
- **Guard**: keep change-063 ESLint green (kernel stays free of `modules/**` + `integrations/**`).
