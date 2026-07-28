# Bug #011 — Creative v2 HTML repair fails (Anthropic 10‑min non-stream)

## Status
**PENDING** — Root cause documented; awaiting fix choice / confirmation

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: api · Creative Pipeline v2 · `repairHtmlDocument`

## Description
After sections + HTML Message Batches succeed, the optional HTML repair step calls Claude via non-streaming `messages.create`. Anthropic rejects long runs:

> Streaming is required for operations that may take longer than 10 minutes.

Proposal generation fails at repair even though batch HTML already returned.

## Expected Behavior
Either repair completes (stream or batch), or pipeline fails cleanly without a false “streaming required” error; ideally repair does not block the main happy path when batch HTML is already usable.

## Steps to Reproduce
1. Create unified creative v2 proposal
2. Wait until sections batch + HTML batch complete
3. If validation/`needsRepair` triggers → repair call fails with Anthropic streaming error

## Root Cause
**HTML repair is legacy main-v2 flow** (not introduced by REQ-PROP-UNIFY). After HTML batch, `processAfterHtmlBatch` may call `repairHtmlDocument` → `callClaudeWithStopReason` → `client.messages.create` (non-stream). Large repair prompts/outputs exceed Anthropic’s ~10‑minute non-stream limit.

`needsRepair` when: validation fails, `stopReason === max_tokens`, missing `</html>`, or missing required `id="…"` section markers.

## Fix Applied
_(pending — choose: stream repair | batch repair | skip/soften repair)_

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `src/creative-pipeline/render/repairHtml.ts`
- `src/creative-pipeline/orchestrate/processCreativePipelineAfterBatch.ts`
- `src/lib/ai-provider.ts` (`callClaudeWithStopReason`)
