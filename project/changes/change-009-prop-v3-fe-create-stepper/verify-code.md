# Verify Code — change-009-prop-v3-fe-create-stepper

- **date**: 2026-07-26
- **result**: PASS
- **request-id**: REQ-PROP-V3 (part 6/8)

## Checks

| Acceptance | Evidence | Status |
|------------|----------|--------|
| Create Project + multipart + template → proposal | `ProjectCreateComponent` → ProjectsService create/rfp/images/createProposal | PASS |
| Pipeline stepper polls status 3–5s | `PipelineStepperComponent` + proposal-view poll 4s; failed/partially_failed/ready labels | PASS |
| HTML preview + server PDF | iframe `htmlUrl`; Download PDF opens `pdfUrl` | PASS |
| Retry / Translate / New template / Regenerate | proposal-view actions → change-008 APIs | PASS |
| Project workspace lists proposals | `ProjectDetailComponent` + sibling dialog | PASS |
| Flag off hides/disables v3 create | create page redirects; list shows flagOff + creative link; `/creative` untouched | PASS |
| Templates list API | `GET /api/data/templates` → `{ items }` | PASS |
| Builds | API `npm run build` exit 0; FE `npm run build` exit 0 | PASS |

## Gaps / notes

- Live e2e (flag on + Redis/Claude) not run in this verify.
- Proposals-by-project uses client-side filter on `/proposals/search?mode=full` (no dedicated filter API).
- Settings UI checkbox for `pipelineV3Enabled` relies on existing schema-driven settings if field is in API schema; FE reads flag from settings state.

## Verdict

**PASS** — ready for merge gate (Step 5.6).
