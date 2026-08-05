# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V2-TRACE
- **part**: 1/1
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Creative Pipeline v2, Pipeline Traces / AI Requests
- Feature(s): Full v2 phase + AI call observability (both Claude batches + repair + failures)
- Endpoint(s): existing AI Requests list (no new endpoints)
- Page(s)/View(s): —
- Service(s): `creative-v2-tracing`, `processCreativePipelineAfterBatch`, `poll-batch-jobs`, `creative-v2-poll-bridge`

## Description

Pipeline **v3** already exposes rich AI Requests traces. Pipeline **v2** should do the same so we can diagnose stuck/failed runs.

Today a typical stuck run only shows:
1. `creative_v2.created` (action)
2. `creative_v2.sections_batch` (AI, often left `inprogress`)
3. `creative_v2.sections_batch_submitted` (action)

v2 has **two required Claude Message Batches** (sections → HTML) plus optional repair, but the second AI call (`creative_v2.html_batch`) never appears when the poller fails early or never advances — and early poller failures do **not** complete the open AI trace or emit a failure action with the Claude error.

**Goal:** Make every v2 phase and every AI boundary visible in AI Requests (same `pipelineTraces` / `step: creative_v2` surface as today), with failures always closing open AI traces and recording why.

**In scope**
1. Ensure both AI calls always appear when submitted: `creative_v2.sections_batch` and `creative_v2.html_batch` (+ `creative_v2.html_repair` when used).
2. Complete / fail open AI traces on all poller early-exit paths (canceled, errored, expired, missing batch, unexpected phase).
3. Emit phase/action traces for every transition and failure with useful `meta` / error (batchId, phase, counts, reason).
4. Keep existing success-path traces (validations, `sections_ready`, `page_input_*`, `html_*`, `uploaded`, `completed`).
5. Backend-only; no FE filter/UI redesign (existing AI Requests page already lists `creative_v2`).

**Out of scope**
- Per-section AI rows for the 10 section prompts inside one Message Batch (still one aggregate `sections_batch` AI row with usage aggregate)
- Pipeline v3 changes
- New endpoints or schema collections
- Fixing unrelated generation bugs beyond making failures observable

## Acceptance Criteria

1. A successful v2 run shows **at least two AI traces** with a model: `creative_v2.sections_batch` and `creative_v2.html_batch`, each ending `success` with tokens/cost/duration when Claude returns usage.
2. When HTML repair runs, a third AI trace `creative_v2.html_repair` appears and is completed (`success` or `failed`).
3. Phase/action traces cover the full lifecycle at least: `created` → `sections_batch_submitted` → `sections_ready` → `page_input_ready` → `html_generated` → (`html_repair_submitted` if repair) → `uploaded`/`completed` (plus validation labels already used).
4. Any early poller failure (batch canceled / errored / expired / missing results) **closes** the open AI trace as `failed` with an error message — never leaves AI rows stuck at `inprogress` after the proposal is terminal.
5. Failure paths also emit a failed action/phase trace (e.g. `creative_v2.failed` or phase-specific) including batch counts / reason in meta or error so AI Requests explains the problem without server logs.
6. No new collections/endpoints; FE unchanged; v3 traces unchanged.

## Notes (optional)

- Screenshot evidence (2026-08-05): only one AI row (`sections_batch` `inprogress`); `html_batch` never started — matches poller early-fail / stuck before second submit without trace completion.
- Reuse helpers in `creative-v2-tracing.ts` (`startCreativeV2AiTrace` / `completeCreativeV2AiTrace` / `traceCreativeV2Action`).
- Fast-Track: backend-only, ≤1 module surface, no new data model / endpoints.
