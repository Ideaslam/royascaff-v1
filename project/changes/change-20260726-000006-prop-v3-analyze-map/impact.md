# Impact Analysis — REQ-PROP-V3 Phase 2 Analyze + Map

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Projects repo | partial | `mongodb-projects.repository.ts` | No HTTP/service |
| Projects endpoints | none | — | Full CRUD + RFP/images + dna |
| RFP parse | none | — | Need `pdf-parse` / `mammoth`; no multipart yet (app uses base64 today) |
| Image upload | none | S3 `uploadFile` reusable | New project images path |
| BullMQ analyze/map | partial | `pipeline-queue.service.ts` stubs | Real processors + `isStepAlreadyDone` |
| DNA/map schemas | complete | `schema-registry` dna.v2 / map.v1 | Depth gates beyond shape |
| Prompts | partial | `pipeline-v3/prompts/*` | Placeholders — need real Phase 2 copy |
| Claude sync | complete | `ai-provider.callClaude*`, SettingsService | Reuse (not Batches) |
| ModelResolver / Traces | complete | pipeline-v3 module exports | Wire into workers |
| Template abstract catalog | complete | `pitch-landscape.catalog.ts` | Feed map prompt |
| Proposal v3 fields | partial | schema-less repo OK | DTO whitelist strips unknowns; need server create + status EP |
| Status endpoint | none | — | generation poll |
| Pages | none | — | FE deferred |

**Feature state:** none (foundations + template ready; Phase 2 greenfield)

## Affected Modules

- **Projects** — HTTP + data service + RFP/images
- **Creative / AI Generation** — analyze + map workers, prompts, DNA/map services
- **Proposals** — additive `projectId`, `templateKey`, `sectionMap`, `generation`; status route
- **Pipeline Traces** — write on every AI call
- **Templates** — read abstract sections for map (no design change)

## Pack blueprint files to create

- [ ] `blueprint/plan/modules.md` — Projects + Creative Steps 1–2
- [ ] `blueprint/plan/data-model.md` — proposals additive fields + generation
- [ ] `blueprint/actions/api/services/projects.md`
- [ ] `blueprint/actions/api/services/pipeline-analyze-map.md`
- [ ] `blueprint/actions/api/endpoints/projects.md`
- [ ] `blueprint/actions/api/endpoints/proposals-pipeline.md` (status + create-from-project)
- [ ] `blueprint/_index.md` + pack `status.md`

## Code impact (likely)

### Create
- Projects controller/DTOs/data service
- RFP parse module (`pdf-parse`, `mammoth`)
- Analyze service (1a + 1d + optional 1b) + map service + coverage gates
- Queue processors for analyze/map
- Prompt pack real content for dna/research/map
- Proposal pipeline create + status handlers

### Modify
- `pipeline-queue.service.ts` — dispatch to processors; truth-aware skip
- `PipelineV3Module` + `DataModule` wiring
- Proposal DTO/service for server-set v3 fields
- `package.json` — pdf-parse, mammoth (+ multipart support if needed)

### Upload pattern note
- CR specifies **multipart**; existing app uses JSON base64. Prefer multipart for RFP/images (new Nest `FileInterceptor`) to match CR; document deviation if forced to base64.

### Do not touch
- Creative pipeline v2 orchestrator behavior, FE

## Risk

| Factor | Level | Notes |
|--------|:-----:|-------|
| Complexity | **H** | AI prompts + gates + new module surface |
| Cross-module | **Y** | Projects, proposals, queue, Claude, S3, traces |
| Migration | **N** | Additive proposal fields |
| Cost/latency | **M** | Multiple realtime Claude calls |

## Recommendation

- **Create**: Projects API, RFP/images, analyze+map workers, prompts, status/create-from-project
- **Complete**: BullMQ stubs → real processors; prompt placeholders → real packs
- **Modify**: queue service, proposal create path, package deps
- **Partial OK**: vision 1b if timeboxed; branding 1c can stay code-only colors later
- **Verdict**: Large backend pack; keep FE out

## Status target (after implement)

| Artifact | Target |
|----------|--------|
| Projects CRUD + perms | done |
| RFP parse + images upload | done |
| Analyze worker (1a+1d) + dna.v2 fail-closed | done |
| Map worker + coverage gate | done |
| Prompts dna/research/map | done |
| Proposal create-from-project + status | done |
| Traces on AI calls | done |
| Vision 1b | partial or done |
| FE | deferred |

## Dependencies

- **depends-on:** change-20260726-000005 — **merged** ✓ (also needs change-20260726-000004 foundations — merged)
