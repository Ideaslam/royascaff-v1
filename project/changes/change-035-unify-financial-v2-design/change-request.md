# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-FIN-UNIFY
- **part**: 1/1
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Pipeline v3 Export · Standalone financial document
- Feature(s): Unify v3 Financial HTML with v2 commercial design (`financial_template.html`)
- Endpoint(s): existing export / regenerate / translate paths (no new EP)
- Page(s)/View(s): Financial tab already loads URL maps — visual parity via new HTML only
- Service(s): `ExportService` · `buildFinancialProposalHtml` (replace) · port of FE `FinancialTemplateService`

## Description
Pipeline v2 standalone financial docs use the rich FE template (cover, services + units/descriptions, distribution chart, payment phases, terms, bank/signature). Pipeline v3 export uses a simplified invoice-like builder in `financial-html.builder.ts`, so Financial tab looks different by engine.

**Unify:** v3 export must produce the **same commercial design as v2** by porting `financial_template.html` + render logic into the API and calling it from `ExportService.runExport` (and any path that re-runs export: regenerate / translate).

**Defaults confirmed with proceed:**
1. **Standalone Financial document only** — leave pitch-deck `financial.hbs` unchanged.
2. **Forward path** — new export / regenerate / translate pick up the design; no bulk migrate of already-exported S3 files (re-export refreshes).
3. **v2 create** — FE `FinancialTemplateService` stays as-is for creative v2 create.

Wire richer inputs available at export: proposal/project services + totals, client fields, workspace settings (issuer/bank/tax), branding colors when present. Assets (cover/logo/fonts) must resolve via absolute URLs the API can embed (public FE assets base, S3, or API static) — not Angular `document.baseURI`.

## Acceptance Criteria
1. A newly exported v3 proposal’s Financial tab HTML matches the v2 commercial template structure (cover, client/project, services table with units/descriptions when present, payment phases, terms/notes, bank/signature blocks as data allows).
2. AR and EN exports both use the same template with correct `dir` / labels (parity with FE `documentLang`).
3. Money totals remain code-computed (subtotal / tax / grandTotal) — no AI rewrite of financial figures.
4. Regenerate and translate re-export paths produce the unified design without FE changes.
5. Pitch-deck technical financial section (`financial.hbs`) unchanged.
6. No new endpoints or data-model fields required (optional: none).

## Notes
- Closes the known gap from change-013 (simplified builder vs full FE template).
- Primary code: `pipeline-v3/export/financial-html.builder.ts`, `export.service.ts`; new API template + renderer under e.g. `pipeline-v3/export/financial-template/` or shared `lib/financial-document/`.
- Source of truth for design: `roya-sales-ai-frontend/.../financial_template.html` + `FinancialTemplateService`.
