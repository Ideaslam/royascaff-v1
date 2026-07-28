# Modules & Features — Delta (REQ-PROP-V3 Phase 0)

## Delta

- **Add** modules: Projects, Templates, Pipeline Traces, PDF Export
- **Extend** Creative / AI Generation with Pipeline v3 foundations (BullMQ + contracts) alongside v2
- **Extend** Permissions seed with `projects.*` and `pipeline-traces.read`

---

## 8. Projects _(new)_
- Scope: BE `src/pipeline-v3` + persistence `projects` (HTTP CRUD in later packs)
- Audience: sales roles with `projects.*`
- Entities: `projects`
- Depends on: Clients, Services Catalog, Integrations (S3 — later for RFP/images)

### Features
1. **Project container (data layer)** [backend-only] — persist project info, services snapshot, financials, RFP/images stubs, DNA placeholder; no generation UI yet

## 9. Templates _(new)_
- Scope: BE templates collection + disk asset path convention `templates/<key>/v<version>/`
- Audience: system / later gallery
- Entities: `templates`
- Depends on: —

### Features
1. **Template catalog document (data layer)** [backend-only] — store metadata for `pitch-landscape` shell; full section defs + Handlebars in Phase 1

## 10. Pipeline Traces _(new)_
- Scope: BE `PipelineTraceModule` + `pipelineTraces` + thin GET endpoints
- Audience: `admin` + `sales_manager` (`pipeline-traces.read`)
- Entities: `pipelineTraces`
- Depends on: Projects, Proposals (ids optional until generation exists)

### Features
1. **AI call / action tracing** [backend-only] — write full parsed I/O, tokens, cost; list/get by workspace
2. **Cost util** [backend-only] — `computeCost(model, usage)` from pricing table

## 11. PDF Export _(new)_
- Scope: BE `PdfRenderService` + Docker Chromium/fonts
- Audience: internal (called by assemble/export later)
- Entities: —
- Depends on: —

### Features
1. **HTML → PDF smoke render** [backend-only] — Puppeteer with Arabic fonts; fixture HTML only in Phase 0

## 6. Creative / AI Generation _(extend)_
- Scope: additive `src/pipeline-v3/` + BullMQ; **do not change** v2 orchestrator / Mongo poller
- Entities: queues (Redis work) + Mongo truth later on `proposals.generation`

### Features _(Phase 0 only)_
1. **BullMQ pipeline queues** [backend-only] — `pipeline.analyze|map|section|assemble|export` + idempotent no-op/health worker
2. **JSON Schema contracts** [backend-only] — `dna.v2`, `map.v1`, section slot library (AJV loadable)
3. **Prompt pack skeleton** [backend-only] — §9.3 file layout + model-by-request-type resolver
4. **Creative Pipeline v2** [both] — unchanged; remains default until cutover
