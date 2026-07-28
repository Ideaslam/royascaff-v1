# Pages — Safqa Web · AI Requests · change-20260728-000027

> Route: `/ai-requests`. Auth: layout + `pipeline-traces.read`. i18n: `aiRequests.*`.

### AI Requests List `PG-AIREQ-01`
- Route: `/ai-requests` (requests view)
- Status: planned
- Components:
  - **Stats strip** (above table, always in requests view): calls, tokens in, tokens out, tokens all, total cost — bound to `list.stats` for active filters
  - Lazy `p-table` (existing columns)
  - Filters row:
    - proposalId, projectId (inputs)
    - **Call type** `p-select`: All | AI call | Non AI call → `callType` query (`ai` / `non-ai` / omit)
    - **Step** `p-select` (existing options; placeholder “Step”)
    - status, from, to, Apply
- Service: `PipelineTracesService.list` → EP-TRACES-01 (reads `stats`)
- Guard: `pipeline-traces.read`
- Notes: changing filters → page 1 + refresh list/stats together; no extra stats round-trip

### Trace Detail Dialog `PG-AIREQ-02`
- Status: done (unchanged this pack)

### Cost Dashboard + Proposal Summary `PG-AIREQ-03`
- Status: planned (light modify)
- Components:
  - Charts from EP-TRACES-04 (unchanged UX)
  - Proposal summary card when proposalId set — may show `totalTokens`; optional collapse/hide if stats strip already covers same numbers when proposal filtered
  - Prefer cost-summary `byProject` (remove or keep only as last-resort fallback of list pageSize 100)
- Service: EP-TRACES-03, EP-TRACES-04

### FE service
- `PipelineTracesService.list` accepts `callType?: 'ai' | 'non-ai'`; types include `stats` + `totalTokens`
- i18n en/ar: `aiRequests.stats.*`, `aiRequests.filters.callType`, `aiRequests.callType.ai|nonAi|all`, `aiRequests.tokensAll`

## Delta

- Add filter-scoped stats strip (calls, in/out/all tokens, cost).
- Add call-type Select; keep step Select.
- Wire `callType` + consume list `stats`.
- Drop heavy client fallback scan when cost-summary works; surface `totalTokens` where useful.
- PG-AIREQ-02 unchanged.
