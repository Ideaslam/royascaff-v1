# Pack Status — change-20260805-171001-contract-template-cover-watermark-font

- **pack-status**: merged
- **request-id**: REQ-CONTRACT-TEMPLATE
- **depends-on**: —
- **Artifacts done**: 5/5 (user PASSed visual review 2026-08-05, incl. 3 post-verify fix rounds — short contract number, dynamic font validation, cover redesign/true bleed; merged into main blueprint 2026-08-05)

## Artifacts

| ID / Name | Layer | Status | Notes |
|-----------|-------|--------|-------|
| `settings.defaultFont` enum | data-model | done | `Amiri` added in `settings-schema.ts` + `config-seed-data.js`; re-seeded |
| `contract_templates` token catalog | data-model | done | +8 tokens implemented in `renderContractHtml` |
| SVC-SETTINGS-01 | service | done | schema-only, no method change |
| SVC-CONTRACTS-01 | service | done | `renderContractHtml` new tokens (`document_font*`, `brand_*`, `contract_total`) + `createContractFromProposal` passes `defaultFont`/`colorRoles` |
| SVC-CONTRACTS-02 | service | done | `buildFooterTemplate` accepts `primaryColor`, page-number span restyled bold/larger/tinted |
| SVC-CONTRACT-TEMPLATES-01 | service | done | `roya-default.html` redesigned (cover, watermark, at-a-glance, badges, callouts, font) + re-seeded |
| PG-CONTRACT-TEMPLATES-02 | page | done | "Design / Branding" token group added to editor + i18n keys |

## Blockers

- none

## Next action

- None — pack merged. Further work on this area = new pack.
