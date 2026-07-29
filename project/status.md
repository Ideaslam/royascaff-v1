# Project Status

_Last updated: 2026-07-29 — after change-20260729-113947 banner/gallery visual sections merge_

## Snapshot

| App | Services | Endpoints | Pages/Views | Overall |
|-----|----------|-----------|-------------|---------|
| api | 87/89 | 138/139 | — | partial |
| web | — | — | 36/36 | partial |

> Web overall `partial` only for remaining product gaps (AI stubs / vision). **REQ-R 3/3**, **REQ-PROP-V3**, **REQ-PROP-UNIFY** merged.

## By Module

| Module | Services | Endpoints | Pages/Views | Status |
|--------|----------|-----------|-------------|--------|
| Auth | 9/9 | 13/13 | 5/5 | done |
| Users | 1/1 | 7/7 | 1/1 | done |
| Clients | 1/1 | 8/8 | 1/1 | done |
| Services | 1/1 | 6/6 | 2/2 | done |
| Service Categories | 1/1 | 6/6 | 1/1 | done |
| Proposals | 6/6 | 20/20 | 6/6 | done |
| Projects | 4/4 | 23/23 | 5/5 | done |
| Creative / AI Jobs | 7/7 | 5/5 | 2/2 | done |
| Pipeline v3 Foundations | 8/8 | 2/2 | — | done |
| Pipeline Analyze + Map | 6/7 | — | — | partial |
| Pipeline Sections + Engine | 9/9 | — | — | done |
| Pipeline Regen + Translate | 6/6 | — | — | done |
| Pipeline Traces | 2/2 | 4/4 | 3/3 | done |
| Cutover Backfill | 1/1 | — | — | done |
| Templates | 10/10 | 2/2 | — | done |
| AI | 3/4 | 3/4 | 1/1 | partial |
| Contracts | 1/1 | 9/9 | 2/2 | done |
| Roles | 1/1 | 7/7 | 1/1 | done |
| Permissions | 2/2 | 6/6 | (w/ roles) | done |
| Settings | 3/3 | 4/4 | 1/1 | done |
| Layout | — | — | 1/1 | done |
| Config | — | 1/1 | — | done |
| Public | 1/1 | 2/2 | 1/1 | done |
| Admin | 2/2 | 11/11 | — | done |
| Integrations | 5/5 | — | — | done |
| Infrastructure | 3/3 | — | — | done |
| PDF Export | (assemble/export path) | — | — | done |
| Dashboard | — | — | 1/1 | done |
| Maintenance | — | — | 1/1 | done |
| Profile | — | — | 1/1 | done |

## In Progress (`partial`)

- api · AI · SVC-AI-04 / EP-AI-02 — OpenAI stub throws "not configured"
- api · Pipeline Analyze + Map · SVC-PIPE-AM-07 — vision 1b partial (traced skip)

## Next Up (roadmap, ordered)

1. Optional: seed `service.*` / `contract.*` permission keys + guards (deferred from change-20260726-000002)
2. Remaining deferred roadmap items (auth already restored; see Deferred table)

## Deferred (`deferred`)

| Artifact | App · Module | Reason | Revisit when |
|----------|--------------|--------|--------------|
| Full retire `/projects/:id/edit` + workspace shell dialog | web · Projects | DNA form is primary; legacy edit kept | follow-up DNA pack |
| Structured DNA content editor UI | web · Projects | PUT content API done; FE inputs-only | follow-up DNA pack |
| OpenAI / Gemini providers | api · AI | stubs / not configured | product decides multi-provider |
| Hard delete v2 poller / creative-pipeline | api · Creative | soft cutover done; keep for quiet period | after quiet traffic |
| Admin cross-workspace traces | api · Pipeline Traces | workspace-scoped only in v1 | later admin pack |
| Vision 1b full | api · Pipeline | partial skip in Phase 2 | later PROP-V3 / polish pack |
| Full formal disk theme | api · Templates | catalog tokens + shared assets | design pack |
| Remaining §5.6 non-research keys (opportunities, swot, channel_strategy, toc, …) | api · Templates | research + testimonial + visual banner/gallery shipped | later template packs |
| Structured section editor | web · Proposals | out of v1 | later PROP pack |
| Remove unused FE pdf deps | web | investigate first | cleanup sprint |
