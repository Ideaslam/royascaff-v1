# Services — Creative v2 full traces · change-20260805-130421

Status: **done**

### SVC-CREATIVE-V2-TRACE · Fail-close + full phase observability

#### Helpers (`creative-v2-tracing.ts`)

Add a small helper used by poller + orchestrator:

```ts
failCreativeV2OpenAiTraces(traces, state, {
  error: string,
  ctx?: CreativeV2TraceCtx | null,
  meta?: JsonObject,
}): Promise<void>
```

Behavior:
1. For each of `sectionsBatchTraceId`, `htmlBatchTraceId`, `repairBatchTraceId` present on state → `completeCreativeV2AiTrace(..., { status: "failed", error })` (best-effort; ignore already-finished).
2. If `ctx` present → `traceCreativeV2Action` with `label: "creative_v2.failed"`, `status: "failed"`, `meta` including `phase`, `batchId`, counts/reason.

Optional: resolve active open trace by phase if only one should fail (prefer failing all open ids that still exist — `completeAiCall` on already-success is ok if service no-ops or overwrites; prefer only completing when current status is open/`retrying`).

#### Poller (`poll-batch-jobs.ts`)

On every **terminal failure** path for `pipelineVersion === "2"` (and proposal-backed deps share the same code):

| Path | Must also |
|------|-----------|
| `handleBatchCanceling` | fail-close open AI traces + `creative_v2.failed` |
| ended + allCanceled | same |
| ended + hasErrors && !hasSucceeded | same |
| ended + hasErrors (partial) for v2 | same (already sets phase failed) |
| single-item canceled / errored (legacy path if hit for v2) | same |

Build `CreativeV2TraceCtx` from proposal when available (`creativeV2TraceCtxFromProposal`). Pass `deps.traces`.

Do **not** change success routing into `processCreativePipelineAfterBatch`.

#### Orchestrator (`processCreativePipelineAfterBatch.ts`)

1. After `startCreativeV2AiTrace` for HTML batch + persist `htmlBatchId`, emit action `creative_v2.html_batch_submitted` (mirror sections_batch_submitted) with `batchId` + `htmlBatchTraceId`.
2. Every local `status: "failed"` updateJob path that does **not** already `completeCreativeV2AiTrace` for the open batch must call `failCreativeV2OpenAiTraces` (missing sectionBatchId, page_input fail after sections completed, unexpected phase, etc.).
3. Keep existing success complete/validation/phase traces.

#### Create (`creative-v2-create.service.ts`)

No change required beyond existing `sections_batch` start + `sections_batch_submitted` — unless create fails after AI start (then fail-close that trace).

## Delta

- New fail-close helper; poller early exits always close AI rows; HTML submit action label; orchestrator gaps closed
- No new endpoints / collections
