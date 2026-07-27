# Bug #007 — Pipeline stuck at 15/16 sections

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-07-27
- **Severity**: high
- **Affected area**: Pipeline v3 / section fan-out (`roya-sales-ai-api-v2`)

## Description
Proposal generation consistently stalls at **Writing 15 / 16** (~94%) with status "Writing sections" and a **Continue generation** button. Clicking Continue finishes the proposal. Happens reliably near the last section.

## Expected Behavior
All 16 sections should complete and fan-in to assemble/export without requiring a manual Continue.

## Steps to Reproduce (if applicable)
1. Start / regenerate a pipeline-v3 proposal (e.g. Branding For PayUp).
2. Wait until Writing sections progress reaches ~15/16.
3. Observe Continue appears; pipeline does not advance to Designing on its own.
4. Click Continue → remaining work completes.

## Root Cause
_(Filled after investigation with runtime evidence)_

## Fix Applied
_(Filled after implementation)_

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/pipeline-v3/section/section-orchestrator.service.ts`
- `roya-sales-ai-api-v2/src/infrastructure/persistence/providers/mongodb/mongodb-proposals.repository.ts`
- `roya-sales-ai-api-v2/src/services/data/projects.data.service.ts`
