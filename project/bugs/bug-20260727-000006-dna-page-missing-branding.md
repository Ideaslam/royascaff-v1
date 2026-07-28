# Bug 20260727-000006 — DNA page missing branding section

## Status
**DONE** — Confirmed 2026-07-27

## Reported
- **Date**: 2026-07-27
- **Severity**: medium
- **Affected area**: web / Project DNA page (`PG-PROJECTS-05`)

## Description
After adding a color palette and regenerating DNA, the AI/pipeline returns DNA with branding (colors + source), but the DNA page view does not show a Branding section.

## Expected Behavior
DNA page structured sections include `branding` (colors + source) when present in `dna.data`, same as client / research / images / etc.

## Steps to Reproduce
1. Edit a project → set color palette → save
2. Regenerate DNA and wait until ready
3. Open View DNA
4. Observe: no Branding block under DNA sections (even though API `dna.data.branding` exists)

## Root Cause
`project-dna.component.ts` `dnaSections` hardcodes display keys and omits `branding`. i18n `projects.dnaKeys` also lacks a `branding` label. Backend inject/reconcile (`dna-passthrough` / `resolveBrandingColors`) is fine — this is a FE render gap after change-20260727-000022.

## Fix Applied
Added `branding` to DNA page section keys so `dna.data.branding` (colors + source) renders like other DNA blocks. Added EN/AR `projects.dnaKeys.branding` labels.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-frontend/src/app/pages/projects/project-dna/project-dna.component.ts`
- `roya-sales-ai-frontend/src/assets/i18n/en.json`
- `roya-sales-ai-frontend/src/assets/i18n/ar.json`
