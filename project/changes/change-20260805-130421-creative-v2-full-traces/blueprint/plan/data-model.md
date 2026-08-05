# Data model — Creative v2 traces · change-20260805-130421

Status: **done**

No new collections or fields. Observability remains on `pipelineTraces` with `step: "creative_v2"`.

Trace ids already on `proposal.generation.creativePipeline`:
- `sectionsBatchTraceId`
- `htmlBatchTraceId`
- `repairBatchTraceId`
- `*BatchStartedAt` ISO timestamps

## Expected labels (after-state)

### AI calls (`action: ai_call`, model set)

| Label | When |
|-------|------|
| `creative_v2.sections_batch` | Section Message Batch submitted |
| `creative_v2.html_batch` | Final HTML Message Batch submitted |
| `creative_v2.html_repair` | Optional repair Message Batch submitted |

Terminal status must be `success` or `failed` once the proposal generation is terminal — never leave `retrying`/`inprogress` after fail/complete.

### Actions / phases

| Label | When |
|-------|------|
| `creative_v2.created` | Proposal + run created |
| `creative_v2.sections_batch_submitted` | Sections batch id persisted |
| `creative_v2.sections_ready` | Sections collected OK |
| `creative_v2.page_input_ready` | page_input built + validated |
| `creative_v2.html_batch_submitted` | HTML batch id persisted (new if missing) |
| `creative_v2.html_generated` | HTML text collected |
| `creative_v2.html_repair_submitted` | Repair batch submitted |
| `creative_v2.html_repaired` | Repair collected |
| `creative_v2.uploaded` | S3 upload done |
| `creative_v2.completed` | Pipeline success |
| `creative_v2.failed` | Any terminal failure (poller or orchestrator) with reason in error/meta |

### Validations (existing)

- `creative_v2.section_validation`
- `creative_v2.page_input_validation`
- `creative_v2.html_validation`

## Delta

- Document full label set; add `creative_v2.html_batch_submitted` + `creative_v2.failed` as required observability labels
- No schema migration
