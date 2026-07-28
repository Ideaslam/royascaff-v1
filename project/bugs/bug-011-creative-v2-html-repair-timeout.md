# Bug #011 — Creative v2 HTML repair fails (Anthropic 10‑min non-stream)

## Status
**FIXED** — awaiting user confirmation

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: api · Creative Pipeline v2 · HTML repair

## Description
After sections + HTML Message Batches succeed, the optional HTML repair step called Claude via non-streaming `messages.create`. Anthropic rejects long runs:

> Streaming is required for operations that may take longer than 10 minutes.

Proposal generation fails at repair even though batch HTML already returned.

## Expected Behavior
Repair completes via Message Batch (same async poll path as sections/HTML), with 64k max tokens.

## Steps to Reproduce
1. Create unified creative v2 proposal
2. Wait until sections batch + HTML batch complete
3. If validation/`needsRepair` triggers → repair call fails with Anthropic streaming error

## Root Cause
**Not a max-token ceiling issue.** HTML repair used sync `messages.create` (`callClaudeWithStopReason`). Large repair prompts/outputs exceed Anthropic’s ~10‑minute non-stream limit.

`needsRepair` when: validation fails, `stopReason === max_tokens`, missing `</html>`, or missing required `id="…"` section markers.

## Fix Applied
Converted HTML repair to Claude **Message Batch** (not sync/stream):

1. `repairHtml.ts` — `prepareHtmlRepairBatch` with `HTML_REPAIR_MAX_TOKENS = 64000`
2. On `needsRepair` after HTML batch → submit repair batch, phase `html_repair_submitted`, set `repairBatchId` / job `batchId`
3. Poller resumes via `processAfterRepairBatch` → validate → upload
4. Poll bridge + pending-batch query prefer/`include` `repairBatchId`

## Verification
- [x] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `src/creative-pipeline/render/repairHtml.ts`
- `src/creative-pipeline/orchestrate/processCreativePipelineAfterBatch.ts`
- `src/creative-pipeline/types/creative-pipeline-state.ts`
- `src/jobs/creative-v2-poll-bridge.ts`
- `src/infrastructure/persistence/providers/mongodb/mongodb-proposals.repository.ts`
