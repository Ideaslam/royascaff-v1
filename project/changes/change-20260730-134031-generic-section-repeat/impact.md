# Impact Analysis — Generic catalog-driven section repeat

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Shared split constants | complete (but allowlist-coupled) | `roya-sales-ai-api-v2/src/pipeline-v3/templates/shared/pdf-list-split.ts` | `PDF_LIST_SPLIT_KEYS`, `PDF_OVERFLOW_CLAMP_KEY_SET`, `PDF_LIST_SPLIT_CAPACITY` are static, hand-maintained — every new splittable key needs a manual edit here |
| Map orchestrator | partial | `roya-sales-ai-api-v2/src/pipeline-v3/map/map-orchestrator.service.ts` | `clampListSplitInstances` (L275–298) and `validateMap`'s count check (L441–453) key off `PDF_OVERFLOW_CLAMP_KEY_SET.has(key)` instead of the catalog's own `repeatable` flag (already present per-key in `abstractCatalog`, L73–81); `listSplit` payload builder (L89–103) injects static `PDF_LIST_SPLIT_KEYS`/`PDF_LIST_SPLIT_CAPACITY` instead of deriving from `catalogSections` |
| Map prompt | partial | `roya-sales-ai-api-v2/src/pipeline-v3/prompts/map.plan.v1.md` L32–46 | Names `timeline`, `action_plan`, `services` explicitly; needs generic wording keyed to `abstractCatalog[].repeatable`/`pages.max` |
| Website catalog lock | partial | `roya-sales-ai-api-v2/src/pipeline-v3/templates/website-template/website-template.catalog.ts` L13,19 | `landingLocked` check uses `PDF_LIST_SPLIT_KEY_SET.has(section.key)` (allowlist) instead of `section.repeatable === true` (attribute) |
| Pitch catalog (`social_audit`) | none (single-instance today) | `roya-sales-ai-api-v2/src/pipeline-v3/templates/pitch-landscape/pitch-landscape.catalog.ts` L443–474 | `repeatable: false, pages: { min: 1, max: 1 }` — needs flip to `true` / `max: 2` |
| Downstream (section engine, assemble, render) | complete — no change needed | `section-orchestrator.service.ts`, `assemble.service.ts` (sort by `order`), `template-render.service.ts` (render by `key`+`order`) | Already generic: any repeated `key` with distinct `instanceId` renders as independent pages today (proven by `timeline`/`action_plan`/`services`) |
| Research coverage gate | complete — no change needed | `roya-sales-ai-api-v2/src/pipeline-v3/map/research-coverage.gate.ts` L109–111 | Only checks "≥1 hit" per option; multi-instance `social_audit` still satisfies coverage trivially |
| `map.v1` schema / data model | complete — no change needed | `roya-sales-ai-api-v2/src/pipeline-v3/schemas/map.v1.schema.json` | `instanceId`/`key`/`order` already generic; no schema edit required |
| Frontend | complete — no change needed | `proposal-view.component.ts`, `proposals-operations.controller.ts` | Consume rendered URLs only; unaware of section counts |

Feature state: **partial** (mechanism exists but is allowlist-coupled to 4 keys; needs to become attribute-driven for all keys)

## Affected Modules
- **Creative / AI Generation (Map worker)** — remove allowlist coupling in `MapOrchestratorService`; derive splittable keys/capacity from the live template catalog per request
- **Templates (Section catalog per template)** — `pdf-list-split.ts` capacity-hint derivation becomes computed (not hand-maintained per key); `website-template.catalog.ts` lock becomes attribute-based; `pitch-landscape.catalog.ts` flips `social_audit` to repeatable

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/pipeline-sections-engine.md` — delta: `MapOrchestratorService` clamp/validate + listSplit payload generalization
- [ ] `blueprint/actions/api/services/templates.md` — delta: `pdf-list-split.ts` capacity derivation, `website-template.catalog.ts` lock, `pitch-landscape.catalog.ts` `social_audit` flag
- [ ] `blueprint/_index.md` + pack `status.md`

No `plan/` slice needed — no new data-model fields, no new endpoints, no rules.md change (behavior is additive/generalizing, not a new rule class).

## Risk: complexity Low, cross-module Y (map + templates, same request family), migration N
- No DB schema change (existing `sectionMap`/`sections` shape already supports N same-key rows).
- Regression risk is the main concern: removing the allowlist must not change behavior for the 4 keys already relying on it (`timeline`, `action_plan`, `services`, `financial_full`) — mitigated by keeping the same underlying signal (`repeatable` + `pages.max`), which those 4 keys already carry identically to what the allowlist encoded.
- Financial family (`financial`/`financial_part`/`financial_full`) is a different-key-per-chunk pattern (not "same key repeated") and is explicitly kept as its own rule in the prompt — not touched structurally.

## Recommendation
- **Modify**: `pdf-list-split.ts` (capacity derivation helper, drop static key/clamp sets or keep as deprecated re-exports if any other file needs them — none found outside the 3 files above), `map-orchestrator.service.ts` (2 methods + payload builder), `map.plan.v1.md` (prompt wording), `website-template.catalog.ts` (1 line), `pitch-landscape.catalog.ts` (1 section's `repeatable`/`pages`)
- **Create**: nothing net-new (no new files, no new schema, no new endpoints)
- **Complete**: none partial-to-finish outside the above

## Status target (per artifact in the pack after implement)
- SVC-PIPE-S3-04b (Map listSplit generalization) → done
- SVC-PIPE-CAT-01 (Catalog-driven repeat: website lock + `social_audit` flag) → done

## Dependencies
- depends-on: `change-20260729-122650-pdf-list-section-split` (pack-status: **verified**, already the merged mechanism this pack generalizes) — not a hard gate since it's already implemented/merged; recorded for traceability only.
