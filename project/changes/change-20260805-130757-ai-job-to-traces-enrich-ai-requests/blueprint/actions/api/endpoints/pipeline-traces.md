# Endpoints — Pipeline Traces · change-20260805-130757

> Pack slice: EP-TRACES-04 response enrichment. EP-TRACES-01..03 unchanged.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TRACES-04 | GET | /api/data/pipeline-traces/cost-summary | permission:`pipeline-traces.read` | `?from,to` | `{ from, to, totals, byDay, byModel, byProject }` | `getCostSummary` | planned | `byProject` enriched + sorted by `projectCreatedAt` desc |

## Cost-summary `byProject` item (after-state)

```jsonc
{
  "projectId": "…",
  "projectName": "…",          // optional
  "projectCreatedAt": "ISO",   // optional; null if unknown
  "clientName": "…",           // optional
  "lastActivityAt": "ISO",     // optional; max trace time in window
  "proposalCount": 0,          // distinct proposalIds in window
  "pipelineVersion": "2",      // optional "2" | "3"
  "calls": 15,
  "inputTokens": 0,
  "outputTokens": 0,
  "totalTokens": 0,
  "totalCost": 5
}
```

## Delta

- Add optional identifying fields on `byProject[]`.
- Default order of `byProject`: `projectCreatedAt` desc (unknown last).
- Existing token/cost fields remain required as today.
