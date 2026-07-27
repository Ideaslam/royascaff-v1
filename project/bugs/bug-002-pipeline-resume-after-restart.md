# Bug #002 — Pipeline does not resume after app/Redis stop

## Status
**DONE** — Confirmed 2026-07-27; pack `change-015-pipeline-durable-resume/` merged

## Reported
- **Date**: 2026-07-27
- **Severity**: critical
- **Affected area**: Pipeline v3 (BullMQ + Mongo generation + proposal UI)

## Description
When the app stops mid-generation (e.g. 12/14 sections done) and is started again, the proposal never continues. Progress appears stuck. Concern: pipeline depends on the Redis queue only; if Redis or the app dies, work cannot continue from the reached stage.

## Expected Behavior
Mongo holds durable checkpoints. After restart (or Redis loss), the system (reconciler and/or explicit Continue) resumes from the current stage: re-enqueue incomplete sections only, then assemble/export when sections are terminal — without wiping ready work.

## Steps to Reproduce
1. Start a v3 proposal generation with many sections.
2. Stop the API (and/or Redis) while status shows e.g. 12/14 sections.
3. Start the app again; wait for reconciler (~3+ minutes) or refresh the proposal.
4. Observe: progress stays stuck; pipeline does not continue.

## Triage (6.0)
- **Path A** — change work pack `change-015-pipeline-durable-resume/`.

## Root Cause
Progress stored in Mongo; scheduling in Redis only. Reconciler did not re-enqueue incomplete sections or advance assemble when queue jobs were lost.

## Fix Applied
- `PipelineResumeService` + reconciler share resume helper
- Incomplete sections only; ready preserved; section skip fan-in
- `POST …/resume` + FE Continue only when stuck (`canResume`)
- User confirmed auto-resume after restart

## Verification
- [x] Fix implemented in code
- [x] Pack verified
- [x] Pack merged
- [x] User confirmed resume after restart

## Related Files
See `project/changes/change-015-pipeline-durable-resume/merge-report.md`
