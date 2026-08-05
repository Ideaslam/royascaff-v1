# Pack Status — change-20260805-144725-contract-template-pdf-system

- **pack-status**: merged
- **request-id**: REQ-CONTRACT-TEMPLATE
- **depends-on**: —
- **Artifacts done**: 7/7

## Artifacts

| ID / Name | Layer | Status | Notes |
|-----------|-------|--------|-------|
| `contract_templates` data model | data-model | done | global collection, `contracts.templateId`/`notes` added |
| Contracts module delta (permission) | modules | done | `contract-template.manage` seeded (permissions + admin role) |
| `ContractTemplatesDataService` | service | done | CRUD + default-exclusivity + lite list |
| `ContractsDataService`/`ContractPdfService`/`PdfRenderService` delta | service | done | template-driven render + Puppeteer PDF export; post-verify fix round: base64 logo inlining, single-logo header/footer redesign, `@page` margin-conflict fix (see verify-code.md) |
| `data/contract-templates` endpoints | endpoint | done | `ContractTemplatesController` |
| `data/contracts` endpoint delta | endpoint | done | create body delta + `POST :id/pdf` |
| Contract Templates web pages + contracts UI delta | page | done | list+editor pages, create dialog delta, contract-edit delta |

## Blockers
- none

## Next action
- Merged into main blueprint 2026-08-05 (see `merge-report.md`). Pack complete — further work is a new change pack.
