# Bug 20260730-131000 — Financial table missing service description from catalog

## Status
**DONE** — Confirmed 2026-07-30

## Reported
- **Date**: 2026-07-30
- **Severity**: medium
- **Affected area**: Pipeline v3 assemble financial rows · project service picker · templates financial partials

## Description
Financial slide shows service **name** and prices but **no description**, even when the service catalog row has `description` / `descriptionEn` in the DB.

## Expected Behavior
Under each service name on the financial table, show the catalog description (AR/EN by proposal language).

## Steps to Reproduce
1. Ensure a catalog service has a non-empty description (e.g. سوشيال ميديا).
2. Create/generate a project proposal that includes that service.
3. Open the assembled PDF/HTML financial slide.
4. Description under the service name is missing.

## Root Cause
1. **Project create/edit UI drops descriptions** when selecting services (`toggleService` only keeps `id/name/price/qty/revenueType/unit`) and again when posting project `services` (no `description` / `descriptionEn` in the payload).
2. **Assemble `buildFinancial`** only reads the proposal/project **service snapshot** — it never joins the services catalog by `id`.
3. DNA analyze passthrough copies the thin snapshot; regenerating DNA alone cannot invent descriptions that were never stored on the project/proposal lines.

Templates already render `{{this.description}}` when present; the data never arrives.

## Proposed Fix
1. **Assemble (existing proposals):** when building financial rows, if a line has `id` and empty description, load description from the services catalog and fill `description` / `descriptionEn`.
2. **Frontend (new projects):** include `description` / `descriptionEn` (and `nameEn` if available) in `toggleService` + create/edit save payloads.

**Regenerate guidance:** after the fix, **proposal Regenerate** (or reassemble) is enough. **Do not need DNA regenerate** — assemble hydrates from catalog at render time.

## Fix Applied
1. Assemble `buildFinancial` hydrates missing `description` / `descriptionEn` from services catalog by `id`.
2. Project create/edit keep and persist catalog descriptions on selected service lines.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/pipeline-v3/assemble/assemble.service.ts` (`buildFinancial`)
- `roya-sales-ai-frontend/src/app/pages/projects/project-create/project-create.component.ts`
- `roya-sales-ai-frontend/src/app/pages/projects/project-edit/project-edit.component.ts`
- (templates already OK) `templates/*/partials/financial*.hbs`

---

## Notes
- Path B (direct fix): hydrate at assemble + FE snapshot completeness; no blueprint change.
- Runtime evidence from prior session DNA payload: service items had `id/name/price/qty` only — no description fields.
