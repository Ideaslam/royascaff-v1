# Verification — AI Job → AI Requests + enrich projects overview

## Plan Consistency
- [x] EP-TRACES-04 enrichment in pack endpoints
- [x] SVC-TRACES-02 enrich + sort in pack services
- [x] EP-ADMIN-02/03 removal in pack admin endpoints
- [x] Proposals / AI Requests / AI Jobs page slices match request
- [x] modules.md observability note in pack plan
- [x] Recon findings reflected (chat `/api/ai-jobs` kept)

## Code Verification
- [x] `aggregateCostSummary` adds `lastActivityAt` + proposal ids; service enriches project meta and sorts by `projectCreatedAt` desc
- [x] Admin `GET /admin/ai-jobs` and `/:id` removed; `AiJobsAdminService` deleted
- [x] Core `/api/ai-jobs` via `AiService` / `AiJobsService` still present
- [x] Proposals Open → `/ai-requests?projectId&proposalId` when `projectId` set
- [x] AI Requests deep-link from query params; projects table shows createdAt + helpers
- [x] AI Jobs routes/sidebar/pages removed; admin FE client methods removed
- [x] API `tsc --noEmit` PASS; FE `ng build --configuration=local` PASS
- [x] Layering preserved; no hardcoded external URLs

## Acceptance criteria
1. Proposals Open → AI Requests with projectId (+ proposalId) — PASS
2. Deep-link applies filters / requests view — PASS (query on init)
3. `/ai-jobs` routes + sidebar removed — PASS
4. Admin ai-jobs endpoints removed; FE no longer calls them — PASS
5. Chat `/api/ai-jobs` kept — PASS
6. Projects overview shows project createdAt + helpers — PASS
7. Projects overview default order createdAt desc — PASS (API sort)
8. Traces list sort unchanged — PASS (not modified)

## Result: PASS

## Overall: PASS
