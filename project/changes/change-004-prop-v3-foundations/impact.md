# Impact Analysis — REQ-PROP-V3 Phase 0 Foundations

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Redis / queue infra | partial | `infrastructure/cache/providers/redis/redis-cache.service.ts`; Mongo queue `mongodb-queue.gateway.ts` + `jobs.service.ts` | Redis cache-only; no BullMQ; legacy Mongo poller must stay |
| Schema (v3) | none | — (v2 AJV under `creative-pipeline/schemas/` + `validate/ajv.ts`) | Need `dna.v2`, `map.v1`, section slot library |
| Collections | none | Pattern: `persistence/providers/mongodb/mongodb-*.repository.ts` | No `projects`, `templates`, `pipelineTraces` |
| PipelineTraceService | none | Closest: embedded `creativePipeline` on ai-jobs | New module + Mongo truth for AI I/O/cost |
| PdfRenderService | none | `Dockerfile.build` = `node:22-alpine` | No puppeteer/Chromium/Arabic fonts |
| Prompt packs | partial | `creative-pipeline/prompts/` + `promptLoader.ts` | v2 only; need v3 analyze/map/section skeleton + model-by-request-type helper |
| Permissions | partial | `scripts/config-seed-data.js` (+ admin seed) | Missing `projects:*`, `pipeline-traces:read`; map “sales-lead” → existing `sales_manager` |
| Endpoints (Phase 0) | none | — | Thin scaffold optional; full CRUD in later packs |
| Pages | none | — | Deferred to parts 6–7 (FE packs) |
| Legacy creative v2 | complete | `creative-pipeline/*`, `modules/ai-jobs`, `modules/jobs` | Must remain unchanged |

**Feature state:** none (foundations absent; patterns to reuse are complete)

**Plan-vs-code drift (main):** Blueprint documents Pipeline v2 + Mongo job queue; Redis “cache only.” Phase 0 adds BullMQ alongside — main plan updates only at merge.

## Affected Modules

- **Creative / AI Generation** — additive Pipeline v3 infra (BullMQ, schemas, prompt skeleton); do not modify v2 orchestrator behavior
- **Integrations / Infrastructure** — Redis dual-use (cache + BullMQ); Docker/Chromium for PDF
- **Permissions / Roles** — seed new keys; assign to `admin` + `sales_manager`
- **NEW: Projects** — collection + repository (HTTP thin/deferred)
- **NEW: Templates** — collection + repository (catalog later)
- **NEW: Pipeline Traces** — collection + `PipelineTraceService` (+ optional read API scaffold)
- **NEW: PDF** — `PdfRenderService` smoke path

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — add Projects, Templates, Pipeline Traces, PDF; extend Creative/AI
- [ ] `blueprint/plan/data-model.md` — `projects`, `templates`, `pipelineTraces` (+ generation checkpoint fields stub if needed)
- [ ] `blueprint/actions/api/services/pipeline-v3-foundations.md` — BullMQ, repos, PipelineTraceService, PdfRenderService, schemas, prompt skeleton, model resolver
- [ ] `blueprint/actions/api/endpoints/pipeline-traces.md` — optional thin read endpoints (or deferred note if HTTP deferred to later pack)
- [ ] `blueprint/actions/api/services/permissions.md` (delta) — new permission keys / role grants
- [ ] `blueprint/_index.md` + update pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.
> No web page blueprints in this pack.

## Code impact (likely create / modify)

### Create (`roya-sales-ai-api-v2`)

| Area | Likely paths |
|------|----------------|
| BullMQ | `src/infrastructure/queue/` (or `src/pipeline-v3/queue/`) — connection, queue names, worker shell, no-op health job |
| Pipeline v3 root | `src/pipeline-v3/` — `schemas/`, `prompts/`, `pdf/`, `tracing/`, model-resolver helper |
| Persistence | contracts + `mongodb-projects|templates|pipeline-traces.repository.ts`; tokens |
| Nest modules | `PipelineV3Module` / `PipelineTraceModule` (and optional thin controllers) |
| Fixture | minimal HTML for PDF smoke test |

### Modify

| File | Change |
|------|--------|
| `package.json` | `bullmq`, puppeteer or `@sparticuz/chromium` + deps |
| `Dockerfile.build` | Chromium + Arabic fonts (may leave Alpine or switch base) |
| `persistence.module.ts`, `persistence.tokens.ts`, tenant collection list | register 3 collections |
| `app.module.ts` | import new module(s) |
| `scripts/config-seed-data.js` | `projects.*` / `pipeline-traces.read` + role `permissionIds` |
| `environment.ts` | optional BullMQ/PDF env knobs |
| `.env.example` if present / notes | Redis persistence ops note |

### Do not touch (this pack)

- `creativePipelineOrchestrator`, Mongo `JobsService` poller behavior, FE apps

## Risk

| Factor | Level | Notes |
|--------|:-----:|-------|
| Complexity | **H** | New queue + PDF runtime + 3 collections; still “foundations only” |
| Cross-module | **Y** | Persistence, seed, Docker, AppModule, AI infra |
| Migration | **N** | No data backfill in Phase 0; additive only |
| Ops | **M** | Redis persistence required for durable BullMQ; Docker image size ↑ |

## Recommendation

- **Create**: BullMQ shell, 3 repos/collections, PipelineTraceService, PdfRenderService, v3 schema + prompt skeletons, model-by-request-type helper, permission seeds
- **Complete**: — (nothing partial for v3)
- **Modify**: persistence wiring, AppModule, Dockerfile, seed script, package deps
- **Ripple**: none to FE; legacy AI jobs unchanged
- **Verdict**: Create new Pipeline v3 foundation layer alongside v2

## Status target (pack artifacts after implement)

| Artifact | Target |
|----------|--------|
| SVC-PIPE-V3-01 BullMQ queues + worker shell | done |
| SVC-PIPE-V3-02 projects / templates / pipelineTraces repos | done |
| SVC-PIPE-V3-03 PipelineTraceService | done |
| SVC-PIPE-V3-04 JSON schemas (dna.v2, map.v1, slots) | done |
| SVC-PIPE-V3-05 Prompt pack skeleton + model resolver | done |
| SVC-PIPE-V3-06 PdfRenderService smoke | done |
| PERMS projects:* + pipeline-traces:read seed | done |
| EP-TRACES-* thin read API | deferred or partial — only if needed to exercise service; full surface in later packs |
| Web pages | deferred (parts 6–7) |

## Dependencies

- **depends-on:** — (none)
- **blocks:** planned `change-005` (Phase 1 templates)
- **Priority:** high vs REQ-R packs 001–003 (scheduling only; no hard block)

## Notes from recon

- Role name in product language “sales-lead” maps to existing seed role **`sales_manager`** (grant `pipeline-traces:read` there + `admin`).
- Permission key style in seed today is dotted (`proposal.*`); align new keys to codebase convention (`projects.*` / `pipeline-traces.read` or nested catalog matching seed structure) in blueprint — keep semantic match to change-request.
- v2 AJV + promptLoader are the reference implementations to mirror, not replace.
