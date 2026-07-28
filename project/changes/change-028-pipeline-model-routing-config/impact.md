# Impact Analysis — Pipeline v3 DB model routing

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema / config | partial | `scripts/config-seed-data.js`, `mongodb-config.repository.ts`, `SeedConfigBundle` | No `pipelineModelRouting` doc; seed lists fixed keys only |
| Model resolver | partial | `pipeline-v3/model/model-resolver.ts` | Hardcoded strong/fast map; uses workspace `strongModel`/`fastModel` |
| Claude traced caller | partial | `pipeline-v3/analyze/claude-traced.ts` | Passes workspace model overrides into `resolveModel` |
| Cost util | partial | `pipeline-v3/tracing/cost.util.ts` | Has Opus 4 (20250514) rates; missing Opus 4.5 (`claude-opus-4-5-20251124`) used in seed |
| Call sites | complete | analyze / research / map / section / translate orchestrators | Already pass `requestType`; no API/FE change needed |
| Endpoint(s) | complete | `POST /api/admin/seed-config` | Exists; must include new config key in bundle upsert |
| Page(s) | none | — | Backend-only (out of scope) |

Feature state: **partial** (resolver + seed plumbing exist; not DB-driven yet)

## Affected Modules
- **AI / Pipeline v3 Foundations** — `resolveModel` becomes async/config-backed (or sync over cached config); short TTL cache loader
- **Settings & Config** — new system config doc + seed path (`seed-config.js` + Nest `seedConfigBundle` + admin controller)
- **Pipeline Traces** — pricing table update for Opus 4.5 so cost traces stay accurate

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — `config` known key `pipelineModelRouting` + shape
- [ ] `blueprint/plan/modules.md` — model-by-request-type → DB config (delta)
- [ ] `blueprint/actions/api/services/pipeline-v3-foundations.md` — SVC-PIPEV3-06 ModelResolver after-state
- [ ] `blueprint/actions/api/services/pipeline-model-routing.md` — config loader + cache + seed contract (new/small)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files likely touched (implement phase)

| File | Change |
|------|--------|
| `scripts/config-seed-data.js` | Add `pipelineModelRouting` seed object |
| `scripts/seed-config.js` | Upsert `config/pipelineModelRouting` |
| `src/infrastructure/persistence/contracts/persistence.types.ts` | Extend `SeedConfigBundle` |
| `src/infrastructure/persistence/contracts/config.repository.ts` | Optional `getConfigDocument` / routing getter |
| `src/infrastructure/persistence/providers/mongodb/mongodb-config.repository.ts` | Seed + read `pipelineModelRouting` |
| `src/modules/admin/admin.controller.ts` | Pass new field into `seedConfigBundle` |
| `src/pipeline-v3/model/model-resolver.ts` | Config-first resolve; hardcoded fallbacks; drop workspace strong/fast for v3 |
| `src/pipeline-v3/model/model-routing-config.ts` *(new)* | Load + short TTL cache |
| `src/pipeline-v3/analyze/claude-traced.ts` | Await config-aware resolve; stop passing workspace model overrides |
| `src/pipeline-v3/tracing/cost.util.ts` | Add Opus 4.5 pricing |

## Risk: complexity **M**, cross-module **Y** (pipeline + config seed), migration **N** (upsert seed; no workspace data migrate)

## Recommendation
- **Create**: `pipelineModelRouting` config doc + cached loader
- **Modify**: `resolveModel` / `claude-traced` / seed paths / `MODEL_PRICING`
- **Ripple**: none on FE; orchestrators keep same `requestType` contract

## Status target (per artifact in the pack after implement)
- data-model `pipelineModelRouting` → done
- modules model-routing delta → done
- SVC-PIPEV3-06 ModelResolver → done
- SVC model-routing config loader → done

## Dependencies
- depends-on: — 
