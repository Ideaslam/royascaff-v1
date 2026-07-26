# Impact Analysis — change-007-prop-v3-sections-engine

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Queue / workers | partial | `pipeline-v3/queue/pipeline-queue.service.ts` | section/assemble/export only acknowledge; no FlowProducer; map does not enqueue sections |
| Analyze / Map | complete | `pipeline-v3/analyze/*`, `map/*` | stop at `mapped` |
| Template render | partial | `templates/template-render.service.ts` | no assemble orchestration, financial inject, overflow shrink |
| PDF | partial | `pdf/pdf-render.service.ts` | used by fixture; not production assemble path |
| Schemas / slots | partial | `schemas/*`, catalog `contentSchema` | no runtime AJV of per-section contentSchema; no richness gate |
| Prompts | partial | `prompts/section._example.v1.md` | placeholder only; need real section + research presentation packs |
| Proposal fields | partial | `projects.data.service` / map orchestrator | has `sectionMap` + `generation` (dna/map); missing `sections[]`, `renderedByLang`, Phase 3 statuses |
| Status API | partial | `proposals-data.controller` `:id/status` | no section/assemble/export progress |
| Retry API | none | — | need section retry |
| Feature flag | none | settings whitelist | need `pipelineV3Enabled` (or equiv.) + gate create/enqueue |
| Reconciler | none | — | model on `jobs.service` setInterval 60s |
| FE | none | — | out of scope |

**Feature state:** none (Phase 3 engine) — foundations through map are complete.

## Affected Modules
- Creative / AI Generation (Pipeline v3) — Steps 3–5 workers + engine
- Proposals — `sections`, `renderedByLang`, generation status, retry + status endpoints
- Templates — consume full contentSchema + Handlebars assemble
- Settings — workspace feature flag
- Projects — gate create-from-project / enqueue when flag off (ripple)

## Pack blueprint files to create
- [ ] `blueprint/plan/modules.md` — Creative + Proposals Phase 3 after-state
- [ ] `blueprint/plan/data-model.md` — sections, renderedByLang, generation steps
- [ ] `blueprint/actions/api/services/pipeline-sections-engine.md` — SVC-PIPE-S3.. (section/assemble/export/reconciler/flag)
- [ ] `blueprint/actions/api/services/proposals.md` (delta) — retry / status extend
- [ ] `blueprint/actions/api/endpoints/proposals-pipeline.md` — status extend, retry, optional artifacts
- [ ] `blueprint/actions/api/services/settings.md` (delta) — feature flag key
- [ ] `blueprint/_index.md` + pack `status.md`

## Code impact (implement later)

**Create**
- `pipeline-v3/section/section-orchestrator.service.ts` (+ DNA slice helper, richness gate)
- `pipeline-v3/assemble/assemble.service.ts`
- `pipeline-v3/export/export.service.ts`
- `pipeline-v3/reconciler/pipeline-reconciler.service.ts`
- `pipeline-v3/prompts/section.*.md` (+ research presentation)
- Section retry handler (controller method)

**Modify**
- `pipeline-queue.service.ts` — FlowProducer / fan-in; dispatch section/assemble/export; extend `isStepAlreadyDone`; map→sections chain
- `map-orchestrator.service.ts` — enqueue section fan-out on success
- `projects.data.service.ts` — feature-flag gate; maybe start sections if already mapped (edge)
- `proposals-data.controller.ts` — extend status; `POST …/sections/retry`
- Settings schema/DTO whitelist — `pipelineV3Enabled`
- `pipeline-v3.module.ts` — register providers

## Ripple effects
- Dual path: flag off → legacy `/ai-jobs` unchanged; flag on → v3 create-from-project continues past map
- Tenant ALS already solved in workers — reuse
- Circular deps: keep new orchestrators in `PipelineV3Module`; ModuleRef pattern

## Risk
- **Complexity: H** (fan-in, partial failure semantics, overflow)
- **Cross-module: Y** (settings, proposals, projects, pipeline)
- **Migration: N** (additive fields; schema-less Mongo)

## Recommendation
- **Create**: section/assemble/export/reconciler + prompts + retry API + flag
- **Complete**: queue processors, status model, template assemble path
- **Modify**: map chain, settings whitelist, projects enqueue gate

## Status target (after implement)
- SVC section/assemble/export/reconciler → `done`
- Overflow / richness → `done` (or overflow `partial` if measure API thin)
- Vision 1b → still `deferred`/`partial` (not this pack)
- EP retry + status → `done`
- Feature flag → `done`

## Dependencies
- **depends-on**: change-006 — **merged** ✅
