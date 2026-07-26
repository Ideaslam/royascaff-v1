# Services — Safqa API · Pipeline Traces (aggregates)

> Extends `PipelineTraceService` (SVC-PIPEV3-04). Write/list/detail remain in `pipeline-v3-foundations.md`.

### SVC-TRACES-01 · Proposal summary [domain, internal, PipelineTraces]
- Status: done
- Methods: `getProposalSummary(workspaceId, proposalId)` — filter AI-call traces for proposal; sum tokens/cost/duration; count calls
- Deps: PipelineTracesRepository.listPage (or bounded scan by proposalId)
- Side effects: none
- Rules: workspace-scoped; duration from `ai.durationMs`

### SVC-TRACES-02 · Cost summary [domain, internal, PipelineTraces]
- Status: done
- Methods: `getCostSummary(workspaceId, { from, to })` — bucket by day, by model, by projectId
- Deps: listPage with date filters; bounded aggregate window
- Side effects: none
- Rules: default `from` = 30 days ago if omitted; empty arrays OK
