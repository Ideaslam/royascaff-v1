# Services — Pipeline v3 Export · Standalone financial (v2 design)

### SVC-PIPE-S3-06 · ExportService [domain, internal, PipelineV3]
- Status: done
- Methods:
  - `runExport(job)` — unchanged flow: promote staging → `renderedByLang[lang]`; **build standalone financial.html via commercial template renderer** (not simplified invoice builder); upload S3; upsert technical/financial URL maps; `type: 'creative'`; `ready` / `partially_failed`
- Deps: S3Service, ProposalsRepository, ProjectsRepository, SettingsDataService, `renderFinancialDocumentHtml` (ported template)
- Side effects: file (S3)
- Rules:
  - retryable independently; merge URL maps per-lang
  - money totals remain code-computed (`financialTotalsFromProposal`)
  - load workspace public settings for company/bank/validity/issuer fields
  - map proposal/project client + services into template input (name, nameEn, unit, category, description*, revenueType, price)
  - branding colors from project DNA / proposal theme when present; else Roya defaults matching FE
  - document language = export language (`ar`|`en`)
  - asset URLs absolute and durable for S3 iframe (see assets strategy below)
  - do **not** change pitch-deck `financial.hbs` assemble path

### SVC-PIPE-FIN-DOC · Financial document renderer [domain, internal]
- Status: done
- Methods:
  - `renderFinancialDocumentHtml(data: FinancialTemplateData): string` — load API copy of `financial_template.html`, apply same token replacements as FE `FinancialTemplateService.render` (labels AR/EN, services table by category, bar chart, 50/30/20 phases, terms, remarks, bank/signature blocks)
  - `financialTotalsFromProposal(proposal, project)` — keep existing helper (may stay in builder file or move next to renderer)
- Deps: filesystem template under API repo; optional `FINANCIAL_ASSET_BASE_URL` / `PUBLIC_WEB_BASE_URL`
- Side effects: none (pure string)
- Rules:
  - parity with FE template structure; degrade missing optional fields to `—` / empty (same as FE)
  - no AI

## Assets strategy
1. Copy into API repo (preferred for self-contained deploys):
   - `financial_template.html` (from FE `public/templates/` or `src/app/shared/templates/`)
   - `financial-cover-bg.png`, `financial-cover-logo.png`
   - `SFMADA.TTF`, `SF-MADA-BOLD.TTF`
2. Resolve cover/font URLs as:
   - **Preferred:** absolute URL = `PUBLIC_WEB_BASE_URL` (or `FINANCIAL_ASSET_BASE_URL`) + asset path if FE public assets are already hosted; **or**
   - Serve/copy assets under API static path and prefix with API public base; **or**
   - Upload assets once to S3 public prefix and hardcode/config that base
3. Document required env in `.env.example` if a base URL is used.

## Delta
- Before: `buildFinancialProposalHtml` emits short invoice-like HTML (hero + table + totals + note).
- After: same export entry point emits v2 commercial multi-section HTML via ported template; ExportService wires Settings + client/service fields.
