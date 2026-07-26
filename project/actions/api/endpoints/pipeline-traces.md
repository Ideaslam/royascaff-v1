# Endpoints — Safqa API · Pipeline Traces

> Auth default: `WorkspaceAuthGuard` + `PermissionGuard('pipeline-traces.read')`.
> Prefix: `/api`. Register static paths (`cost-summary`, `proposals/:id/summary`) **before** `GET :id`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TRACES-01 | GET | /api/data/pipeline-traces | permission:`pipeline-traces.read` | `?proposalId,projectId,step,action,status,from,to,page,limit` | `200` paginated summary list | `PipelineTraceService.getWorkspaceTraces` | done | workspace-scoped |
| EP-TRACES-02 | GET | /api/data/pipeline-traces/:id | permission:`pipeline-traces.read` | `param: id` | `200` detail + full input/output | `PipelineTraceService.getById` | done | strip stack in prod |
| EP-TRACES-03 | GET | /api/data/pipeline-traces/proposals/:proposalId/summary | permission:`pipeline-traces.read` | param | totals object | `getProposalSummary` | done | workspace-scoped |
| EP-TRACES-04 | GET | /api/data/pipeline-traces/cost-summary | permission:`pipeline-traces.read` | `?from,to` | `{ byDay, byModel, byProject, totals }` | `getCostSummary` | done | workspace-scoped |

## Summary response

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

## Cost-summary response

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

## Deferred

| Item | Notes |
|------|-------|
| GET /api/data/admin/pipeline-traces* | cross-workspace admin pack |
