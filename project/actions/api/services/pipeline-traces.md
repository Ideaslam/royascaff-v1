# Services — Safqa API · Pipeline Traces (list + aggregates)

> Extends `PipelineTraceService` (SVC-PIPEV3-04). Write path remains in `pipeline-v3-foundations.md`.

### SVC-TRACES-00 · List page (tenant-safe) [domain, PipelineTraces]
- Status: done
- Methods: `getWorkspaceTraces(workspaceId, filters)` → `{ items, total, page, pageSize, stats }`
- Deps: `listPage` + `aggregateStats` (same Mongo filter)
- Filters: `proposalId`, `projectId`, `step`, `status`, `from`, `to`, `callType` (`ai` \| `non-ai`), optional raw `action`
- Rules: `workspaceId` always in Mongo filter; UI pageSize capped at 100; lean list projection (no heavy AI I/O)

### SVC-TRACES-01 · Proposal summary [domain, PipelineTraces]
- Status: done
- Methods: `getProposalSummary(workspaceId, proposalId)` → totals via `aggregateStats`
- Deps: repo `aggregateStats`
- Side effects: none
- Rules: workspace-scoped; includes `totalTokens`

### SVC-TRACES-02 · Cost summary [domain, PipelineTraces]
- Status: done
- Methods: `getCostSummary(workspaceId, { from, to })` → `{ from, to, totals, byDay, byModel, byProject }` via Mongo `$facet`
- Deps: repo `aggregateCostSummary`; projects repository (batch get by ids); optional proposals lookup for `pipelineVersion`
- Side effects: none
- Rules:
  - default `from` = 30 days ago
  - `byProject` includes calls + token totals + cost
  - Enrich each byProject row (known project ids): `projectName`, `projectCreatedAt`, `clientName`, `lastActivityAt`, `proposalCount`, optional `pipelineVersion`
  - Sort `byProject` by `projectCreatedAt` **descending** (null/unknown last)

### SVC-TRACES-03 · Filter stats [domain, PipelineTraces]
- Status: done
- Methods: `aggregateStats(workspaceId, filters)` → calls, input/output/total tokens, costs, durationMs
- Aggregation paths: `ai.output.usage.*`, `ai.cost.*`, `ai.durationMs`
- Side effects: none
