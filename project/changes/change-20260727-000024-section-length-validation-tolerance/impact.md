# Impact Analysis — Section length prompts + soft maxLength

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Catalog schemas | complete | `pipeline-v3/templates/pitch-landscape.catalog.ts` | Strict min/max; no tolerance |
| Validator | complete | `pipeline-v3/section/section-schema.ts` | Hard AJV maxLength only |
| Section orchestrator | complete | `pipeline-v3/section/section-orchestrator.service.ts` | Retries on any schema fail (costly) |
| Translate orchestrator | complete | `pipeline-v3/translate/translate-orchestrator.service.ts` | Same hard validator |
| Richness gate | complete | `pipeline-v3/section/richness.gate.ts` | Min-only; leave as-is |
| Prompts | partial | `pipeline-v3/prompts/section.*.md`, `shared/depth-contracts.v1.md` | Only “Respect schema min/max”; depth pushes longer |
| Legacy creative-pipeline | complete | `creative-pipeline/validate/validateSectionBundle.ts` | Already `maxWords * 1.15` — out of scope |

Feature state: **partial** (validation exists; soft max + length-focused prompts missing)

## Affected Modules
- Pipeline v3 section generation / validation — **modify**
- Pipeline v3 translate — **ripple** (shared validator)

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/pipeline-v3-section-validation.md`
- [ ] `blueprint/plan/rules-delta.md` (length budget + soft max rule)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files expected (implement)
| Action | Path |
|--------|------|
| Modify | `roya-sales-ai-api-v2/src/pipeline-v3/section/section-schema.ts` (soft maxLength ratio) |
| Add | unit test near section-schema (or existing test folder) |
| Modify | `roya-sales-ai-api-v2/src/pipeline-v3/prompts/section.generic.v1.md` |
| Modify | `roya-sales-ai-api-v2/src/pipeline-v3/prompts/section.research.v1.md` (if present) |
| Modify | `roya-sales-ai-api-v2/src/pipeline-v3/prompts/section.translate.v1.md` |
| Modify | `roya-sales-ai-api-v2/src/pipeline-v3/prompts/shared/depth-contracts.v1.md` (reconcile with max) |
| Optional | section orchestrator user payload — inject compact `lengthBudgets` from schema |

## Risk: complexity (L), cross-module (N — within pipeline-v3), migration (N)

## Recommendation
- **Modify**: soft maxLength wrapper in `validateSectionContent`; strengthen length instructions in section prompts.
- **Complete**: length-budget guidance that currently is one vague line.
- **Ripple**: translate uses same validator automatically.
- **Create**: none (no new entities/endpoints).

## Status target (per artifact in the pack after implement)
- Soft maxLength validation → done
- Prompt length budgets → done
- Unit tests → done

## Dependencies
- depends-on: — — current pack-status of dep: n/a
