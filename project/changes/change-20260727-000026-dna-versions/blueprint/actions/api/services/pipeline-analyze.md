# Services — Pipeline v3 · DNA version pin (pack after-state)

### SVC-PIPE-ANALYZE · AnalyzeOrchestratorService
- Status: planned
- Behavior (after-state):
  - Job payload includes `workspaceId`, `projectId`, **`dnaVersionId`**, optional `proposalId`, `runId`
  - Load **DNA version** (not project inputs): `info`, `rfp`, `images`, `colorPalette`, `services` as needed for skeleton
  - `buildDnaSkeleton(versionInputs, client)` + branding resolve from version palette / client_logo
  - On success: write `version.dna` (`data`, `generatedAt`, `runId`, `regenerating: false`), `status: ready`
  - On failure: `regenerating: false`, `status: failed`, `data` null (keep empty version); mark proposal generation failed if `proposalId`
  - Chain map only when `proposalId` present (unchanged gating)

### SVC-PIPE-QUEUE · PipelineQueueService
- Status: planned
- Changes:
  - `enqueueAnalyze` requires `dnaVersionId`
  - `isStepAlreadyDone` for analyze: version has `dna.data` (or proposal snapshot), not `projects.dna.data`

### SVC-PIPE-MAP / SECTION / ASSEMBLE / REGEN
- Status: planned
- Resolve DNA + images + branding colors:
  1. `proposal.dnaSnapshot.dna.data` if present
  2. else load `project_dna_versions` by `proposal.dnaVersionId`
  3. fail clearly if neither (deleted version without snapshot — should not happen for post-pack creates)
- Assemble financials: prefer proposal.services (copied at create from version); images from snapshot when needed for resolveImage

## Delta

- Analyze read/write target = DNA version document
- Queue + idempotency keyed by `dnaVersionId`
- Downstream pipeline snapshot-first resolution
- Clear regenerating on failure (fix latent bug for versions)
