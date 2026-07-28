# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 4/8
- **depends-on**: change-20260726-000006
- **blocks**: change-20260726-000008 (planned — regenerate / translate / template-switch)
- **pack-status**: merged

## Scope
- Module(s): Creative / AI Generation (Pipeline v3 Steps 3–5 + engine), Proposals (section content + render artifacts), Templates (full contentSchema fan-out + assemble)
- Feature(s): Phase 3 — parallel section content → assemble HTML/PDF → S3 export; FlowProducer/fan-in; reconciler; workspace feature flag
- Endpoint(s): section retry; optional get sections / rendered artifacts; status extended through `ready` / `partially_failed`; feature-flag read/write if needed via settings
- Page(s)/View(s): none (FE later — change-20260726-000009/010)
- Service(s): SectionOrchestrator + per-section workers, richness/AJV gates, AssembleService, ExportService, PipelineReconciler, FlowProducer wiring, section prompts

## Description

Implement **Phase 3 — Steps 3–5 + orchestration engine** per `docs/refactor-proposal-generator.md` §6.3–6.5, §7 (queues/status/reconciler), §9 richness gates, and §15 Phase 3.

**Depends on** merged `change-20260726-000006` (DNA + `sectionMap` + analyze/map workers + Projects API).

**This pack delivers:**

1. **STEP 3 — Section content (parallel fan-out)** — BullMQ `pipeline.section`:
   - One realtime Claude call per `sectionMap` entry (not Batch API).
   - Input: map slice + full section `contentSchema` + filtered DNA slice; research sections get full `research.modules.*`; financial AI writes intro/terms only (money table code-filled in Step 4).
   - AJV against section schema + richness gate; repair ≤2 per section; failed sections do not block siblings.
   - Store at `proposal.sections[]` with `contentByLang[lang]`; traces per call; ModelResolver by request type (`section` / `section.research` / `repair`).
2. **STEP 4 — Assemble (no AI)** — BullMQ `pipeline.assemble` (fan-in after sections):
   - Handlebars via existing `TemplateRenderService` + theme resolve + inject financials/dates/client.
   - Overflow guard (Puppeteer measure `.page` + shrink steps) then PDF via `PdfRenderService`.
3. **STEP 5 — Export** — BullMQ `pipeline.export`:
   - Upload HTML + PDF to S3; write `renderedByLang[lang]`; `generation.status = ready` (or failed at export).
4. **Engine**:
   - Wire FlowProducer (or equivalent parent/children) so assemble runs when section children complete.
   - Idempotent workers reading Mongo truth; extend `isStepAlreadyDone`.
   - **Reconciler** sweep (~60s): stuck non-terminal proposals with no live jobs → re-enqueue current step.
   - **Feature flag** per workspace (activates v3 path; v2 creative pipeline remains default when off).
5. **Status model** — extend `proposal.generation`:
   - Statuses: `generating_sections` | `assembling` | `exporting` | `ready` | `partially_failed` | `failed` (+ existing analyze/map).
   - Per-section step tracking; `GET …/proposals/:id/status` exposes them.
6. **APIs** — at minimum: retry failed section(s); status already exists (extend). Optional: get section content / download URLs when ready.
7. **Prompts** — section packs (generic + research presentation) under `pipeline-v3/prompts/`; not placeholders.

**Out of scope:**
- Regenerate-from-map / translate / template-switch / formal second template — change-20260726-000008
- Frontend stepper / PDF download UI / AI Requests page — change-20260726-000009/010
- Cutover / backfill / retire v2 — change-20260726-000011
- Admin template editor, Bull Board, structured section editor
- Full vision 1b (may remain partial)

**Locked decisions (carry forward):** BullMQ + Redis work / Mongo truth; `pitch-landscape` only; dual create path; competitors ≤3; research subset market/competitor/audience; fail-closed DNA/map; section failures → **`partially_failed` / Ready with gaps** + per-section retry; workspace Claude key + model-by-request-type; traces admin + sales_manager; feature flag per workspace; no FE in this pack; leave creative v2 path intact when flag off.

## Acceptance Criteria

1. After map completes, section jobs fan out; each map entry gets validated content (or individual `failed`) without blocking siblings; concurrency capped (workspace/worker ~6–8).
2. Research sections present DNA research modules (no re-research); financial money table injected from `proposal.services` at assemble — AI cannot invent prices.
3. Assemble produces HTML (+ PDF) via Handlebars + PdfRenderService; overflow guard runs before export.
4. Export uploads HTML/PDF to S3 and sets `renderedByLang` + `generation.status = ready` (or `partially_failed` when some sections failed but deck still assembled per product rule).
5. `GET …/proposals/:id/status` reports section/assemble/export progress; retry endpoint re-runs only failed section instance(s) then can resume assemble/export.
6. Reconciler re-enqueues stuck non-terminal generations; workers skip if step already done (idempotent).
7. Workspace feature flag gates v3 engine activation; with flag off, legacy `/ai-jobs` creative path unchanged.
8. Every section AI call writes a pipeline trace; ModelResolver used by request type.
9. `npm run build` succeeds; no FE changes.

## Notes

- Source: `docs/refactor-proposal-generator.md` §6.3–6.5, §7, §9.7–9.8, §15 Phase 3.
- Doc Phase 3 title says “Steps 3–4 + engine”; program table includes **export (Step 5)** in this pack — keep export here so e2e demo reaches downloadable artifacts.
- Golden-project quality bar (§9.11) may be documented as manual/smoke checklist in verify-code if full fixture suite is heavy.
