# Endpoints — Safqa API · Pipeline Traces

> Auth default: `WorkspaceAuthGuard` + `PermissionGuard('pipeline-traces.read')`.
> Prefix: `/api`. Register static paths (`cost-summary`, `proposals/:id/summary`) **before** `GET :id`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TRACES-01 | GET | /api/data/pipeline-traces | permission:`pipeline-traces.read` | `?proposalId,projectId,step,callType,action,status,from,to,page,pageSize\|limit` | `200` `{ items, total, page, pageSize, stats }` | `PipelineTraceService.getWorkspaceTraces` | done | `callType`: `ai` \| `non-ai`; Mongo `workspaceId`; pageSize max 100 |
| EP-TRACES-02 | GET | /api/data/pipeline-traces/:id | permission:`pipeline-traces.read` | `param: id` | `200` detail + full input/output | `PipelineTraceService.getById` | done | strip stack in prod |
| EP-TRACES-03 | GET | /api/data/pipeline-traces/proposals/:proposalId/summary | permission:`pipeline-traces.read` | param | totals (+ `totalTokens`) | `getProposalSummary` | done | Mongo `$group` aggregate |
| EP-TRACES-04 | GET | /api/data/pipeline-traces/cost-summary | permission:`pipeline-traces.read` | `?from,to` | `{ from, to, totals, byDay, byModel, byProject }` | `getCostSummary` | done | Mongo `$facet`; byProject includes token fields |

## List stats (`EP-TRACES-01.stats` / summary totals)

```jsonc
{
  "calls": 0,
  "inputTokens": 0,
  "outputTokens": 0,
  "totalTokens": 0,
  "inputCost": 0,
  "outputCost": 0,
  "totalCost": 0,
  "durationMs": 0
}
```

## Cost-summary response

```jsonc
{
  "from": "ISO",
  "to": "ISO",
  "totals": { "calls": 40, "totalCost": 12.5, "inputTokens": 0, "outputTokens": 0, "totalTokens": 0 },
  "byDay": [{ "date": "2026-07-26", "totalCost": 3.1, "calls": 8 }],
  "byModel": [{ "model": "claude-…", "totalCost": 10, "calls": 30 }],
  "byProject": [{
    "projectId": "…",
    "calls": 15,
    "inputTokens": 0,
    "outputTokens": 0,
    "totalTokens": 0,
    "totalCost": 5
  }]
}
```

## Deferred

| Item | Notes |
|------|-------|
| GET /api/data/admin/pipeline-traces* | cross-workspace admin pack |
