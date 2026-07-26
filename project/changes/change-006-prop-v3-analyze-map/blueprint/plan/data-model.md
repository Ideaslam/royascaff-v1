# Data Model — Delta (REQ-PROP-V3 Phase 2)

## Delta

| Entity | Action |
|--------|--------|
| `projects` | **Use** existing Phase 0 shape; fill `rfp`, `images`, `dna` at runtime |
| `proposals` | **Add** fields below (schema-less; no migration) |
| `pipelineTraces` | **Use** as-is for AI call logging |

---

## proposals _(additive fields)_

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `projectId` | String | required for v3 pipeline proposals | → projects |
| `templateKey` | String | e.g. `pitch-landscape` | → templates.key |
| `templateVersion` | Number | pinned | — |
| `language` | String | `ar` \| `en` (generation language) | — |
| `dnaVersion` | Number | copied from project.dna.version when mapped | — |
| `sectionMap` | Object | `schemaVersion: map.v1` + `sections[]` | Step 2 output |
| `generation` | Object | see below | pipeline truth |

### `generation` (Phase 2 subset)

```jsonc
{
  "pipelineVersion": "3",
  "status": "queued" | "analyzing" | "mapping" | "mapped" | "failed",
  "language": "ar",
  "runId": "uuid",
  "steps": {
    "dna": { "status": "pending|running|done|failed", "startedAt?", "finishedAt?", "attempts": 0 },
    "map": { "status": "pending|running|done|failed", "startedAt?", "finishedAt?", "attempts": 0 }
  },
  "error": null | { "code", "message" }
}
```

> Phase 3 extends status with `generating_sections` | `assembling` | `exporting` | `ready` | `partially_failed` and more `steps.*`.

**Rules:** Redis jobs are work; Mongo `generation` + `projects.dna` + `proposal.sectionMap` are truth. Workers skip if step already `done`.

---

## projects.rfp / images _(runtime fill)_

| Field | Notes |
|-------|--------|
| `rfp.fileKey` / `extractedTextKey` | S3 keys under `projects/{id}/…` |
| `rfp.status` | `parsed` \| `failed` \| null |
| `images[]` | `{ id, url, name, userNote? }` after upload |
| `dna` | `{ version, generatedAt, model, schemaVersion: "dna.v2", data }` after analyze |
