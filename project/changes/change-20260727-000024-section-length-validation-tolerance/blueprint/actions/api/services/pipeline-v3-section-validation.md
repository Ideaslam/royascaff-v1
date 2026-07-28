# Service — pipeline-v3 section validation + length budgets

**Status**: done  
**Module**: Pipeline v3

## After-state

### Soft maxLength (`section-schema.ts`)
- Constant `SECTION_MAX_LENGTH_TOLERANCE = 0.15`.
- `validateSectionContent` compiles a **soft schema** where every `maxLength` becomes `ceil(maxLength * 1.15)`.
- Catalog schemas unchanged (still used for `lengthBudgets` / prompt targets).
- Soft-pass keeps AI text as-is (no truncate).
- `minLength` and all other keywords unchanged.
- Shared by section generate + translate orchestrators.

### Length budgets helper
- `extractLengthBudgets(contentSchema)` → flat map of field paths → `{ min, max, aim }` where `aim = floor(max * 0.9)`.
- Section + translate user JSON includes `lengthBudgets` alongside `contentSchema`.

### Prompts
- `section.generic.v1.md`, `section.research.v1.md`, `section.translate.v1.md`: length budget section; aim ≤90% of max; count characters (incl. Arabic/spaces).
- `shared/depth-contracts.v1.md`: substance within maxLength; never pad past max.

### Tests
- `section-schema.spec.ts`: cover `date` max 40 → pass at 40, pass at 46, fail at 47.

## Delta
- Modify: `section-schema.ts`, section/translate orchestrator user payloads, four prompt files.
- Add: `section-schema.spec.ts`.
