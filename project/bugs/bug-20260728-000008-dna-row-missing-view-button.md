# Bug 20260728-000008 — DNA versions table missing View button

## Status
**DONE** — Confirmed 2026-07-28

## Reported
- **Date**: 2026-07-28
- **Severity**: medium
- **Affected area**: web / Project workspace (`PG-PROJECTS-03`) DNA versions table + DNA view page

## Description
On the project page (`/projects/:id`), DNA version rows had no way to inspect the AI-generated DNA object. Users need a View action that shows the generated DNA result (section cards + full JSON), separate from Edit (inputs form).

## Expected Behavior
- **View DNA** → `/projects/:id/dna/:vid/view` shows generated DNA: each section in its own card as JSON, plus a full DNA object card
- **Edit** → `/projects/:id/dna/:vid` opens the edit form (inputs)

## Steps to Reproduce
1. Open a project with a ready DNA version
2. Look at DNA versions row actions
3. Need View to inspect AI DNA output without opening the edit form

## Root Cause
After DNA versions (change-20260727-000026), row actions only opened the edit form. The legacy DNA viewer (`ProjectDnaComponent`) stayed on project-level `/dna` and was not wired per version.

## Fix Applied
1. Restored **Edit** → DNA form (`openDna`)
2. Added **View DNA** → `/projects/:id/dna/:vid/view` (`viewDna`)
3. Made `ProjectDnaComponent` version-aware: loads `getDnaVersion`, renders each `dna.data` section as a JSON card + full object card
4. Route order: `dna/:vid/view` before `dna/:vid`

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-frontend/src/app/pages/projects/project-detail/project-detail.component.ts`
- `roya-sales-ai-frontend/src/app/pages/projects/project-dna/project-dna.component.ts`
- `roya-sales-ai-frontend/src/app/app.routes.ts`
- `roya-sales-ai-frontend/src/assets/i18n/en.json`
- `roya-sales-ai-frontend/src/assets/i18n/ar.json`
