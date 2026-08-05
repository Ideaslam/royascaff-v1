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
- Notes: filters refresh page 1 + stats together; traces list default sort unchanged. Human-facing label for status `retrying` is **`inprogress`** (table tag + filter option label); filter `value` remains `retrying` so list API query is unchanged; severity for `retrying` stays `warn`.

### Trace Detail Dialog `PG-AIREQ-02`
- Route: dialog on list (not separate route)
- Status: done
- Components:
  - Wide `p-dialog` (`min(1100px, 96vw)`) with scrollable content (~82vh)
  - Meta in two cards — **Overview** (project name/id, proposalId, step, action, runId) and **Metrics** (status tag, model, tokens, cost, duration); long IDs wrap on wide rows
  - Error strip when present; JSON blocks (input / output / validation / full record) with Copy + tall scroll panels; `app-json-tree` for nested readability
  - i18n: `aiRequests.detailIdentity` / `detailMetrics`
- Service: EP-TRACES-02
- Guard: same
- Notes: visual polish only (change-20260805-140002); same fields/bindings as before

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
