# Impact Analysis — AI Requests stats, call-type/step filters, fast pagination

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema / indexes | partial | `mongodb-pipeline-traces.repository.ts` `ensureIndexes` | Has `workspaceId+createdAt`, `action+status`, `proposalId+step` — missing filter combos for step/action/project under workspace; date `$or` hurts index use |
| Repository | partial | `pipeline-traces.repository.ts` + Mongo impl | `listPage` **omits `workspaceId`** in Mongo filter; no aggregate API; pageSize up to 5000 for summaries |
| Service(s) | partial | `pipeline-trace.service.ts` | In-memory workspace filter after fetch; `getCostSummary` / `getProposalSummary` load up to 2k–5k docs and aggregate in JS; no call-type (`ai`/`non-ai`) helper; no filter-scoped stats for list |
| Endpoint(s) | partial | `pipeline-traces.controller.ts` | EP-TRACES-01 accepts `action` but FE doesn’t expose call-type; no stats on list (or dedicated stats route); summaries lack shared filter set |
| FE service | partial | `pipeline-traces.service.ts` | No `action` / callType param; no stats type |
| Page(s) | partial | `ai-requests.component.ts` + i18n | Step Select exists; no call-type Select; proposal summary only when proposalId set — no general stats strip (tokens all, etc.); cost-summary fallback list of 100 |

Feature state: **partial**

## Affected Modules
- **Pipeline Traces (API)** — push tenant + filters into Mongo; aggregation for stats/cost/proposal summary; callType query; indexes
- **AI Requests (Web)** — stats strip; call-type Select; wire step/callType into list+stats; i18n

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — pipelineTraces index / query after-state + Delta
- [ ] `blueprint/actions/api/services/pipeline-traces.md` — SVC aggregate + list filter after-state + Delta
- [ ] `blueprint/actions/api/endpoints/pipeline-traces.md` — EP-TRACES-01 query + stats; EP-TRACES-03/04 perf + Delta
- [ ] `blueprint/actions/web/pages/ai-requests.md` — PG-AIREQ stats strip + filters + Delta
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code impact (implement later)

| File | Change |
|------|--------|
| `roya-sales-ai-api-v2/.../contracts/pipeline-traces.repository.ts` | Add `workspaceId`, `callType` (`ai` \| `non-ai`); `aggregateStats` / `aggregateCostSummary` contracts |
| `roya-sales-ai-api-v2/.../mongodb-pipeline-traces.repository.ts` | Filter in Mongo; lean projection for list; `$match`+`$group` aggregations; extend `ensureIndexes` |
| `roya-sales-ai-api-v2/.../pipeline-trace.service.ts` | Pass workspaceId; map callType→action predicate; return stats with list or via thin method; rewrite summaries to use aggregation |
| `roya-sales-ai-api-v2/.../pipeline-traces.controller.ts` | Accept `callType`; expose `stats` on list response (preferred) or `GET …/stats` |
| `roya-sales-ai-frontend/.../pipeline-traces.service.ts` | `callType` + stats typing |
| `roya-sales-ai-frontend/.../ai-requests.component.ts` | Stats strip; call-type Select; load stats with filters |
| `en.json` / `ar.json` | New `aiRequests.*` keys |

## Risk
- **Complexity**: M (aggregation + index design; token/cost field paths under `ai.output.usage` / `ai.cost`)
- **Cross-module**: N (traces module only)
- **Migration**: N (indexes only; no document rewrite)

## Recommendation
- **Modify**: EP-TRACES-01 list (+ stats payload), EP-TRACES-03/04 to Mongo aggregations, repo indexes, FE page filters/stats
- **Create**: repo aggregate helpers (no new collection); optional `GET …/stats` only if embedding stats in list response is awkward
- **Preferred API shape**: list response `{ items, total, page, pageSize, stats: { calls, inputTokens, outputTokens, totalTokens, totalCost, … } }` so one round-trip for table + strip

## Status target (per artifact in the pack after implement)
- data-model indexes → done
- SVC-TRACES list/stats/aggregates → done
- EP-TRACES-01..04 → done
- PG-AIREQ-01/03 → done

## Dependencies
- depends-on: — (change-20260726-000010 / bug-20260727-000001 already merged)
