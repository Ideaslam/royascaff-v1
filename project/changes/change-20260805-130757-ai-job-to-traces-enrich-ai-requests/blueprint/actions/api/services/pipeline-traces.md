# Services — Pipeline Traces · change-20260805-130757

> Pack slice: SVC-TRACES-02 enrichment only. List/stats write path unchanged.

### SVC-TRACES-02 · Cost summary [domain, PipelineTraces]
- Status: planned
- Methods: `getCostSummary(workspaceId, { from, to })` → `{ from, to, totals, byDay, byModel, byProject }`
- Deps: repo `aggregateCostSummary`; projects repository (batch get by ids); optional proposals count/version lookup
- Side effects: none
- Rules:
  - default `from` = 30 days ago
  - `byProject` includes calls + token totals + cost (**existing**)
  - **Enrich each byProject row** (after facet, for known project ids):
    - `projectName` — from `projects.name`
    - `projectCreatedAt` — from `projects.createdAt` (ISO string | null)
    - `clientName` — from `projects.clientName` (or client lookup if name missing)
    - `lastActivityAt` — from aggregate `max(startedAt|createdAt)` on traces in the filter window
    - `proposalCount` — distinct `proposalId` count from traces in the facet group (or `$addToSet` size)
    - `pipelineVersion` — best-effort from a representative proposal for that project (`"2"` | `"3"` | null); omit if unavailable
  - **Sort** `byProject` by `projectCreatedAt` **descending** (null/unknown last)
  - Rows with `projectId === "unknown"` keep stats only; no project join; sort last

## Delta

- Extend Mongo `byProject` facet group with `lastActivityAt` + distinct proposal ids / count.
- After aggregate, batch-load projects and attach meta fields; sort by `projectCreatedAt` desc.
- Do not change totals / byDay / byModel contracts.
