# Verification — Pipeline v3 DB model routing (change-20260728-000028)

## Plan Consistency
- [x] Pack data-model documents `pipelineModelRouting`
- [x] Pack services cover resolver + loader + seed + pricing
- [x] No new endpoints/pages required
- [x] Recon findings reflected (workspace model overrides removed for v3)

## Code Verification
- [x] `scripts/config-seed-data.js` seeds `pipelineModelRouting` with research→Opus 5, dna/map/section/vision→Sonnet 5, translate/repair→Haiku 4.5 (no Fable)
- [x] `scripts/seed-config.js` + `MongoConfigRepository.seedConfigBundle` + admin `POST seed-config` upsert the doc
- [x] `SeedConfigBundle` includes `pipelineModelRouting`; `getConfigDocument` on ConfigRepository
- [x] `getPipelineModelRouting()` short TTL cache (45s); missing doc → null
- [x] `resolveModel(requestType)` prefers config map → `defaultModel` → hardcoded fallbacks; no workspace strong/fast
- [x] `callClaudeJsonTraced` awaits config-backed resolve; API key still from workspace settings
- [x] `MODEL_PRICING` includes Opus 5 ($5/$25), Sonnet 5 ($3/$15), Haiku 4.5 ($1/$5)
- [x] No FE changes; orchestrators still pass `requestType`
- [x] Acceptance criteria 1–8 met
- [ ] Live seed not run in this session (ops: `npm run seed` or admin seed-config)

## Acceptance criteria

| # | Criterion | Result |
|---|-----------|--------|
| 1 | Config doc seeded via seed-config / seedConfigBundle | PASS |
| 2 | Resolve: byRequestType → defaultModel → hardcoded | PASS |
| 3 | Seed model map matches request (Opus 5 / Sonnet 5 / Haiku 4.5) | PASS |
| 4 | Short TTL cache | PASS (45s) |
| 5 | Workspace model fields do not override v3 routing | PASS |
| 6 | Traces still record model + cost; no new EP/FE | PASS |
| 7 | Unknown type → medium defaultModel | PASS |
| 8 | Invalid model → Claude API failure as today | PASS (no pre-validation) |

## Result: PASS

**Overall: PASS**
