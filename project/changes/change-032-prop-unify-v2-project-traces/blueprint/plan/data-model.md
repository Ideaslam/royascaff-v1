# Data model — v2 generation on proposals · change-032

## Entity — proposals (`pipelineVersion: "2"`)

Shared shell (change-031) plus:

| Field | After-state |
|-------|-------------|
| `pipelineVersion` | `"2"` for new creative-engine runs |
| `projectId` | required on new creates → `projects` |
| `dnaVersionId` / `dnaSnapshot` | set at create (DNA v1 from project inputs; no AI DNA required) |
| `creativeOptions` | v2 wizard inputs (engine-specific) |
| `jobId` | **null** on new creates (legacy rows may keep) |
| `generationStatus` | `pending` → `completed` (or leave pending on fail + `generation.status: failed`) |
| `generation` | see below |

### `generation` (Pipeline v2)

```jsonc
{
  "pipelineVersion": "2",
  "status": "queued" | "sections_batch_submitted" | "sections_ready"
           | "final_render_submitted" | "assembling" | "ready" | "failed",
  "language": "ar" | "en",
  "runId": "uuid",
  "batchId": null, // optional top-level active batch (or only under creativePipeline)
  "creativePipeline": { /* CreativePipelineState — same shape as today on aiJobs */ },
  "error": null | { "code", "message" },
  "updatedAt": "ISO"
}
```

`CreativePipelineState.pipelineVersion` stays `"2"` (engine marker). Artifact S3 keys prefer `proposals/{proposalId}/…` (or existing quotations path keyed by proposalId).

### List / poller query

Pending v2 batches: `pipelineVersion: "2"` AND `generation.status` in non-terminal batch-wait states AND (`generation.creativePipeline.sectionBatchId` OR `htmlBatchId` OR `generation.batchId`) set.

## Entity — pipelineTraces

No schema change. New rows for v2 with `projectId`, `proposalId`, `runId`, `step` labels e.g. `creative_v2.sections_batch`, `creative_v2.html_batch`, `creative_v2.repair`, validations.

## Entity — aiJobs

- No new **creative** rows from unified create.
- Chat / non-creative unchanged.
- In-flight creative rows remain readable/processable until drained.

## Delta

- Document v2 `generation` after-state on proposals
- New creates: `jobId` null; identity via project/DNA
- Traces for v2 AI; backfill script for legacy shell (separate script notes)
