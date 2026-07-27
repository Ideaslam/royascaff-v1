# Bug #005 — Project form missing research types

## Status
**DONE** — Confirmed 2026-07-27

## Reported
- **Date**: 2026-07-27
- **Severity**: high
- **Affected area**: web / Projects create (+ edit) · Research modules UI

## Description
Create Project form “Research modules” only shows Market, Competitor, Audience. The other five research types (trends, benchmarks, case studies, social analysis, action plan) are missing even though Pipeline v3 / change-018 supports all 8.

## Expected Behavior
Research modules panel lists all 8 option keys (same set as Creative / DNA schema), selectable via checkboxes, and selected keys are saved on `project.info.researchOptions`.

## Steps to Reproduce
1. Open Create Project (`/projects/new`)
2. Go to the step with “Research modules”
3. Observe only 3 options

## Root Cause
`project-create.component.ts` and `project-edit.component.ts` hardcode:
`researchKeys = ['market', 'competitor', 'audience']`.
i18n `projects.research.*` only defines those three labels. Creative already uses `CREATIVE_RESEARCH_OPTIONS` (full 8).

## Fix Applied
Create/Edit Project research panel now uses `CREATIVE_RESEARCH_OPTIONS` (all 8 keys) with Font Awesome icons. Defaults remain market/competitor/audience on; other five off. Edit hydrates any saved option. EN/AR `projects.research.*` labels added for the five missing keys.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-frontend/src/app/pages/projects/project-create/project-create.component.ts`
- `roya-sales-ai-frontend/src/app/pages/projects/project-edit/project-edit.component.ts`
- `roya-sales-ai-frontend/src/assets/i18n/en.json`
- `roya-sales-ai-frontend/src/assets/i18n/ar.json`
