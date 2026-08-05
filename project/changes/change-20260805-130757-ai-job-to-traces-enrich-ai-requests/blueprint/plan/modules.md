# Modules — delta · change-20260805-130757

> After-state slices for Creative / Admin / AI Requests observability. Merge in-place into main `project/plan/modules.md`.

## 6. Creative / AI Generation — Feature updates

4. **Job Monitoring** [backend-only] — chat / residual job APIs via `/api/ai-jobs*` (create/get/stream + poller). **No** dedicated FE `/ai-jobs` list/details; creative observability is **AI Requests** (`pipelineTraces`).
17. **Primary paths (FE)** [frontend-only] — Projects = v3 templates; `/creative` = v2 final HTML (unified API); proposal list **Open** → `/ai-requests?projectId&proposalId` (not `/ai-jobs`)

## 10. Admin — Feature updates

2. **Admin AI Job Diagnostics** — **removed**. Observability for creative/pipeline runs is AI Requests (`pipeline-traces.read`). Do not expose `GET /api/admin/ai-jobs` or `/:id`.

## 14. AI Requests / Pipeline Traces — Feature updates

6. **AI Requests page** [frontend-only] — projects overview with KPI cards + **project createdAt** (default sort desc) + client name, proposal count, last AI activity, open-project link, pipeline version when available; requests view with filters + deep-link from `?projectId&proposalId`; detail dialog
7. **Nav entry** [frontend-only] — `/ai-requests` when `pipeline-traces.read`; **no** sidebar link to `/ai-jobs`

## Delta

- Retire FE Job Monitoring pages and Admin AI Job Diagnostics endpoints.
- Point proposal Open + primary FE paths at AI Requests.
- Enrich AI Requests projects overview (createdAt + helpers + sort).
