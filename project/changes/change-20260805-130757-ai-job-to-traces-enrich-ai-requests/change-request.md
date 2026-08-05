# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-AI-OBS
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Proposals list; AI Requests / pipeline-traces; Admin AI Jobs diagnostics; Web nav
- Feature(s): Route proposal “AIJob Open” to AI Requests; retire AI Jobs UI + admin list/detail APIs; enrich AI Requests projects overview (project createdAt + identifiers); default sort by project createdAt desc
- Endpoint(s): modify EP-TRACES-04 (projects summary); remove admin `GET /admin/ai-jobs` + `GET /admin/ai-jobs/:id`; keep chat/legacy `POST|GET /api/ai-jobs*` for remaining job types
- Page(s)/View(s): `web`: Proposals list; AI Requests (projects overview); remove AI Jobs list + details; sidebar
- Service(s): PipelineTraceService / summary; Projects enrichment; AiJobsAdminService (retire admin surface)

## Description

**Problem:** Creative proposals still expose an **AIJob → Open** control that navigates to the legacy `/ai-jobs/:id` page. New creative work is project + DNA + proposal + `pipelineTraces`, so that link is often disabled (`jobId` null) or points at the wrong observability surface. Operators need a fast path from a proposal to **AI Requests** filtered by that project (and proposal when available). The standalone **AI Jobs** admin page is obsolete for this workflow. On AI Requests, the projects overview lacks **project created datetime** and other identifying fields, so finding a recent project is hard.

**Outcome:**
1. On **Proposals** list, replace **AIJob Open** with a control that navigates to `/ai-requests` with query filters `projectId` (required when present) and `proposalId` when available. Label/column rename to reflect AI Requests / traces (not AIJob). Disable when neither `projectId` nor useful filter can be applied (legacy job-only rows may show disabled or omit).
2. **Remove AI Jobs page** from the web app: routes `/ai-jobs` and `/ai-jobs/:id`, sidebar entry, and FE services used only by that page. Remove **admin** list/detail endpoints `GET /api/admin/ai-jobs` and `GET /api/admin/ai-jobs/:id` (and admin service surface used only for them). **Keep** core `/api/ai-jobs` create/get/stream (and poller) for chat / any remaining non-observability job usage — do not hard-delete `aiJobs` collection or chat job path.
3. On **AI Requests → Projects overview**, add identifying columns; **most important: project `createdAt` datetime**. Also include helpful fields already agreed as useful: client name (when available), proposal count (and/or primary proposal id if cheap), last AI activity time, pipeline version hint if available, and a link/action to open the project page. Enrich EP-TRACES-04 / summary payload as needed (join projects for `createdAt` / client — no new entity).
4. Default sort for **Projects overview only**: `project.createdAt` **desc**. Requests (traces) list sort remains unchanged (trace `startedAt` / existing behavior).

**Out of scope:**
- Hard-delete of `aiJobs` / `aiJobQueue` collections or dual poller for in-flight legacy creative
- Changing Technical / Financial / Status actions on Proposals
- Default sort on the AI Requests **traces** list
- Cost charts / unrelated AI Requests KPI changes

## Acceptance Criteria
1. Proposals list “Open” (former AIJob) navigates to `/ai-requests` with `projectId` query param when the row has a project; includes `proposalId` when available.
2. Navigating that link lands on AI Requests with the project filter applied (requests view for that project, or equivalent existing deep-link behavior).
3. FE routes `/ai-jobs` and `/ai-jobs/:id` and sidebar “AI Jobs” are removed; no remaining nav entry to the retired page.
4. `GET /api/admin/ai-jobs` and `GET /api/admin/ai-jobs/:id` are removed (or return gone); FE no longer calls them.
5. Chat / core `/api/ai-jobs` create-get-stream path remains available for non-admin use.
6. AI Requests projects overview shows **project created datetime** prominently, plus agreed helper columns (client name, proposal count and/or id, last AI activity, project open link; pipeline version when available).
7. Projects overview default ordering is **project createdAt descending**.
8. Traces list default sort/behavior is unchanged.

## Notes (optional)
- Screenshot attached to the request is the **Proposals** table (Client / Creative / Amount / AIJob Open), not `/ai-requests`.
- Deep-link: AI Requests should read `projectId` / `proposalId` from route query on init (add if missing today).
- Admin API removal is UI/diagnostics only; do not break chat job creation.
