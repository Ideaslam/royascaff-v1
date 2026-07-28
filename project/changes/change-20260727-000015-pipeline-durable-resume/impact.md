# Impact Analysis — change-20260727-000015-pipeline-durable-resume

## Summary
Harden Pipeline v3 so generation can resume from Mongo checkpoints after process/Redis interruption. Touches reconciler, section orchestration, queue chaining, proposals API, and proposal-view Continue UX.

## Affected modules / features
| Area | Impact |
|------|--------|
| Orchestration engine | New shared `resumeProposal` status machine; reconciler delegates to it |
| Section orchestrator | Resume incomplete (`pending`/`running`/`failed`); never wipe `ready` |
| Queue service | Section skip → still `maybeFanIn`; optional deterministic jobIds |
| Proposals API | `POST …/resume` |
| Proposal view (web) | Continue control while non-terminal / stuck |
| Data model | No new collection; may normalize orphaned `running` → `pending` on resume |

## Risk
| Risk | Mitigation |
|------|------------|
| Double-enqueue storms | Idempotent workers + optional jobId; reconciler stuck-ms gate |
| Accidental wipe of ready sections | Ban `enqueueAllSections` when rows exist |
| Concurrent Continue + reconciler | Same helper; Mongo status transitions stay authoritative |
| Partial failures | Keep `partially_failed` + existing failed retry |

## Pack blueprint (isolation) — drafted
- [x] `blueprint/plan/modules.md` — orchestration engine resume semantics
- [x] `blueprint/actions/api/services/pipeline-resume.md` — SVC-PIPE-RESUME-01..04
- [x] `blueprint/actions/api/endpoints/proposals-pipeline-resume.md` — EP-PROP-PIPE-08
- [x] `blueprint/actions/web/pages/proposal-view-resume.md` — PG-PROP-RESUME-01
- [x] `blueprint/_index.md`

## Code touch list (implement later, after gate)
- `pipeline-reconciler.service.ts`
- `section-orchestrator.service.ts`
- `pipeline-queue.service.ts`
- `proposals-data.controller.ts` / projects/proposals data service
- FE `proposal-view.component.ts` + projects/proposals service
