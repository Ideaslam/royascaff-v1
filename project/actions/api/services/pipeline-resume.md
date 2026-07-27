# Services — Pipeline durable resume

| ID | Service | Status | Behavior |
|----|---------|--------|----------|
| SVC-PIPE-RESUME-01 | `PipelineResumeService` | done | `resumeProposal({ workspaceId, proposalId })` — Mongo checkpoint status machine; returns `{ proposalId, runId, status, enqueued }` |
| SVC-PIPE-RESUME-02 | `SectionOrchestratorService.enqueueIncompleteSections` | done | Targets `pending\|running\|failed` only; never resets `ready`; fan-in assemble when all terminal |
| SVC-PIPE-RESUME-03 | `PipelineReconcilerService` | done | Idle non-terminal v3 → same resume helper (~60s sweep, stuck ≥3 min) |
| SVC-PIPE-RESUME-04 | `PipelineQueueService.chainAfterSkip` | done | Skipped ready **section** still calls `tryAssembleFanIn` |
| SVC-PIPE-RESUME-05 | `SectionOrchestratorService.retrySections` | done | Empty failed targets + ready sections → assemble fan-in (recoverable assemble/export fail) |

## Notes

- API + reconciler share SVC-PIPE-RESUME-01.
- Status API exposes `stuck` / `canResume` / `hasQueueWork` for FE Continue gating.
- `canResume` also true for recoverable terminal `failed` (assemble/export fail, sections ready, no artifacts).
- Resume handles `failed` via incomplete sections / assemble fan-in (does not wipe `ready`).
