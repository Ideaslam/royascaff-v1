# Services — Creative v2 unify · change-032

Status: **planned**

### SVC-CREATIVE-V2-01 · CreativeV2CreateService [domain, Projects/Proposals]

- `createFromCreativeInput(workspaceId, userId, input)`:
  1. Map creative input → project body (`name`, `clientId`, `info`, `services`, `colorPalette`, …)
  2. `ProjectsDataService.create` → project + DNA v1
  3. Build `dnaSnapshot` from DNA version
  4. Insert proposal: `pipelineVersion: "2"`, `type: "creative"`, shell money/services, `creativeOptions`, `generationStatus: "pending"`, `jobId: null`, `generation: { pipelineVersion:"2", runId, status, language, creativePipeline }`
  5. Hydrate input (client DB) → `prepareCreativeSectionBatch` → submit Claude batch
  6. Persist `generation.creativePipeline` + batch ids on proposal; `traceAction` / `traceAiCall` for batch submit
  7. Return `{ projectId, proposalId, runId, dnaVersionId }`
- Rules: **allowed when `pipelineV3Enabled` is true**; does not call `createProposalFromProject` (v3); does not write aiJobs
- Side effects: Claude batch, S3 artifacts later, Mongo writes, traces

### SVC-CREATIVE-V2-02 · Process after batch (proposal-centric) [domain, Creative]

- Adapt `processCreativePipelineAfterBatch` (and deps) to load/update proposal by id:
  - read/write `generation.creativePipeline` instead of aiJobs doc
  - on success: technical/financial URL maps + inline as today; `generationStatus: "completed"`; `generation.status: "ready"`
  - on fail: `generation.status: "failed"` + error
- Inject `PipelineTraceService` for repair AI + validation + batch complete
- Keep function core (sections → page → HTML → validate/repair → upload)

### SVC-CREATIVE-V2-03 · Dual poller [infrastructure, Jobs]

- Existing aiJobs pending-batch poll **kept** for in-flight legacy creative jobs
- **Add** proposals pending v2 batch list → same process path with proposal id
- Do not break chat queue processing

### SVC-CREATIVE-V2-04 · Backfill script [ops]

- Extend or add `scripts/backfill-v2-proposal-shell.js` (dry-run / `--apply` / `--workspaceId`):
  1. Proposals missing `projectId` → create project (reuse legacy backfill logic)
  2. Ensure DNA version + pin `dnaVersionId` when missing
  3. If not v3-shaped (`pipelineVersion !== "3"` and no `sectionMap`/`templateKey` engine fields forcing v3) → set `pipelineVersion: "2"` when null
- Does not migrate in-flight aiJobs state onto generation

## Delta

- New create service + proposal-centric batch completion + dual poller + traces + backfill
- Engine algorithms unchanged
