# Bug Log


| ID | Date | Severity | Area | Summary | Status | File / Change pack |
|----|------|----------|------|---------|--------|--------------------|
| 20260730-131000 | 2026-07-30 | medium | Assemble financial / services | Catalog service description missing on financial slide | DONE | `bug-20260730-131000-financial-service-description-missing.md` |
| 20260730-130700 | 2026-07-30 | high | Proposal editor / view artifacts | Archive save updates HTML but PDF (and cached HTML) stay on last assemble | DONE | `bug-20260730-130700-editor-save-html-pdf-desync.md` |
| 20260729-193800 | 2026-07-29 | low | web list tables | Rows-per-page dropdown only offers 5; need 5,10,25,50 | DONE | `bug-20260729-193800-pagination-rows-per-page-options.md` |
| 20260729-193600 | 2026-07-29 | high | Pipeline v3 sections | Visual `imageRef` fails richness (ID too short / thin) | DONE | `bug-20260729-193600-visual-imageRef-richness-too-thin.md` |
| 20260729-190500 | 2026-07-29 | high | API S3/R2 | Media URLs inject static `roya-sales-ai` folder | DONE | `bug-20260729-190500-r2-static-base-folder.md` |
| 20260729-185900 | 2026-07-29 | high | Pipeline v3 PDF / prod k8s | PDF proposal fails in prod (Chromium + read-only root) | PENDING | `bug-20260729-185900-prod-pdf-chromium-readonly.md` |
| 20260729-125821 | 2026-07-29 | high | Templates + emails + section AI | Roya hardcodes instead of workspace Settings brand | DONE | `change-20260729-125821-bug-fix-workspace-branding/` (merged 2026-07-29) · `bug-20260729-125821-workspace-not-roya-branding.md` |
| 20260728-000014 | 2026-07-28 | high | Pipeline v3 assemble / branding | Zid proposal cover shows PayUp (workspace) not client logo | DONE | `change-20260728-000036-client-first-pitch-branding/` (merged 2026-07-28) · `bug-20260728-000014-zid-proposal-shows-payup-branding.md` |
| 20260728-000013 | 2026-07-28 | high | Proposal View | v2 technical blank; financial OK (rendered-only resolve) | DONE | `bug-20260728-000013-v2-technical-missing-on-view.md` |
| 20260728-000012 | 2026-07-28 | high | Pipeline v2 financials | Financials still fails: Arabic comma / bidi marks | PENDING | `bug-20260728-000012-financials-arabic-comma-validation.md` |
| 20260728-000011 | 2026-07-28 | high | Creative Pipeline v2 | HTML repair uses non-stream Claude; fails on >10min | FIXED (await confirm) | `bug-20260728-000011-creative-v2-html-repair-timeout.md` |
| 20260728-000010 | 2026-07-28 | high | Pipeline v2 financials | Section batch fails: grand total validation too strict | DONE | `bug-20260728-000010-financials-grand-total-validation.md` |
| 20260728-000009 | 2026-07-28 | high | Projects + pipeline DNA | Selected 8 research options filtered to 3 on generate | DONE | `bug-20260728-000009-research-options-filtered-to-three.md` |
| 20260728-000008 | 2026-07-28 | medium | Project workspace DNA table | DNA version rows missing View button | DONE | `bug-20260728-000008-dna-row-missing-view-button.md` |
| 20260727-000007 | 2026-07-27 | high | Pipeline v3 sections | Always stuck at Writing 15/16; Continue finishes | DONE | `bug-20260727-000007-stuck-at-15-of-16-sections.md` |
| 20260727-000006 | 2026-07-27 | medium | Project DNA page | DNA view omits branding section after palette regen | DONE | `bug-20260727-000006-dna-page-missing-branding.md` |
| 20260727-000005 | 2026-07-27 | high | Projects create/edit form | Research modules UI only shows 3 of 8 types | DONE | `bug-20260727-000005-project-form-missing-research-types.md` |
| 20260727-000001 | 2026-07-27 | high | AI Requests / pipeline-traces | Tokens/cost missing; detail viewer incomplete; label lacks projectId; needs project grouping | DONE | `bug-20260727-000001-ai-requests-display.md` |
| 20260727-000002 | 2026-07-27 | critical | Pipeline v3 resume | Mid-run stop (app/Redis) never continues from checkpoint | DONE | `change-20260727-000015-pipeline-durable-resume/` (merged 2026-07-27) · `bug-20260727-000002-pipeline-resume-after-restart.md` |
| 20260727-000003 | 2026-07-27 | high | Pipeline v3 resume / proposal view | After assemble/Chromium fail, Continue missing; Retry does not re-run upload | DONE | `change-20260727-000016-bug-fix-resume-after-assemble-fail/` (merged 2026-07-27) · `bug-20260727-000003-continue-after-assemble-fail.md` |
| 20260727-000004 | 2026-07-27 | high | frontend auth | Backend restart clears JWT session; forced re-login | DONE | `bug-20260727-000004-session-cleared-on-backend-restart.md` |
