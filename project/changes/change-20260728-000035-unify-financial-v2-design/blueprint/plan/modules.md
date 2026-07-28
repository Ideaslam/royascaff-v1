# Modules slice — Standalone financial design unify

## 6. Proposals / Pipeline v3

### Features (delta)

12. **Export (Step 5)** [backend-only] — S3 HTML/PDF → `renderedByLang`; `ready` / `partially_failed`; **standalone `financial.html` uses the v2 commercial template** (cover, services, distribution, payment phases, terms, bank/signature) via API-ported `FinancialTemplateService` / `financial_template.html`. Pitch-deck `financial.hbs` section unchanged. Totals remain code-computed.

## Delta
- Before: Export financial = simplified creative-compatible builder.
- After: Export financial = v2 commercial design (parity with FE create-time financial).
