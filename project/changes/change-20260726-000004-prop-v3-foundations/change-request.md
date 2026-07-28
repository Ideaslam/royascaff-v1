# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 1/8
- **depends-on**: —
- **blocks**: change-20260726-000005 (planned — template system)
- **pack-status**: merged

## Scope
- Module(s): Projects (new), Templates (new), Pipeline Traces (new), AI Jobs / Creative Pipeline (infra prep), PDF (new)
- Feature(s): Pipeline v3 foundations — infra + contracts only (no full generation yet)
- Endpoint(s): Trace list/detail stubs or module wiring as needed for later packs; Projects/Templates CRUD may be thin scaffold
- Page(s)/View(s): none in this pack (frontend deferred to parts 6–7)
- Service(s): BullMQ workers shell, PipelineTraceService, PdfRenderService, schema/prompt pack skeletons, Mongo repositories for `projects` / `templates` / `pipelineTraces`

## Description

Implement **Phase 0 — Foundations** of the Proposal Generator Refactor (Pipeline v3) per `docs/refactor-proposal-generator.md`.

**Product outcome (full REQ-PROP-V3):** Faster proposal generation (≤ ~90s), schema-enforced accuracy, deterministic hand-crafted templates, server-side PDF, Project → many proposals, resumable pipeline with traces.

**This pack (part 1/8 — Foundations):** Ship infrastructure and contracts so later packs can implement templates and pipeline steps without rework:

1. **BullMQ on existing Redis** — queues for `pipeline.analyze|map|section|assemble|export`; Redis holds work, Mongo holds truth; worker shells + idempotent job pattern (no full step logic yet).
2. **Collections + repositories** — `projects`, `templates`, `pipelineTraces` (schemas/models aligned with §4 / §7.4).
3. **PipelineTraceModule** — service + persistence for AI call logging (full I/O, tokens, cost); API surface can be minimal/scaffold if needed; **access later restricted to admin / sales-lead** via `pipeline-traces:read`.
4. **JSON Schemas** — versioned contracts: `dna.v2`, `map.v1`, section slot library with min/max (AJV-ready).
5. **Prompt pack folder skeleton** (§9.3) — versioned prompt files, not buried in code; model key selection by **request type** (workspace Claude settings remain source of API key; model id depends on call type).
6. **Puppeteer `PdfRenderService`** — Docker/Chromium + Arabic fonts; smoke-render path ready for Phase 1 template verification.
7. **Permissions seed prep** — `projects:*`, `pipeline-traces:read` (wiring may complete when endpoints land).

**Multi-pack program (follow doc phases; FE split):**

| Part | Pack (planned) | Doc phase | Scope |
|------|----------------|-----------|--------|
| 1/8 | change-20260726-000004 (this) | 0 Foundations | Infra + contracts |
| 2/8 | change-20260726-000005 | 1 Template system | Handlebars + `pitch-landscape` (design-first on disk) |
| 3/8 | change-20260726-000006 | 2 Steps 1–2 | Analyze + Map; research subset: market, competitor, audience |
| 4/8 | change-20260726-000007 | 3 Steps 3–5 + engine | Fan-out, assemble, export, reconciler, feature flag |
| 5/8 | change-20260726-000008 | 4 Regenerate / translate / template-switch | Regeneration APIs; sibling proposals |
| 6/8 | change-20260726-000009 | 5a Frontend | Project create + template gallery + stepper + PDF download + project workspace (keep legacy create path) |
| 7/8 | change-20260726-000010 | 5b Frontend | AI Requests / cost dashboard (traces UI) |
| 8/8 | change-20260726-000011 | 6 Cutover | Backfill, per-workspace flag flip, retire v2 path |

**Decisions locked from discovery:**

- Priority: **high** (ahead of in-flight REQ-R packs when scheduling).
- Queue: BullMQ on existing Redis (approved).
- First template only: `pitch-landscape` (Phase 1); design-first on disk so design edits affect render output.
- Dual create path during migration (legacy proposal wizard + new Project flow).
- Competitors: max **3** at launch.
- Research options at launch subset: **market**, **competitor**, **audience** (full set later).
- Feature flag: **per workspace** (activates with engine pack).
- Permissions: `projects:*`, `pipeline-traces:read`; traces visible to **admin / sales-lead** only.
- DNA/map fail closed → `failed` + retry (no silent stubs).
- Section failures → **`partially_failed` / Ready with gaps** + per-section retry.
- Frontend: PrimeNG + existing Roya global styles; no new design system.
- Claude: workspace settings for keys; **model varies by request type**.

## Acceptance Criteria

1. BullMQ is wired to the existing Redis connection; at least the five pipeline queue names exist and a worker can process a no-op / health job idempotently.
2. Mongo models/repositories exist for `projects`, `templates`, and `pipelineTraces` matching the Phase 0 fields from the deep plan (§4.1, §4.3, §7.4.1) — even if HTTP CRUD is thin or unused yet.
3. `PipelineTraceService` can create and read a trace record (input/output JSON, tokens, cost fields, step/action metadata).
4. Versioned JSON Schema files exist for `dna.v2`, `map.v1`, and the section slot library (with min/max constraints) and load via AJV without runtime errors.
5. Prompt-pack directory skeleton exists (§9.3 layout) with placeholders for analyze/map/section prompts; model-key resolution is keyed by request type (documented or stubbed helper).
6. `PdfRenderService` can render a minimal HTML fixture to PDF using Puppeteer; Docker/image notes or deps include Chromium + Arabic font support path.
7. Permission keys `projects:*` and `pipeline-traces:read` are defined/seeded (or clearly stubbed for seed update in a follow-up if seed module is touched carefully).
8. Legacy creative pipeline (`POST /ai-jobs`) remains unchanged and available; no production cutover in this pack.
9. No main blueprint merge until verify PASS; all specs live under this pack’s `blueprint/` until Step 5.6.

## Notes

- Source of truth for product design: `docs/refactor-proposal-generator.md`.
- **Out of scope for entire REQ-PROP-V3 v1:** structured per-section editor (Phase 5+ later), admin template editor, contracts-as-children deep linkage, Bull Board UI.
- **Out of scope for this pack:** full DNA/map/section prompts, Handlebars templates, end-user UI, feature-flag flip, migration backfill.
- Design-first template rule applies starting part 2/8: template assets on disk; editing design files must change rendered HTML/PDF.
- Redis persistence for prod should be enabled/ops-checked when deploying BullMQ (infra note for deploy).
- REQ-R packs (001–003) stay in flight; this request takes scheduling priority.
