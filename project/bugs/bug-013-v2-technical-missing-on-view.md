# Bug #013 — v2 technical blank on Proposal View (financial OK)

## Status
**DONE** — Confirmed 2026-07-28

## Reported
- **Date**: 2026-07-28
- **Severity**: high
- **Affected area**: web / Proposal View (`proposal-view.component.ts` · `applyRendered`)

## Description
On `/proposals/:id/view` for a **v2-generated** creative proposal (often routed into the v3 UI because `projectId` / `generation` is set), the **Technical** tab shows no iframe. **Financial** tab loads correctly.

## Expected Behavior
Technical preview should resolve the same way as archive/list and financial: from proposal URL maps (`technicalUrlByLang` / legacy / flat), with v3 `renderedByLang` as fallback — not only from pipeline status `rendered`.

## Steps to Reproduce
1. Open a v2 creative proposal that has financial S3 URLs and technical S3 URLs (or inline/legacy technical URL) but empty/missing `renderedByLang`.
2. Go to `/proposals/:id/view` (defaults to Technical).
3. Technical empty; switch to Financial → content appears.

## Root Cause
`isV3` is true when `pipelineVersion === '3' || generation || projectId`, so many v2 project-linked proposals use the v3 view branch.

In `applyRendered`:
- **Financial** correctly uses `getFinancialUrl(proposal, lang)` (URL maps).
- **Technical** only uses `pipelineStatus.rendered[lang].htmlUrl` (`renderedByLang` from status API).

v2 export fills `technicalUrlByLang` / `technicalHtmlUrl`, not `renderedByLang`. Status `rendered` is empty → technical iframe stays null. `getTechnicalUrl` already implements the correct fallback chain but is unused here.

## Fix Applied
1. Technical tab uses `getTechnicalUrl(proposal, lang)` then status `rendered.htmlUrl` fallback (mirrors financial).
2. `langOptions` also seeded from tech/fin URL maps when `renderedByLang` is empty (v2).
3. Refresh proposal document on terminal statuses so URL maps are current before resolve.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-frontend/src/app/pages/proposals/proposal-view/proposal-view.component.ts`
- `roya-sales-ai-frontend/src/app/core/utils/proposal-html-urls.ts` (`getTechnicalUrl` — reused)

---

## Notes
- Path B (direct fix): FE display resolve only; no API/schema.
- Optional small follow-up: derive `langOptions` from URL maps when `rendered` is empty (not required for technical to show with default `activeLang`).
