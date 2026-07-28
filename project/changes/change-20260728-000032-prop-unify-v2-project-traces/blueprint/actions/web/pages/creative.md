# Pages — Creative unify · change-20260728-000032

Status: **planned**

### PG-CREATIVE-01 · `/creative`

- Re-enable generate when unified v2 API is available (even if `pipelineV3Enabled` is true).
- Banner: optional note that Projects (v3 templates) vs Creative (final HTML) are both valid; remove “disabled / go to Projects only” hard block.
- `generate()` → `CreativeProposalGenerationService` → **EP-CREATIVE-V2-01** (not `POST /ai-jobs`).
- On success: navigate to proposal view/edit or output with `proposalId` (prefer `/proposals/:id/view` or existing output flow updated to proposal-centric).
- Progress: poll `GET /api/data/proposals/:id` for `generation` / `generationStatus` (not `ai-jobs/:jobId`) for new runs.

### CreativeProposalGenerationService

- Batch path: call unified create; stop FE `saveProposal` + `createCreativeJob` pairing for new runs.
- Regenerate from archive/edit: if updating existing proposal, either (a) call unified create as new proposal under same/new project, or (b) re-run batch on existing proposal id — prefer **new proposal under same project** or explicit regenerate endpoint; minimum: do not create aiJobs.
- Stream path (`maxTokens <= 1000`): route through same create + server-side stream/batch if feasible; else defer stream and always use batch via unified API (document in Notes if deferred).

### Archive list pending

- For rows with `pipelineVersion === "2"` and `generationStatus === "pending"`: poll proposal (or creative-status), not `jobId`.
- Legacy rows with `jobId` and no `pipelineVersion: "2"` generation: keep `subscribeToJob(jobId)` until drained.

## Delta

- Soft-retire UX lifted for unified path
- JobId polling only for legacy
