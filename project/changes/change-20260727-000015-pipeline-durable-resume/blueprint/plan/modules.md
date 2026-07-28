# Modules & Features — Delta (REQ-PROP-V3 · durable resume)

## Delta

### AI Jobs / Pipeline v3 — Orchestration engine

**After-state feature (replace/extend feature 13):**

13. **Orchestration engine** [backend-only] — Mongo fan-in after sections; idempotent workers; reconciler ~60s; **durable resume from Mongo checkpoints** when Redis/app interrupted

**New / clarified behaviors:**

19. **Durable resume** [both] — Shared `resumeProposal` status machine: Mongo is source of truth; Redis jobs are disposable. Re-enqueues only incomplete work; never wipes `sections[].status === ready`. Explicit `POST …/resume` + FE Continue; reconciler calls the same helper.

## Resume status machine (normative)

Given proposal `generation.pipelineVersion === "3"` and non-terminal (or terminal with incomplete assemble/export — see notes):

| `generation.status` | Action |
|---------------------|--------|
| `queued` \| `analyzing` | Enqueue `pipeline.analyze` (idempotent via `isStepAlreadyDone`) |
| `mapping` | Enqueue `pipeline.map` |
| `mapped` | If `sections[]` empty → `enqueueAllSections`; else treat as `generating_sections` |
| `generating_sections` | Reset orphaned `running` → `pending`; enqueue each section with status ∈ `{pending, running, failed}` (leave `ready`); if all sections terminal → enqueue assemble |
| `assembling` | Enqueue assemble (idempotent) |
| `exporting` | If staging present → export; else assemble first |

**Hard rules:**

- Do **not** call `enqueueAllSections` when section rows already exist.
- Ready section content and `contentByLang` must be preserved.
- Resume is idempotent under concurrent Continue + reconciler sweep.
- Section job skip-when-ready must still invoke fan-in (`maybeFanIn`) so assemble is not skipped.

## Out of scope

- Regenerating from DNA / template switch (existing regen flows)
- Changing BullMQ attempt/backoff defaults (optional jobId later)
- Migrating v2 creative jobs
