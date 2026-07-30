# Bug 20260730-130700 — Archive editor save: PDF/HTML/viewer out of sync

## Status
**DONE** — Confirmed 2026-07-30

## Reported
- **Date**: 2026-07-30
- **Severity**: high
- **Affected area**: Proposal archive editor save · Proposal View · v3 `renderedByLang` artifacts

## Description
After editing a v3 proposal from the **archive proposal editor** and saving technical HTML:
- Viewer / Open HTML could show correct edits (or stale cached HTML).
- **PDF still pointed at the last assemble/export PDF** — editor edits did not appear in PDF download.

Related symptom earlier in the same session: HTML used a **stable S3 key** (`technical-ar.html` / `proposal.html`) while PDF used a **unique UUID key**, so browsers cached old HTML after overwrite.

## Expected Behavior
One save of the technical document should update **viewer, Open HTML, and PDF** from the same canonical artifact pair — no divergent URL fields, no stale PDF from the previous assemble.

## Steps to Reproduce
1. Open a ready v3 proposal in the archive editor; change visible cover/financial content; save technical.
2. Open Proposal View from the project module.
3. Viewer / HTML may show edits; Download PDF still shows the pre-edit assemble version.
4. (Cache variant) Save again to the same HTML URL → Open HTML can still show the previous file until hard refresh.

## Root Cause
1. `patchProposalDocument` (technical) uploaded HTML and updated `technicalUrlByLang` / `renderedByLang[lang].htmlUrl`, but **left `renderedByLang[lang].pdfUrl` unchanged** (still last assemble UUID PDF).
2. HTML used `uploadHtml` with a **fixed filename** (stable public URL) while PDF used `uploadFile` (unique URL) → iframe / Open HTML could serve cached HTML.
3. Consumers mixed sources: `technicalUrlByLang`, `technicalHtmlUrlByLang`, `technicalHtmlUrl`, `technicalAr`, and `renderedByLang` — easy for viewer vs PDF to diverge.

## Fix Applied
1. On technical save (v3): re-render PDF from saved HTML; write **both** `htmlUrl` and `pdfUrl` on `renderedByLang[lang]`.
2. Upload HTML and PDF with **unique S3 keys** under `proposals/{id}/v3/{lang}/` (same pattern as assemble PDF).
3. Mirror the same `htmlUrl` into `technicalUrlByLang` / `technicalHtmlUrlByLang` / `technicalHtmlUrl`.
4. Assemble also uses unique HTML upload keys.
5. Frontend + `document-html` prefer canonical `renderedByLang[lang].htmlUrl` / `.pdfUrl` first (`getTechnicalUrl` / `getTechnicalPdfUrl` / viewer `applyRendered`).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-api-v2/src/services/data/proposals.data.service.ts` (`patchProposalDocument`)
- `roya-sales-ai-api-v2/src/pipeline-v3/assemble/assemble.service.ts` (unique HTML upload)
- `roya-sales-ai-api-v2/src/modules/proposals/proposals-operations.controller.ts` (`proposalHtmlUrlForLang`, put technical response)
- `roya-sales-ai-frontend/src/app/core/utils/proposal-html-urls.ts`
- `roya-sales-ai-frontend/src/app/pages/proposals/proposal-view/proposal-view.component.ts`
- `roya-sales-ai-frontend/src/app/pages/proposals/proposal-edit/proposal-edit.component.ts`
- `roya-sales-ai-frontend/src/app/core/services/app-data.service.ts`

---

## Notes
- Path B (direct fix): artifact URL sync + PDF re-render on editor save; no blueprint pack.
- Canonical pair: `renderedByLang[lang] = { htmlUrl, pdfUrl, htmlKey, pdfKey, assembledAt }`.
- `technicalAr` / `technicalEn` remain editor inline buffers only — not the public URL source of truth.
- Same session also shipped related assemble/UI polish (cover `date` / `company_name`, financial headers+labels from code); tracked here only as context — this bug file is the editor HTML/PDF desync.
