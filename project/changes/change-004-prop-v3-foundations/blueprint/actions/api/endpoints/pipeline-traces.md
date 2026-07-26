# Endpoints — Safqa API · Pipeline Traces (Phase 0 thin)

> Auth default: `WorkspaceAuthGuard` + permission check.
> Prefix: `/api`. Full catalog (cost-summary, admin, proposal summary) deferred to later packs.

## Delta

- **Create** EP-TRACES-01..02 to exercise `PipelineTraceService` and permission gating
- Defer: cost-summary, admin cross-workspace, proposal summary routes

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TRACES-01 | GET | /api/data/pipeline-traces | permission:`pipeline-traces.read` | `?proposalId,projectId,step,action,status,from,to,page,limit` | `200` paginated list (summary fields; no need to expand full I/O in list) | `PipelineTraceService.getWorkspaceTraces` | planned | workspace-scoped |
| EP-TRACES-02 | GET | /api/data/pipeline-traces/:id | permission:`pipeline-traces.read` | `param: id` | `200` detail incl. full `input`/`output` JSON | `PipelineTraceService.getById` | planned | strip stack in prod |

## Deferred endpoints (not this pack)

| Route | Reason |
|-------|--------|
| GET …/proposals/:proposalId (+ summary) | part 7 / when proposals v3 exist |
| GET …/cost-summary | part 7 dashboard |
| GET /api/data/admin/pipeline-traces* | later admin pack |
