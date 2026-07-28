# Endpoints — Safqa API · Pipeline Traces (extend)

## Delta

- **Create** EP-TRACES-03, EP-TRACES-04
- Existing EP-TRACES-01/02 unchanged
- Register static paths **before** `GET :id`

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TRACES-03 | GET | /api/data/pipeline-traces/proposals/:proposalId/summary | `pipeline-traces.read` | param | totals object | getProposalSummary | done | workspace-scoped |
| EP-TRACES-04 | GET | /api/data/pipeline-traces/cost-summary | `pipeline-traces.read` | `?from,to,groupBy?=day` | `{ byDay, byModel, byProject, totals }` | getCostSummary | done | workspace-scoped |

## Summary response (after-state)

```jsonc
{
  "proposalId": "…",
  "calls": 12,
  "inputTokens": 100000,
  "outputTokens": 40000,
  "inputCost": 1.2,
  "outputCost": 0.8,
  "totalCost": 2.0,
  "durationMs": 180000
}
```

## Cost-summary response (after-state)

```jsonc
{
  "from": "ISO",
  "to": "ISO",
  "totals": { "calls": 40, "totalCost": 12.5, "inputTokens": 0, "outputTokens": 0 },
  "byDay": [{ "date": "2026-07-26", "totalCost": 3.1, "calls": 8 }],
  "byModel": [{ "model": "claude-…", "totalCost": 10, "calls": 30 }],
  "byProject": [{ "projectId": "…", "totalCost": 5, "calls": 15 }]
}
```
