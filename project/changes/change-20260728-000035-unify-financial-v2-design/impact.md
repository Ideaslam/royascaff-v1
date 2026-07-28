# Impact Analysis — Unify v3 financial HTML with v2 design

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| v2 FE renderer | complete | `roya-sales-ai-frontend/.../financial-template.service.ts` + `public/templates/financial_template.html` (via `templates/`) + `public/assets/proposals/*` + `public/fonts/SF*` | Design source of truth; Angular-only `baseURI` assets |
| v3 export builder | partial | `pipeline-v3/export/financial-html.builder.ts` | Simplified invoice page — not commercial template |
| v3 ExportService | partial | `pipeline-v3/export/export.service.ts` | Calls thin builder; no Settings/client/branding wiring |
| Totals helper | complete | `financialTotalsFromProposal` in same builder | Reuse; map services → template shape (name/unit/category/desc) |
| Settings load | complete | `SettingsDataService.getPublicSettings` (used by assemble) | Not injected into ExportService yet |
| Deck financial | complete | `templates/*/partials/financial.hbs` | **Out of scope** |
| Endpoints | complete | EP-PROP-PIPE regenerate/translate/export queue | No new EP — export job already produces financial.html |
| FE view | complete | Proposal View Financial tab via URL maps | No FE change if S3 HTML is correct |

Feature state: **partial** (dual-doc exists; design parity missing — known change-20260726-000013 gap)

## Affected Modules
- Pipeline v3 Export — replace standalone financial HTML renderer
- Optional shared: copy template + cover/font assets into API for self-contained S3 HTML

## Pack blueprint files to create
- [ ] `blueprint/actions/api/services/pipeline-export-financial.md` — ExportService + renderer after-state
- [ ] `blueprint/plan/modules.md` — Export feature note (standalone financial = v2 commercial template)
- [ ] `blueprint/_index.md` + pack `status.md`

> No new endpoints / data-model. Do not edit main plan/actions until merge.

## Code files to modify / create

| App | Path | Action |
|-----|------|--------|
| api | `src/pipeline-v3/export/financial-template/` (new) | Port template HTML + TS renderer (labels, table, chart, phases) from FE |
| api | `src/pipeline-v3/export/financial-html.builder.ts` | Thin wrapper → call ported renderer; keep `financialTotalsFromProposal` |
| api | `src/pipeline-v3/export/export.service.ts` | Inject Settings (+ client/project fields); build `FinancialTemplateData`; asset base URL |
| api | assets under e.g. `templates/financial-document/` or `public/financial/` | Copy cover PNG + SF Mada fonts from FE `public/` |
| api | env / config | `PUBLIC_WEB_BASE_URL` or serve/copy assets so absolute URLs work in S3 iframes |

## Ripple effects
- Regenerate / translate / rerender → export automatically get new design
- Already-exported v3 financial URLs unchanged until re-export
- v2 FE create path unchanged
- Assemble deck `financial.hbs` unchanged

## Risk
- Complexity: **M** (large template port + asset URL strategy)
- Cross-module: **N** (export + settings read only)
- Migration: **N** (no schema; optional re-export)

## Recommendation
- **Modify**: `ExportService` + replace `buildFinancialProposalHtml` body with ported v2 renderer
- **Create**: API-side template + assets + pure render module
- **Complete**: change-20260726-000013 design parity gap

## Status target (pack artifacts after implement)
- SVC-PIPE-EXPORT-FIN (renderer + export wiring) → planned → done
- modules note → planned → done

## Dependencies
- depends-on: — 
