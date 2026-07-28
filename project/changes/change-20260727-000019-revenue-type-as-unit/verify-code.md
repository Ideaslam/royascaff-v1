# Verification — change-20260727-000019-revenue-type-as-unit

## Plan Consistency
- [x] Pack pages specs cover services + project create/edit
- [x] No new endpoints/data-model required
- [x] Recon: FE-only derive `unit` from revenue type

## Code Verification
- [x] Service edit: Unit free-text removed; save uses `revenueTypeToUnit`
- [x] Services list: Unit column removed; revenue type column remains
- [x] Project Create overrides: name + revenue type select + price + qty
- [x] Project Edit overrides: same row; load binds `revenueType`
- [x] Shared helpers in `creative-form-options.ts`
- [x] Payload includes `revenueType` + derived `unit`
- [x] Price display falls back to revenue-type label; ratio still `%`
- [x] No new external URLs; existing page guards unchanged
- [x] Lints clean on touched files

## Acceptance Criteria
1. [x] No Unit input on service form
2. [x] Save stores `revenueType` + derived `unit` label
3. [x] Services list has no Unit column
4. [x] Project Create override includes revenue-type select
5. [x] Project Edit override matches Create
6. [x] Submit/save payload has name / revenueType / unit / price / qty
7. [x] Display uses unit or revenue-type label; ratio → `%`
8. [x] Legacy rows load (empty revenueType → placeholder; unit preserved until select)

## Result: PASS
