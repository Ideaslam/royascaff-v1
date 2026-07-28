# Endpoints — Safqa API · Pipeline Traces · change-20260728-000027

> Auth: `WorkspaceAuthGuard` + `PermissionGuard('pipeline-traces.read')`. Prefix `/api`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TRACES-01 | GET | /api/data/pipeline-traces | `pipeline-traces.read` | `?proposalId,projectId,step,callType,action,status,from,to,page,pageSize\|limit` | `200` `{ items, total, page, pageSize, stats }` | `getWorkspaceTraces` | planned | `callType`: `ai` \| `non-ai`; stats = filter totals |
| EP-TRACES-02 | GET | /api/data/pipeline-traces/:id | same | `param: id` | `200` detail | `getById` | done | unchanged |
| EP-TRACES-03 | GET | /api/data/pipeline-traces/proposals/:proposalId/summary | same | param | totals (+ `totalTokens`) | `getProposalSummary` | planned | Mongo aggregate |
| EP-TRACES-04 | GET | /api/data/pipeline-traces/cost-summary | same | `?from,to` | `{ from, to, totals, byDay, byModel, byProject }` | `getCostSummary` | planned | Mongo aggregate; totals include token fields |

## EP-TRACES-01 — list + stats

**Query**
- `callType=ai` → AI calls only; `non-ai` → non-AI; omit / empty → All
- Prefer `callType` over raw `action` when both sent (`callType` wins)
- `pageSize` / `limit` default 20, max 100

**Response `stats`**
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

## EP-TRACES-03 / 04

- Same numeric totals shape; EP-TRACES-03 adds `proposalId`; EP-TRACES-04 keeps chart buckets.
- Totals must include `totalTokens` (= in + out) for FE consistency.
- Performance: no unbounded document load in Node.

## Delta

- EP-TRACES-01: add `callType`; embed `stats` in list response.
- EP-TRACES-03/04: aggregation-backed; expose `totalTokens` on totals.
- Cap list page size at 100.
- EP-TRACES-02 unchanged.
