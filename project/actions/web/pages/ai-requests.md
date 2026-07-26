# Pages — Safqa Web · AI Requests

> Route: `/ai-requests`. Auth: layout + `pipeline-traces.read`. i18n: `aiRequests.*` / `layout.sidebar.aiRequests`.

### AI Requests List `PG-AIREQ-01`
- Route: `/ai-requests`
- Status: done
- Components: PrimeNG table (lazy); filters — proposalId, projectId, step, status, from/to
- Columns: label, step, model, inputTokens, outputTokens, totalCost, durationMs, status, startedAt
- Service: PipelineTracesService → EP-TRACES-01
- Guard: `pipeline-traces.read`
- Notes: empty state when no traces; refresh button

### Trace Detail Dialog `PG-AIREQ-02`
- Route: dialog on list (not separate route)
- Status: done
- Components: `p-dialog`; JSON panels for input + output; copy buttons; meta (model, tokens, cost, duration, error)
- Service: EP-TRACES-02
- Guard: same
- Notes: pretty-print JSON

### Cost Dashboard + Proposal Summary `PG-AIREQ-03`
- Route: top section of `/ai-requests` (same page)
- Status: done
- Components:
  - When `proposalId` filter set → summary card from EP-TRACES-03
  - Cost charts from EP-TRACES-04: cost by day (line), by model (doughnut); date range shared with list
- Service: EP-TRACES-03, EP-TRACES-04; Chart.js / ng2-charts
- Guard: same

## Nav

- Sidebar under Tools (near AI Jobs): `layout.sidebar.aiRequests`
