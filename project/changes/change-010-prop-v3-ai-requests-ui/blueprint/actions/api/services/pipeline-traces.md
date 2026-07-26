# Services — Safqa API · Pipeline Traces (extend)

## Delta

- **Extend** PipelineTraceService (SVC-PIPEV3-04) with aggregates — documented here as SVC-TRACES-01..02 for pack clarity

---

### SVC-TRACES-01 · Proposal summary [domain, internal, PipelineTraces]
- Status: done
- Methods: `getProposalSummary(workspaceId, proposalId)` — filter AI-call traces for proposal; sum tokens/cost/duration; count calls
- Deps: PipelineTracesRepository.listPage (or bounded scan by proposalId)
- Side effects: none
- Rules: workspace-scoped; ignore non-AI action rows if cost null (still count status); duration from `ai.durationMs`

### SVC-TRACES-02 · Cost summary [domain, internal, PipelineTraces]
- Status: done
- Methods: `getCostSummary(workspaceId, { from, to })` — bucket by day (UTC or local consistent), by model, by projectId
- Deps: listPage with date filters; page through or raise pageSize cap for aggregate window (e.g. max 2000 rows / warn)
- Side effects: none
- Rules: default `from` = 30 days ago if omitted; empty arrays OK

## Existing (unchanged)

- SVC-PIPEV3-04 write path + getWorkspaceTraces + getById
- cost.util computeCost on write
