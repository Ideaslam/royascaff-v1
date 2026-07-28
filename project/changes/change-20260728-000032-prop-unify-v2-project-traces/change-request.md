# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-UNIFY
- **part**: 2/3
- **depends-on**: change-20260728-000031
- **blocks**: change-20260728-000033 (planned)
- **pack-status**: merged

## Scope
- Module(s): Creative Pipeline v2, Projects, Proposals, Pipeline Traces, Jobs poller
- Feature(s): Unified identity for v2 creates (project + DNA + proposal); generation state on `proposal.generation`; AI observability via `pipelineTraces`; stop new creative `aiJobs` writes; one-time backfill
- Endpoint(s): new creative-v2 create (projects-adjacent); dual poller for pending v2 proposals; keep chat `aiJobs`
- Page(s)/View(s): web `/creative` (+ archive regenerate paths that call creative generate)
- Service(s): new creative-v2 create orchestration; `processCreativePipelineAfterBatch` proposal-centric; `PipelineTraceService` hooks; FE `CreativeProposalGenerationService`

## Description

Keep **two engines** (v2 section→final HTML; v3 template pipeline) on the **same collections**: `projects`, `project_dna_versions`, `proposals`, `pipelineTraces` (+ clients/services/contracts).

**This pack (2/3):**
1. New v2 create path: map creative input → `ProjectsDataService.create` + DNA v1 + proposal with `pipelineVersion: "2"`, shared shell fields, `creativeOptions`, `generation` (holds former `aiJobs.creativePipeline` + `runId` / batch ids).
2. Run existing creative-pipeline section→HTML engine against that proposal (no BullMQ / no template map).
3. Poll pending v2 batches from **proposals** (dual-mode with legacy `aiJobs` until in-flight jobs drain).
4. Emit `pipelineTraces` for v2 AI boundaries (batch submit/complete, repair, validations).
5. Stop **new** creative writes to `aiJobs` (`POST /ai-jobs` creative stays blocked or unused); chat-type jobs unchanged; no hard-delete of `aiJobs`.
6. Re-enable `/creative` UX against the unified API (works with `pipelineV3Enabled: true`).
7. One-time backfill script: orphans → `projectId` + DNA + `pipelineVersion: "2"` where appropriate.

**Out of scope:**
- Migrate v2 onto BullMQ / v3 template sections
- Contracts services ID normalization → **Part 3**
- Hard-delete `aiJobs` / remove poller forever
- Full SOLID module extraction

## Acceptance Criteria

1. Creating via `/creative` (or equivalent) with v3 flag **on** creates `projects` + `project_dna_versions` + `proposals` (`pipelineVersion: "2"`, `projectId`, `dnaVersionId`, `creativeOptions`, money/services shell) and does **not** create a new creative `aiJobs` row.
2. v2 section→HTML engine still produces technical + financial HTML / URL maps; proposal reaches `generationStatus: completed` (or failed with error on `generation`).
3. Progress/completion no longer requires `proposal.jobId` for new runs; archive can observe `generation` / proposal status (legacy `jobId` rows still finish via dual poller).
4. New v2 AI work appears in `pipelineTraces` (at least repair + batch/action traces keyed by `proposalId`/`runId`/`projectId`).
5. Chat / non-creative `aiJobs` still work.
6. In-flight creative `aiJobs` (if any) still complete via legacy poller branch.
7. One-time backfill script (dry-run + apply) sets `projectId` (+ DNA when missing) and `pipelineVersion: "2"` for legacy non-v3 proposals lacking shell fields.
8. Completed v2 proposals remain editable/viewable in archive (change-20260728-000031 consumers).

## Notes (optional)

- Depends on change-20260728-000031 merged (archive parity).
- Soft-retire of creative `/ai-jobs` create remains; unified path is the escape that keeps v2 engine alive.
- Stream low-token creative path: prefer same unified create, or keep rare stream on aiJobs only if explicitly deferred in pack.
