# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Pipeline Traces (API + Web AI Requests)
- Feature(s): Filtered list stats strip; call-type filter (AI / non-AI / All); step select; fast pagination & aggregation
- Endpoint(s): `GET /api/data/pipeline-traces` (+ optional stats fields / dedicated stats query); `GET …/cost-summary`; `GET …/proposals/:id/summary`
- Page(s)/View(s): web — `/ai-requests`
- Service(s): `PipelineTraceService`, `MongoPipelineTracesRepository`, FE `PipelineTracesService` + `AiRequestsComponent`

## Description

Enhance the **AI Requests** page (`/ai-requests`) so operators can see aggregate usage for the **current filter set**, filter by call type and step via dropdowns, and get fast list/filter/summary responses as data grows.

### 1. Stats (current filter scope)
Show a summary strip (always when viewing the requests list, not only when a proposalId is set):
- **Calls** — count of matching traces
- **Tokens in** — sum of input tokens
- **Tokens out** — sum of output tokens
- **Tokens all** — in + out
- **Cost** — sum of total cost

Stats must respect the same filters as the list (project, proposal, step, call type, status, date range).

### 2. Filters (PrimeNG Select)
- **Call type** — `All` | `AI call` (`action === "ai_call"`) | `Non AI call` (`action !== "ai_call"`, e.g. validation, assemble_complete, s3_upload, …)
- **Step** — Select of known pipeline steps (`analyze`, `map`, `sections`, `assemble`, `export`, `dna`, `research`, `translate`, …) with clear = All

Keep existing filters (proposalId, projectId, status, from/to) unless they conflict.

### 3. Performance (all paginated / filter / summary endpoints)
Current gaps to fix:
- List/summary paths load large pages into memory and filter `workspaceId` in app code
- Cost / proposal summaries scan up to thousands of documents in JS
- Date `$or` and missing compound indexes hurt pagination

Target after-state:
- Mongo filters always include `workspaceId` (and other predicates) **in the query**
- List uses indexed `find` + `countDocuments` with lean projection (list fields only)
- Stats / cost-summary / proposal-summary use **Mongo aggregation** (`$match` + `$group`), not loading full rows
- Ensure / extend indexes for common paths: `(workspaceId, createdAt)`, `(workspaceId, step, createdAt)`, `(workspaceId, action, createdAt)`, `(workspaceId, projectId, createdAt)`, `(workspaceId, proposalId, createdAt)`
- Cap page size for UI list; never rely on `pageSize: 5000` for dashboards

**Out of scope:**
- Cross-workspace admin traces
- Changing how traces are written (schema of `ai` / `validation` payloads)
- Chart redesign beyond reusing existing cost-summary totals
- New permissions (still `pipeline-traces.read`)

**Assumptions (confirm):**
1. Call-type filter maps to `action === "ai_call"` vs not.
2. Stats apply to the **requests list filter set** (workspace-scoped), not only proposal summary.
3. “Select Module” means PrimeNG Select dropdowns (not a new “module” entity).

## Acceptance Criteria

1. On `/ai-requests` requests view, a stats strip shows calls, tokens in, tokens out, tokens all, and total cost for the **active filters**.
2. Call-type Select offers All / AI call / Non AI call and filters the list + stats accordingly.
3. Step Select filters list + stats; clearing step shows all steps.
4. Changing filters refreshes list page 1 and stats without full-page reload.
5. `GET /api/data/pipeline-traces` scopes by `workspaceId` in Mongo; pagination total matches tenant-filtered count.
6. List, stats (or list+stats), proposal summary, and cost-summary avoid loading unbounded full documents into memory; aggregations or projected queries used where totals are needed.
7. Indexes covering the common filter combinations are ensured at boot (`ensureIndexes`).
8. Existing detail dialog, charts, and `pipeline-traces.read` guard remain intact; ar/en i18n updated for new labels.
9. API `npm run build` and FE `ng build` succeed.

## Notes

- Builds on merged `change-20260726-000010` / bug-20260727-000001 AI Requests work.
- Non-AI actions today include at least: `validation`, `*_complete`, `*_failed`, `vision_skip`, `overflow_shrink`, `s3_upload`, `error`.
- Standard flow (not Fast-Track): backend + frontend + aggregation/index work.
