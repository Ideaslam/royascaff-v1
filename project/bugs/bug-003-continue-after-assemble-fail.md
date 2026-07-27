# Bug #003 — Continue / retry after assemble (Chromium) failure

## Status
**DONE** — Confirmed 2026-07-27; pack `change-016-bug-fix-resume-after-assemble-fail/` merged

## Reported
- **Date**: 2026-07-27
- **Severity**: high
- **Affected area**: Pipeline v3 resume / proposal view (API + FE)

## Description
After generation fails at assemble/PDF with Chromium missing, UI showed Failed + Retry failed sections but no Continue to re-run assemble/export once the browser path was fixed.

## Expected Behavior
Recoverable assemble/export failures expose Continue; resume and empty-section Retry re-enqueue assemble without wiping ready sections.

## Root Cause
`canResume`/`stuck` only covered non-terminal idle; resume no-oped on `failed`; Retry targeted failed sections only (`targetsCount === 0` when all ready).

## Fix Applied
- Status: `recoverableFailed` → `canResume`/`stuck`
- Resume: `failed` → `enqueueIncompleteSections` / assemble fan-in
- Retry: empty targets + ready sections → assemble fan-in
- FE: Continue on terminal recoverable failure
- Local `.env`: Google Chrome executable path for Puppeteer

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `projects.data.service.ts`
- `pipeline-resume.service.ts`
- `section-orchestrator.service.ts`
- `proposal-view.component.ts`
- `pdf-render.service.ts`
- `roya-sales-ai-api-v2/.env` (local Chrome path)
