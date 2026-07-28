# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: new-feature
- **target-app**: web
- **affected-repos**: frontend (+ thin backend for summary/cost endpoints if missing)
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: 7/8
- **depends-on**: change-20260726-000009
- **blocks**: change-20260726-000011 (planned — cutover / retire v2)
- **pack-status**: merged

## Scope
- Module(s): Pipeline Traces (FE + API extensions), Settings/Layout (nav)
- Feature(s): AI Requests page — table, filters, detail drawer, proposal summary, workspace cost dashboard
- Endpoint(s): consume EP-TRACES-01/02; add deferred `…/proposals/:id/summary` + `…/cost-summary` if not present
- Page(s)/View(s): web — `/ai-requests` (or `/pipeline-traces`)
- Service(s): FE PipelineTracesService; thin TraceSummary/CostSummary on API

## Description

Implement **AI Requests / cost dashboard UI** per `docs/refactor-proposal-generator.md` §14 item 6 and §7.4 (workspace-scoped).

**Depends on** merged `change-20260726-000009` (Projects FE + v3 proposal flow producing traces).

**This pack delivers:**

1. **AI Requests page** — workspace table of pipeline AI calls: label, step, model, input/output tokens, costs, duration, status, date.
2. **Filters** — proposalId, projectId, step, model, status, date range (+ pagination).
3. **Detail dialog** — full parsed JSON input/output with copy; uses `GET …/pipeline-traces/:id`.
4. **Proposal summary card** — when filtered by proposal: totals (calls, tokens, cost, duration) via new or computed summary endpoint.
5. **Cost dashboard** — workspace overview: cost by day/week/month, by model, by project; date range picker (Chart.js already in FE).
6. **Nav** — sidebar entry for `pipeline-traces.read` (admin + sales_manager already seeded).
7. **Thin API (if missing)** — `GET …/pipeline-traces/proposals/:proposalId/summary` and `GET …/pipeline-traces/cost-summary` (workspace-scoped). List/detail already shipped in Phase 0.

**Out of scope:**
- Admin cross-workspace traces (`/api/data/admin/pipeline-traces*`) — deferred unless trivial
- Cutover / retire v2 — change-20260726-000011
- Structured section editor
- Bull Board

**Locked decisions (carry forward):**
- Permission `pipeline-traces.read` only
- Workspace-scoped (no cross-tenant in this pack)
- PrimeNG + Chart.js; ar/en i18n
- Dual-path: page useful whenever traces exist (not strictly gated by `pipelineV3Enabled`, but empty when unused)

## Acceptance Criteria

1. User with `pipeline-traces.read` can open AI Requests page, see paginated list from `GET /api/data/pipeline-traces`, and filter by proposal/project/step/status/date.
2. Clicking a row opens detail with full input/output JSON and copy.
3. Filtering by proposal shows a summary card with totals (calls, tokens, cost, duration).
4. Cost dashboard section shows workspace cost breakdown for a selected date range (by day and by model at minimum; by project if data available).
5. Nav entry visible only with `pipeline-traces.read`.
6. `ng build` + API `npm run build` succeed; no cutover of v2.

## Notes

- Source: `docs/refactor-proposal-generator.md` §14.6, §13 traces API, §7.4.
- Existing: EP-TRACES-01 list, EP-TRACES-02 detail — FE none.
- Part 7/8 within REQ-PROP-V3; part 8 = cutover.
