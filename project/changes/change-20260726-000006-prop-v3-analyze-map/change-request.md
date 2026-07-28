# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 3/8
- **depends-on**: change-20260726-000005
- **blocks**: change-20260726-000007 (planned — Steps 3–5 + engine)
- **pack-status**: merged

## Scope
- Module(s): Projects, Creative / AI Generation (Pipeline v3 Steps 1–2), Pipeline Traces (write on AI calls), Templates (abstract catalog for map)
- Feature(s): Phase 2 — Analyze → DNA + Map → sectionMap; research subset market/competitor/audience
- Endpoint(s): Projects CRUD + RFP/images + regenerate-dna/get dna; start proposal through map; status through mapping
- Page(s)/View(s): none (FE later)
- Service(s): RFP parse, image upload, DNA builder (1a + 1d), vision optional/partial, map planner, AJV + research coverage gates, BullMQ analyze/map workers, Claude via workspace settings + model-by-request-type

## Description

Implement **Phase 2 — Steps 1–2 (Analyze + Map)** per `docs/refactor-proposal-generator.md` §6.1–6.2 and §15 Phase 2.

**Depends on** merged `change-20260726-000004` (schemas, BullMQ, traces, model resolver) and `change-20260726-000005` (pitch-landscape abstract catalog).

**This pack delivers:**

1. **Projects API** — create/list/get/patch/delete (or archive); persist `info`, services, financials (code-computed), competitors max 3, researchOptions (launch: `market` | `competitor` | `audience`).
2. **RFP upload + server-side parse** — multipart → S3 + extract text (pdf-parse / mammoth / txt); no 8k client truncation; status on `project.rfp`.
3. **Image upload** — multipart → S3 URLs on `project.images` (no dataURLs in AI payloads).
4. **STEP 1 Analyze** — BullMQ `pipeline.analyze`:
   - Code passthrough into DNA skeleton (URLs/services/financials never invented).
   - AI **1a** core DNA (strong model) + **1d** deep research **per selected** research option (subset only: market, competitor, audience), parallel where practical.
   - Optional **1b** vision per image (can be thin/partial if timeboxed; prefer real vision when Anthropic vision available).
   - Validate with AJV `dna.v2` + depth/richness gates; **fail closed** (no silent stub DNA); repair retry ≤2 then `failed`.
   - Store on `projects.dna`; trace all AI calls via PipelineTraceService.
5. **STEP 2 Map** — BullMQ `pipeline.map` after DNA ready:
   - Input: DNA + template abstract catalog + rules + research coverage requirements.
   - One AI map call → validate `map.v1` + **research coverage gate** (must include primary sections for selected research; competitor → N instances).
   - Store on `proposal.sectionMap`; advance `proposal.generation` through `analyzing` → `mapping` → ready-for-sections (or equivalent non-terminal until Phase 3) / `failed`.
6. **Pipeline start** — `POST …/projects/:id/proposals` creates proposal linked to project + templateKey/language, enqueues analyze (or map-only if DNA already present); `GET …/proposals/:id/status` for polling.
7. **Prompts** — fill Phase 0 skeleton for `dna.core`, `research.market|competitor|audience`, `map.plan` with real Role/Mission/Grounding/Output-contract content (not placeholders).

**Out of scope:**
- Step 3 parallel section content, assemble, export workers — change-20260726-000007
- Regenerate-from-step-2 / translate / template-switch product flows — change-20260726-000008 (basic regenerate-dna OK here)
- Frontend create/stepper — change-20260726-000009
- Full research option set beyond market/competitor/audience

**Locked decisions:** fail closed on DNA/map; research subset three keys; model by request type; workspace Claude key; competitors max 3; traces for admin/sales_manager.

## Acceptance Criteria

1. Authenticated user with `projects.*` can create a project with info/services/competitors(≤3)/researchOptions and list/get/update it.
2. RFP file upload parses server-side; extracted text artifact stored (S3 or equivalent); DNA/analyze can consume full text without 8k truncation.
3. Image upload stores S3 URLs on the project; analyze payloads reference URLs/ids, not dataURLs.
4. Analyze job produces `projects.dna` validated against `dna.v2` (depth gates); selected research modules populated for market/competitor/audience; failure → `failed` + retryable regenerate-dna (no stub DNA).
5. Creating a proposal for a project with `templateKey: pitch-landscape` runs map after DNA; `proposal.sectionMap` validates `map.v1` and research coverage (includes required research section keys; competitor instances match competitor count).
6. `GET /api/data/proposals/:id/status` (or agreed path) exposes generation step statuses for analyze/map.
7. Every AI call writes a pipeline trace (input/output/tokens/cost).
8. ModelResolver used by request type; Claude API key from workspace settings.
9. Legacy `/ai-jobs` creative path unchanged; no FE changes.

## Notes

- Source: `docs/refactor-proposal-generator.md` §6.1–6.2, §5.6.1, §9.4–9.6, §13 Projects + proposal pipeline (subset).
- Proposal document may gain additive fields (`projectId`, `templateKey`, `sectionMap`, `generation`) — schema-less OK; full CRM migration later.
- If vision (1b) or branding (1c) are partial, document in pack as `partial` with clear follow-up — core 1a+1d+map must be `done`.
