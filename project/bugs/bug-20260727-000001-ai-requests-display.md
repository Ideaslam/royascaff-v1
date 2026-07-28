# Bug 20260727-000001 — AI Requests display & navigation

## Status
**DONE** — Confirmed 2026-07-27

## Reported
- **Date**: 2026-07-27
- **Severity**: high
- **Affected area**: web `/ai-requests` + API `pipeline-traces` (Pipeline Traces)

## Description
1. Tokens in/out and costs do not appear in the AI Requests table.
2. Detail viewer does not show all information; JSON should be readable in a JSON viewer.
3. Label should include / show project id.
4. Page should group by project (collapse per project) or show project list first then requests for that project.

## Expected Behavior
- List columns show inputTokens, outputTokens, totalCost when the call completed with usage.
- Detail dialog shows full meta (project, proposal, tokens, cost breakdown, status, error) and pretty/parsed JSON I/O.
- Label (or adjacent field) surfaces projectId.
- Users can navigate by project without a flat mixed list (prefer project-first → drill into requests).

## Steps to Reproduce (if applicable)
1. Open `/ai-requests` with `pipeline-traces.read`.
2. Observe In/Out/Cost columns.
3. Open a row detail dialog.
4. Check whether label/projectId and JSON readability are usable.

## Triage (6.0)
- Q1 plan/blueprint changes? NO — existing PG-AIREQ / EP-TRACES contracts already require tokens, cost, detail, projectId filter. Project-first uses existing `cost-summary.byProject` + `projectId` filter.
- Q2 multi-module unrelated? NO — same Pipeline Traces feature (FE+BE contract already defined).
- Q3 migration? NO.
- **Path B** — direct fix.

## Root Cause
Runtime logs (`fed57d`) showed list/detail rows with empty `usage: {}` and `totalCost: 0`. `callClaudeWithStopReason` discarded Anthropic `msg.usage`, and `callClaudeJsonTraced` never passed usage into `completeAiCall`, so tokens/cost were never stored. Detail UI only rendered `ai.input`/`ai.output` (validation rows empty). Label omitted `projectId` even though API returned it. Flat paginated list mixed projects. Project view was empty because cost-summary filtered `createdAt` with `Date` objects while Mongo stores ISO strings (0 rows → empty `byProject`).

## Fix Applied
- Capture + normalize Anthropic usage in provider → traced caller → `completeAiCall` / `toListRow`.
- Cost-summary date filter compares ISO strings; larger page size for aggregation; FE fallback for project rows.
- AI Requests: project-first list, label shows projectId, detail meta + collapsible JSON tree (input/output/validation/full record).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-frontend/src/app/pages/ai-requests/ai-requests.component.ts`
- `roya-sales-ai-frontend/src/app/pages/ai-requests/json-tree.component.ts`
- `roya-sales-ai-frontend/src/app/core/services/pipeline-traces.service.ts`
- `roya-sales-ai-api-v2/src/lib/ai-provider.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/analyze/claude-traced.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/tracing/pipeline-trace.service.ts`
- `roya-sales-ai-api-v2/src/pipeline-v3/tracing/cost.util.ts`
- `roya-sales-ai-api-v2/src/infrastructure/persistence/providers/mongodb/mongodb-pipeline-traces.repository.ts`
