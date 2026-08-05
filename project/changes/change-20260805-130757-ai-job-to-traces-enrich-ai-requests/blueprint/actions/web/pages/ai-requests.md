# Pages — AI Requests · change-20260805-130757

> Route: `/ai-requests`. Auth: layout + `pipeline-traces.read`. i18n: `aiRequests.*`.

### AI Requests List `PG-AIREQ-01`
- Route: `/ai-requests` (requests view)
- Status: planned (light modify)
- Components: existing table/filters/stats
- Deep-link:
  - On init, read `ActivatedRoute` query `projectId` and `proposalId`
  - If `projectId` present → set filters, switch to **requests** view, load list (same as `openProject`)
  - If only `proposalId` → requests view with proposal filter
- Guard: `pipeline-traces.read`
- Notes: traces list default sort **unchanged**

### Trace Detail Dialog `PG-AIREQ-02`
- Status: done (unchanged)

### Projects overview + workspace totals `PG-AIREQ-03`
- Route: default view of `/ai-requests` (no project filter in query)
- Status: planned
- Components:
  - Workspace KPI cards from EP-TRACES-04 `totals` (unchanged)
  - Projects table columns (after-state):
    1. Project name (+ id muted)
    2. **Project created datetime** (`projectCreatedAt`) — primary identity cue
    3. Client name
    4. Proposal count
    5. Last AI activity (`lastActivityAt`)
    6. Pipeline version (when present)
    7. Calls / tokens / total cost (existing)
    8. Actions: drill into requests (existing) + **open project** → `/projects/:id` (stopPropagation)
  - Default order: API `byProject` already sorted by `projectCreatedAt` desc; FE must not re-sort by cost
- Service: EP-TRACES-04 enriched `byProject`; optional `ProjectsService` only as fallback for names
- Guard: same

### FE types
- `ProjectTraceSummary` includes optional: `projectCreatedAt`, `clientName`, `lastActivityAt`, `proposalCount`, `pipelineVersion`, `projectName`

## Delta

- Query-param deep-link for proposal Open.
- Projects overview: createdAt + helpers; trust API sort desc by createdAt.
- i18n for new column headers (en/ar).
