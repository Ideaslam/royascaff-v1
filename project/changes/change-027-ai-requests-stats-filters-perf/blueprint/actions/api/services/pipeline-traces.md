# Services — Safqa API · Pipeline Traces · change-027

> After-state for list + aggregates. Extends `PipelineTraceService` / `MongoPipelineTracesRepository`.

### SVC-TRACES-00 · List page (tenant-safe) [domain, PipelineTraces]
- Status: planned
- Methods:
  - `getWorkspaceTraces(workspaceId, filters)` → `{ items, total, page, pageSize, stats }`
  - Repo: `listPage({ workspaceId, …filters, page, pageSize })` — Mongo filter + lean projection + `countDocuments`
- Filters: `proposalId`, `projectId`, `step`, `status`, `from`, `to`, `callType` (`ai` \| `non-ai` \| undefined), optional raw `action`
- Rules:
  - `workspaceId` always in repo filter (never post-filter for totals)
  - UI `pageSize` capped at 100; repo hard cap ≤ 100 for list (aggregations use separate methods)
  - `stats` from `aggregateStats` with **same** filter (excluding page/limit)

### SVC-TRACES-01 · Proposal summary [domain, PipelineTraces]
- Status: planned (modify)
- Methods: `getProposalSummary(workspaceId, proposalId)` → totals via `aggregateStats({ workspaceId, proposalId })`
- Deps: repo aggregation (not listPage scan)
- Rules: workspace-scoped; include all actions unless caller adds callType later

### SVC-TRACES-02 · Cost summary [domain, PipelineTraces]
- Status: planned (modify)
- Methods: `getCostSummary(workspaceId, { from, to })` → `{ from, to, totals, byDay, byModel, byProject }` via Mongo `$facet` / parallel `$group`
- Deps: repo `aggregateCostSummary`
- Rules: default `from` = 30d ago; no Node-side scan of 5k docs

### SVC-TRACES-03 · Filter stats [domain, PipelineTraces]
- Status: planned
- Methods: `aggregateStats(workspaceId, filters)` →
  ```ts
  {
    calls: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number; // input + output
    inputCost: number;
    outputCost: number;
    totalCost: number;
    durationMs: number;
  }
  ```
- Aggregation paths: `$ifNull` on `ai.output.usage.inputTokens|outputTokens`, `ai.cost.*`, `ai.durationMs`
- Side effects: none

### Repo contract additions
- `listPage` input requires `workspaceId`; supports `callType`
- `aggregateStats(filter)` / `aggregateCostSummary(filter)`
- `ensureIndexes` per pack data-model

## Delta

- List always tenant-filtered in Mongo; returns `stats` with same filters.
- New `callType` filter mapping; new `SVC-TRACES-03` aggregateStats.
- Rewrite SVC-TRACES-01/02 to use Mongo aggregation (retire bounded JS scans / pageSize 2000–5000).
- List pageSize cap for UI; remove summary reliance on large `listPage`.
