# Data Model — Delta (REQ-PROP-V3 Phase 3)

## Delta

| Entity | Action |
|--------|--------|
| `proposals` | **Add** `sections[]`, `renderedByLang`; **extend** `generation` |
| `settings` | **Add** `pipelineV3Enabled` (boolean, default false) |
| `projects` | unchanged shape; enqueue gated by flag |

---

## proposals _(additive)_

### `sections[]` (Step 3 output)

```jsonc
{
  "instanceId": "sec_01",
  "key": "cover",
  "order": 1,
  "status": "pending" | "running" | "ready" | "failed",
  "attempts": 0,
  "error": null | { "code", "message" },
  "contentByLang": {
    "ar": { /* AJV vs catalog contentSchema */ }
  }
}
```

### `renderedByLang` (Steps 4–5)

```jsonc
{
  "ar": {
    "htmlUrl": "https://…",
    "pdfUrl": "https://…",
    "htmlKey": "…",
    "pdfKey": "…",
    "assembledAt": "ISO",
    "exportedAt": "ISO"
  }
}
```

### `generation` (extended)

```jsonc
{
  "pipelineVersion": "3",
  "status": "queued" | "analyzing" | "mapping" | "generating_sections"
         | "assembling" | "exporting" | "ready" | "failed" | "partially_failed",
  "language": "ar",
  "runId": "uuid",
  "steps": {
    "dna": { "status": "done|…", "attempts": 0 },
    "map": { "status": "done|…", "attempts": 0 },
    "sections": {
      "status": "pending|running|done|failed|partial",
      "total": 14,
      "completed": 12,
      "failed": [{ "instanceId": "sec_07", "error": "…" }]
    },
    "assembly": { "status": "pending|running|done|failed", "attempts": 0 },
    "export": { "status": "pending|running|done|failed", "attempts": 0 }
  },
  "error": null | { "code", "message" }
}
```

**Rules**
- Mongo = truth; Redis = work. Workers skip if unit already `ready`/`done`.
- If any section `failed` but ≥1 `ready`: after assemble/export → `partially_failed` (Ready with gaps); all failed with none ready → `failed` (no assemble).
- Financial money slots overwritten at assemble from `proposal.services` / financials — never from AI.

---

## settings _(additive)_

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `pipelineV3Enabled` | Boolean | `false` | When false, `POST …/projects/:id/proposals` returns 403/409 or clear error and does not enqueue v3 (legacy `/ai-jobs` unchanged) |
