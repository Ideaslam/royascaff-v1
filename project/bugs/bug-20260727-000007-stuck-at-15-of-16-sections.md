# Bug 20260727-000007 — Pipeline stuck at 15/16 sections

## Status
**DONE** — Confirmed 2026-07-28

## Reported
- **Date**: 2026-07-27
- **Severity**: high
- **Affected area**: Pipeline v3 / section fan-out (`roya-sales-ai-api-v2`)

## Description
Proposal generation consistently stalls at **Writing N−1 / N** (e.g. 15/16 or 9/10) with status "Writing sections" and a **Continue generation** button. Clicking Continue finishes the proposal.

## Expected Behavior
All sections should complete and fan-in to assemble/export without requiring a manual Continue.

## Steps to Reproduce (if applicable)
1. Start / regenerate a pipeline-v3 proposal.
2. Wait until Writing sections progress reaches N−1 / N.
3. Observe Continue appears; pipeline does not advance to Designing on its own.
4. Click Continue → remaining work completes.

## Root Cause
Concurrent section workers `$set` the entire `sections` array. Sibling writes race and overwrite a finished section’s `ready` status back to `running`/`pending`. Confirmed in logs: `LOST UPDATE: own result overwritten` for `sec_007` (timeline) → stuck at N−1 with `hasQueueWork: false`. Continue re-enqueues the incomplete row and finishes.

## Fix Applied
Atomic per-section Mongo updates via `patchSectionByInstanceId` (arrayFilters) in `runSection` — no full-array rewrite for running/ready/failed.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/pipeline-v3/section/section-orchestrator.service.ts`
- `roya-sales-ai-api-v2/src/infrastructure/persistence/contracts/proposals.repository.ts`
- `roya-sales-ai-api-v2/src/infrastructure/persistence/providers/mongodb/mongodb-proposals.repository.ts`
