# Impact Analysis — Pipeline Engine

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| `PipelineStepInterface` | none | — | No step abstraction |
| `StepRegistry` | none | — | No registry |
| `PipelineTypeRegistry` | none | — | No named pipeline types |
| `PipelineEngine` | none | — | No engine to orchestrate steps |
| `PipelineRun` schema | none | — | No execution record |
| `PipelineRunRepository` | none | — | Does not exist |
| Built-in steps (extract, load, trim, etc.) | none | — | All greenfield |
| AI-based step (`clean-data`) | none | — | No step pattern for AI-driven transforms |
| `DataSyncProcessor` pipeline call | stub | `data-sync.processor.ts` | Pass-through extract→load logic; must delegate to `PipelineEngine` |
| `PipelinesModule` | none | — | Module does not exist |

**Existing code affected:**

| Code | Why it matters |
|------|----------------|
| `data-sync.processor.ts` | Replace pass-through logic with `PipelineEngine.run('ingest', …)` |
| `data.module.ts` | Must import `PipelinesModule` |

Feature state: **fully greenfield**

---

## Affected Modules

- **`src/modules/pipelines/`** (new) — interfaces, registries, engine, step implementations, `PipelineRun` schema/repo, `PipelinesModule`
- **`src/modules/data/processors/data-sync.processor.ts`** (modify) — delegate to `PipelineEngine`
- **`src/modules/data/data.module.ts`** (modify) — import `PipelinesModule`

---

## Plan Docs to Update

- [x] `project/plan/modules.md` — add Pipelines module entry

---

## Files Created

```
src/modules/pipelines/pipeline.interface.ts          # PipelineStepInterface, PipelineContext, StepResult, PipelineStepConfig, PipelineTypeDefinition
src/modules/pipelines/step.registry.ts
src/modules/pipelines/pipeline-type.registry.ts      # registers 'ingest' pipeline type by default
src/modules/pipelines/pipeline.engine.ts
src/modules/pipelines/repositories/pipeline-run.repository.ts
src/modules/pipelines/schemas/pipeline-run.schema.ts
src/modules/pipelines/pipelines.module.ts
src/modules/pipelines/steps/extract.step.ts
src/modules/pipelines/steps/apply-mapping.step.ts
src/modules/pipelines/steps/transform.steps.ts       # TrimStep + TypeCastStep + DedupeStep
src/modules/pipelines/steps/load.step.ts
src/modules/pipelines/steps/clean-data.step.ts       # AI-based
src/modules/pipelines/steps/build-aggregates.step.ts
```

## Files Modified

```
src/modules/data/processors/data-sync.processor.ts  # → PipelineEngine.run('ingest', …)
src/modules/data/data.module.ts                     # +PipelinesModule import
```

---

## Risk

- **Complexity: H** — eight step types, two registries, an engine, and a run-record schema all introduced together; each step has distinct concerns.
- **Cross-module: Y** — `data` module modified; global `ConnectorsModule`, `AiModule`, `AnalyticsStoreModule` consumed.
- **Migration: N** — `DataSyncProcessor` refactor replaces stub code; no existing production data pipeline.
- **External: N** — only internal services used.

---

## Recommendation

### Implementation order within this CR
1. Define `PipelineStepInterface` + `PipelineContext` + `StepResult` + `PipelineStepConfig`.
2. Create `StepRegistry` + `PipelineTypeRegistry` (with default `ingest` type).
3. Create `PipelineRun` schema + repository.
4. Create `PipelineEngine`.
5. Implement built-in data-sync steps in order: `ExtractStep` → `ApplyMappingStep` → `TrimStep` / `TypeCastStep` / `DedupeStep` → `LoadStep`.
6. Implement AI-based `CleanDataStep` + `BuildAggregatesStep`.
7. Create `PipelinesModule` registering all steps + services.
8. Update `DataSyncProcessor` + `data.module.ts`.
