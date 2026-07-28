# Verify Code — change-20260726-000013-prop-v3-creative-dual-docs

- **date**: 2026-07-26
- **result**: PASS
- **request-id**: REQ-PROP-V3

## Checks

| Acceptance | Evidence | Status |
|------------|----------|--------|
| Project proposals `type: 'creative'` | `createProposalFromProject` sets `type: "creative"`; export also sets `type: "creative"` | PASS |
| Export writes technical + financial URLs per lang | `ExportService` upserts `renderedByLang` + `technical*Url*` + builds/uploads `financial.html` + `financial*Url*` | PASS |
| List tech/fin open by language | Legacy maps filled; FE `getTechnicalUrl` also falls back to `renderedByLang` | PASS |
| Translate keeps source docs | Translate does not clear URL maps; export merges target lang only | PASS |
| Regenerate keeps other langs | `ProposalRegenerateService` strips only regenerated language keys | PASS |
| Send readiness dual URLs | Maps populated on export (same fields send/public read) | PASS |
| v3 view deck + lang switcher | `renderedByLang` still written | PASS |
| Build | API `tsc --noEmit` exit 0 | PASS |

## Gaps / notes

- Live e2e (create → export → list open tech/fin → translate → regenerate) not run in this verify.
- Financial HTML is a server-built creative-compatible document (not the full FE asset template); sufficient for list/send open.
- Existing pre-change v3 proposals are not backfilled until they re-export.

## Verdict

**PASS** — ready for merge gate (Step 5.6).
