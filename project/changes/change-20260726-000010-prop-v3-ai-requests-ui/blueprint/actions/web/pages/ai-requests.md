# Pages — Safqa Web · AI Requests

## Delta

- **Create** PG-AIREQ-01..03
- Route: `/ai-requests`
- Auth: layout + `*appHasPermission="'pipeline-traces.read'"`
- i18n: `aiRequests.*`

---

### AI Requests List `PG-AIREQ-01`
- Route: `/ai-requests`
- Status: done
- Components: PrimeNG table (lazy); filters — proposalId, projectId, step, status, from/to; optional model client-filter
- Columns: label, step, model, inputTokens, outputTokens, inputCost, outputCost, totalCost, durationMs, status, startedAt
- Service: PipelineTracesService → EP-TRACES-01
- Guard: `pipeline-traces.read`
- Notes: empty state when no traces; refresh button

### Trace Detail Dialog `PG-AIREQ-02`
- Route: dialog on list (not separate route)
- Status: done
- Components: `p-dialog`; JSON panels for input (system/messages) + output; copy buttons; meta (model, tokens, cost, duration, error)
- Service: EP-TRACES-02
- Guard: same
- Notes: pretty-print JSON; strip already handled by API in prod for stack

### Cost Dashboard + Proposal Summary `PG-AIREQ-03`
- Route: top section of `/ai-requests` (same page)
- Status: done
- Components:
  - When `proposalId` filter set → summary card from EP-TRACES-03
  - Always (or toggle) cost charts from EP-TRACES-04: cost by day (line), by model (doughnut/bar); by project if returned
  - Date range picker shared with list filters
- Service: EP-TRACES-03, EP-TRACES-04; Chart.js / ng2-charts (dashboard pattern)
- Guard: same

## Nav

- Sidebar under Tools (near AI Jobs): label `layout.sidebar.aiRequests`; badge optional “AI”
