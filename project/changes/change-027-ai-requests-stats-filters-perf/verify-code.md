# Verification — change-027-ai-requests-stats-filters-perf

_Date: 2026-07-28_

## Acceptance criteria

| # | Criterion | Evidence | Result |
|---|-----------|----------|--------|
| 1 | Stats strip: calls, tokens in/out/all, cost for active filters | `AiRequestsComponent` summary card bound to `list.stats` | PASS |
| 2 | Call-type Select: All / AI / Non-AI filters list + stats | FE `callType` → EP-TRACES-01 `callType`; repo maps ai / `$ne ai_call` | PASS |
| 3 | Step Select filters list + stats | Existing step filter + aggregateStats same `$match` | PASS |
| 4 | Filter change refreshes page 1 + stats | `reload()` resets page + `loadList()` | PASS |
| 5 | List scopes by workspaceId in Mongo; total matches | `buildFilter` always sets `workspaceId`; `countDocuments` on same filter | PASS |
| 6 | No unbounded doc load for totals | `aggregateStats` / `aggregateCostSummary` `$group`/`$facet`; list pageSize ≤ 100 | PASS |
| 7 | Indexes ensured at boot | `ensureIndexes` compound keys under workspaceId | PASS |
| 8 | Detail/charts/permission + i18n | Detail unchanged; charts via cost-summary; en/ar keys added | PASS |
| 9 | Builds | API `tsc --noEmit` OK; FE `ng build --configuration=local` OK | PASS |

## Pack blueprint checks

| Artifact | Match | Result |
|----------|-------|--------|
| data-model indexes + query | Mongo repo indexes + `buildFilter` | PASS |
| SVC-TRACES-00..03 | list+stats; proposal/cost via aggregate | PASS |
| EP-TRACES-01,03,04 | `callType` + `stats`; summaries aggregated | PASS |
| PG-AIREQ-01,03 | stats strip; call-type Select; no list fallback scan | PASS |

## Overall: PASS
