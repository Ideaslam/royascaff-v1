# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: bug-fix
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged
- **bug**: `bug-002-pipeline-resume-after-restart.md`

## Scope
- Module(s): Pipeline Traces / Proposal Pipeline v3 (orchestration engine)
- Feature(s): Durable resume from any generation stage after app or Redis interruption
- Endpoint(s): new `POST /api/data/proposals/:id/resume` (or widen sections retry); harden reconciler
- Page(s)/View(s): web proposal view — Continue while non-terminal / stuck
- Service(s): PipelineReconcilerService, SectionOrchestratorService, PipelineQueueService, proposals data

## Description
Proposal generation progress is largely durable in Mongo (`generation.status`, section counters, per-section `ready|pending|running|failed`), but work scheduling is Redis/BullMQ-only. After API stop or Redis loss mid-run (e.g. 12/14 sections), the proposal often never continues: reconciler only re-enqueues **failed** sections (or wipes via `enqueueAllSections` in a narrow case) and never fans into assemble when sections are already complete but the next job was lost. FE only offers retry on terminal statuses.

**Desired outcome:** Treat Mongo as the checkpoint. On restart / idle stuck / explicit Continue, resume from the current stage without discarding ready sections. Redis remains a disposable work queue.

## Acceptance Criteria
1. After API restart with Redis emptied, a proposal stuck at `generating_sections` with some `ready` and some `pending`/`running`/`failed` sections eventually resumes incomplete sections only (ready content preserved).
2. When all sections are terminal but assemble/export job was lost, resume advances to assemble then export until `ready` or `partially_failed`.
3. Resume is idempotent: repeated Continue / reconciler sweeps do not duplicate destructive work or reset ready sections.
4. `POST …/resume` (or equivalent) is available with existing proposal edit/generate permissions; FE shows Continue while generation is non-terminal and idle/stuck.
5. Reconciler uses the same resume helper (no separate divergent logic); does not call `enqueueAllSections` when section rows already exist.

## Notes
- Investigation: Mongo already has checkpoints; bug is scheduling/resume, not missing progress fields.
- Ops: align local `REDIS_URL` with persistent Redis when possible; product must still work if Redis is ephemeral.
- Standard flow (not Fast-Track): BE+FE, multi-service, blueprint impact on orchestration engine.
