# Services — Pipeline durable resume

## Delta

| ID | Service | Status | Behavior |
|----|---------|--------|----------|
| SVC-PIPE-RESUME-01 | `PipelineResumeService` (new) or method on queue/orchestrator facade | planned | `resumeProposal({ workspaceId, proposalId })` implements status machine from pack `plan/modules.md`; returns `{ proposalId, runId, status, enqueued: { step, unitIds? }[] }` |
| SVC-PIPE-RESUME-02 | `SectionOrchestratorService` | planned | Add `enqueueIncompleteSections` (or extend `retrySections` with `mode: "incomplete"`): targets `pending\|running\|failed`; reset `running`→`pending`; **never** reset `ready`; refresh section step counters; enqueue section jobs; if zero incomplete and all terminal → trigger assemble enqueue |
| SVC-PIPE-RESUME-03 | `PipelineReconcilerService` | planned | Replace divergent `reenqueue` body with call to SVC-PIPE-RESUME-01; keep stuck-ms + v3 filter; prefer querying non-terminal v3 proposals (not only latest 40 if feasible) |
| SVC-PIPE-RESUME-04 | `PipelineQueueService` | planned | When `isStepAlreadyDone` skips a **section** unit, still call section fan-in (`maybeFanIn` / equivalent) so assemble is not stranded |

## Notes

- Wire API + reconciler only through SVC-PIPE-RESUME-01 (single path).
- Existing `retrySections` (failed-only) remains for terminal Retry UI; resume uses incomplete mode.
- Permissions/workspace checks stay in data/controller layer before calling resume.
