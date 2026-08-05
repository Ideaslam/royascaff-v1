# Verification — Creative v2 full traces

## Plan Consistency (pre-build)
- [x] Pack service spec covers fail-close helper + poller + orchestrator
- [x] Data-model slice documents labels only (no schema change)
- [x] No new endpoints / FE pages required

## Code Verification (post-build)

- [x] `failCreativeV2OpenAiTraces` in `creative-v2-tracing.ts` — closes open AI ids; skips terminal; emits `creative_v2.failed`
- [x] Poller terminal paths (canceling, allCanceled, no-success errors, partial v2 errors, missing pipeline) call fail-close
- [x] Orchestrator emits `creative_v2.html_batch_submitted` after HTML batch persist
- [x] Orchestrator failure exits (missing batch id, section/page/html/repair/validation/invalid phase) call fail-close
- [x] Existing success AI complete paths for `sections_batch` / `html_batch` / `html_repair` retained
- [x] `tsc --noEmit` passes
- [x] No FE / endpoint / schema changes

## Acceptance Criteria

1. [x] Success path still starts both AI traces (`sections_batch`, `html_batch`) + new `html_batch_submitted` action
2. [x] Repair path still starts `html_repair` and completes it
3. [x] Phase/action labels include lifecycle + `creative_v2.failed` on terminal fail
4. [x] Poller early failure closes open AI traces (no stuck `inprogress` after terminal fail)
5. [x] Failure action includes reason/counts in meta/error
6. [x] No new collections/endpoints; v3 untouched

## Result: **PASS**

## Notes

- Live run not executed in this verify (needs Claude batch). Restart API and re-run a v2 creative create to confirm AI Requests UI shows both AI rows / failed closes.
