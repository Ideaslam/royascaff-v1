# Pages — Safqa Web · AI Requests

> Route: `/ai-requests`. Auth: layout + `pipeline-traces.read`. i18n: `aiRequests.*` / `layout.sidebar.aiRequests`.

### AI Requests List `PG-AIREQ-01`
- Route: `/ai-requests` (requests view)
- Status: done
- Components:
  - KPI cards (calls, tokens in/out/all, cost) from list `stats` for active filters
  - Lazy `p-table`; columns include project name, label, step, model, tokens, cost, duration, status, date
  - Filters: proposalId, projectId, **callType** (All / AI / Non-AI), step, status, from/to
  - Selected-project header chip shows project **name** + id
  - Deep-link: on init read `?projectId` / `?proposalId` → requests view with filters applied
- Service: `PipelineTracesService.list` → EP-TRACES-01; project names via `ProjectsService`
- Guard: `pipeline-traces.read`
- Notes: filters refresh page 1 + stats together; traces list default sort unchanged

### Trace Detail Dialog `PG-AIREQ-02`
- Route: dialog on list (not separate route)
- Status: done
- Components: `p-dialog`; JSON panels; meta includes project name + id, model, tokens, cost, duration, error
- Service: EP-TRACES-02
- Guard: same

### Projects overview + workspace totals `PG-AIREQ-03`
- Route: default view of `/ai-requests`
- Status: done
- Components:
  - Workspace KPI cards from EP-TRACES-04 `totals`
  - Projects table: name+id, **project createdAt**, client, proposal count, last AI activity, pipeline version, calls, tokens, total cost
  - Actions: drill into requests + open `/projects/:id`
  - Default order: `projectCreatedAt` desc (from API)
  - No cost-by-day / cost-by-model charts (removed)
- Service: EP-TRACES-04 enriched `byProject`
- Guard: same

## Nav

- Sidebar: `layout.sidebar.aiRequests` when `pipeline-traces.read` (no AI Jobs nav)
