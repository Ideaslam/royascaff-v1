# Impact Analysis — Creative v2 full traces

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `pipelineTraces`; `generation.creativePipeline.*TraceId` | No new fields required |
| Service(s) | partial | `creative-v2-tracing.ts`, `processCreativePipelineAfterBatch.ts`, `poll-batch-jobs.ts`, `creative-v2-poll-bridge.ts`, `creative-v2-create.service.ts` | Success path emits AI + phase traces; early poller fails leave AI `inprogress` and skip failure actions; second AI only after sections succeed |
| Endpoint(s) | complete | GET pipeline-traces / AI Requests | Already lists `step: creative_v2` |
| Page(s) | complete | web `/ai-requests` | No change needed for this pack |

Feature state: **partial**

## Affected Modules
- Creative Pipeline v2 — close AI traces on all failure exits; emit failure phase/action traces with reason
- Jobs poller — `handleEndedBatch` / cancel / error paths must call `completeCreativeV2AiTrace` (+ failure action)
- Pipeline Traces — reuse `PipelineTraceService` only (no API change)

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/creative-pipeline-v2-tracing.md`
- [ ] `blueprint/plan/data-model.md` (delta note only: labels/lifecycle; no schema change)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: complexity L, cross-module N (poller + creative-pipeline only), migration N

## Recommendation
- **Modify**: poller early-exit + orchestrator failure exits to always complete open AI traces and emit `creative_v2.failed` (or equivalent) with reason
- **Complete**: ensure `html_batch` / `html_repair` start/complete paths remain; add missing submit action for `html_batch` if absent
- **Create**: none (no new endpoints/entities)

## Status target (per artifact in the pack after implement)
- creative-pipeline-v2-tracing service → done
- data-model delta (labels) → done

## Dependencies
- depends-on: — 
- Prior related pack (merged): `change-20260728-000032-prop-unify-v2-project-traces`
