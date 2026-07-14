# Verification — Isolate Engines, Phase 1: neutral engine-core kernel (change-060)

## Plan Consistency (pre-build)
- [x] Master blueprint written — `isolation-architecture.md` (principles, as-is/to-be, contracts, 5-phase plan)
- [x] Phase 1 scope confirmed at code gate — minimal move; in-`src` placement (Dockerfile copies only `src/`)
- [x] Behavior-neutral intent — no route/DTO/queue/collection changes
- [x] Recon findings reflected — neutral core has no data/dashboards imports; persistence via seam

## Code Verification (post-build)

### Engine-core library (`src/engine-core/`)
- [x] `pipeline.interface.ts` — generic `PipelineContext<TDataset,TConnection>`, `mode: string`, `PipelineTargetLike`; no data imports
- [x] `pipeline.engine.ts` — generic `RunPipelineOptions`; reads id/table structurally or via explicit opts; persists via `PIPELINE_RUN_STORE`
- [x] `step.registry.ts`, `pipeline-type.registry.ts` — relocated; registry mechanics neutral (seeded defs kept, migrate in phases 2–3)
- [x] `pipeline-run-store.ts` — `PipelineRunStore` interface + `PIPELINE_RUN_STORE` token (persistence seam)
- [x] `tenant-context.ts` — `TenantContext` contract + `TENANT_CONTEXT` token (defined; adoption deferred)
- [x] `queue-registry.ts` — `QueueRegistry` seam + `QUEUE_REGISTRY` token (defined; adoption deferred)
- [x] `engine-core.module.ts` — provides/exports `StepRegistry` + `PipelineTypeRegistry`
- [x] `index.ts` — public barrel
- [x] **No imports from `modules/data` or `modules/dashboards`** in `src/engine-core/` (RULE-ARCH-002)

### Wiring / consumers
- [x] `pipelines.module.ts` — imports `EngineCoreModule`, provides `PipelineEngine`, binds `{ provide: PIPELINE_RUN_STORE, useExisting: PipelineRunRepository }`, re-exports kernel
- [x] Shims `modules/pipelines/step.registry.ts` + `pipeline.interface.ts` re-export kernel; specialize context with `DatasetDocument`/`DataConnectionDocument`/`SyncRunMode` (step files untouched)
- [x] Repointed: `data-sync.processor`, `dataset.service`, `dashboards.service`, `dashboard-generation.processor` → `src/engine-core`
- [x] Deleted moved files: `modules/pipelines/pipeline.engine.ts`, `pipeline-type.registry.ts`

### Behavior neutrality
- [x] No endpoint/DTO/route changes
- [x] No queue name / BullMQ changes
- [x] No schema/collection changes (still `ws_{slug}_pipeline_runs` via bound repo)
- [x] Pipeline step call sites unchanged (same args to `PipelineEngine.run`)

### Acceptance criteria (from change-request)
1. [x] `src/engine-core/` isolated library; no data/dashboards imports
2. [x] Kernel + `TenantContext` + queue + `PIPELINE_RUN_STORE` seams present
3. [x] Importers resolve kernel from `src/engine-core` (step packs via shims)
4. [x] App boots; behavior identical; `nest build` clean; `dist/main.js` + assets emitted
5. [x] `isolation-architecture.md` documents full multi-phase plan
6. [x] Planning docs updated (profile, modules, rules, pipelines, _index)
7. [x] `libs/` + `@roya` alias + Docker/build changes explicitly deferred to Phase 4

### Builds & boot
- [x] `npm run build` (nest build) — PASS, zero errors
- [x] `dist/main.js` present; AI prompt + widget-catalog assets present in `dist/`
- [x] `node dist/main` boots: `EngineCoreModule` initialized; 4 pipeline types + 20 steps registered; `Nest application successfully started` (Mongo connected, OLAP + widget seeds ran)
- [x] Lint: no linter errors on changed files

### Lint / type
- [x] `ReadLints` clean on `src/engine-core/*` + all edited module files

## Deferred / notes
- **Phase 4** will relocate `src/engine-core` → `libs/engine-core` + add `@roya/*` alias + thin `apps/api` + update `Dockerfile.build` (currently copies only `src/`) and the build pipeline.
- `TenantContext` + `QueueRegistry` are contracts only in Phase 1; adopted incrementally in phases 2–4.
- Seeded ingest/dashboard pipeline-type definitions remain in the (now-core) registry; they migrate to their owning engines in phases 2–3.
- Runtime smoke exercised boot + step/type registration; a full end-to-end sync + dashboard generation run against live data was not executed (no separate manual run) — startup registration verified identical.

## Overall: PASS
