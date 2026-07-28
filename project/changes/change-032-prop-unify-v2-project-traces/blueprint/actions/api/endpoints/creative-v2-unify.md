# Endpoints — Creative v2 unify · change-032

Status: **planned**

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-CREATIVE-V2-01 | POST | `/api/data/projects/creative-proposals` | authenticated (+ projects.create if used elsewhere) | creative generation input (+ optional financial HTML) | `{ projectId, proposalId, runId, dnaVersionId }` | CreativeV2CreateService | planned | Works with `pipelineV3Enabled` true; no aiJobs |
| EP-PROPOSALS-05 | GET | `/api/data/proposals/:id` | authenticated | — | proposal incl. `generation` | existing | done | FE polls progress |
| EP-AIJOBS-* creative create | POST | `/api/ai-jobs`, `/stream` | — | creative | 403 when v3 on | existing | done | Keep blocked for creative; chat OK |

Optional (if FE needs light poll without full doc):

| ID | Method | Route | Notes |
|----|--------|-------|-------|
| EP-CREATIVE-V2-02 | GET | `/api/data/proposals/:id/creative-status` | optional thin `{ generationStatus, generation }` — skip if GET proposal sufficient |

## Delta

- New create route only (prefer projects controller or dedicated module wiring into ProjectsModule)
- No new BullMQ queues
