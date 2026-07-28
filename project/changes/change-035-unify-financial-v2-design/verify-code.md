# Verify — change-035-unify-financial-v2-design

**Date:** 2026-07-28  
**Overall:** PASS

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | v3 Financial HTML matches v2 commercial structure | PASS | `renderFinancialDocumentHtml` + template; smoke has cover + services section |
| 2 | AR/EN labels + dir | PASS | `documentLang` drives `UI_LABELS` + `HTML_DIR` |
| 3 | Totals code-computed | PASS | `financialTotalsFromProposal` unchanged; no AI |
| 4 | Regen/translate pick up design | PASS | Same `ExportService.runExport` path |
| 5 | Deck `financial.hbs` unchanged | PASS | No assemble/template partial edits |
| 6 | No new EP / schema | PASS | Export wiring + assets/template only |

## Smoke
```text
ts-node buildFinancialProposalHtml → len ~668k, cover+table+data-uri, no leftover {{TOKENS}}
```

## Manual
- Re-export or regenerate a v3 proposal; open Financial tab — should match v2 commercial look.
