# Blueprint Index — change-20260805-144725-contract-template-pdf-system

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| data-model | `plan/data-model-delta.md` | `contract_templates` (new) + `contracts.templateId/notes` | done | 1/1 | template catalog + contract delta + token catalog |
| modules | `plan/modules-delta.md` | Contracts → Contract Templates sub-feature | done | 1/1 | new admin permission + module note |
| service | `actions/api/services/contract-templates.md` | `ContractTemplatesDataService` | done | 1/1 | template CRUD + default-exclusivity + render helpers |
| service | `actions/api/services/contracts.md` | `ContractsDataService`, `ContractPdfService`, `PdfRenderService` delta | done | 1/1 | template-driven render + Puppeteer PDF export |
| endpoint | `actions/api/endpoints/contract-templates.md` | `data/contract-templates` CRUD | done | 1/1 | new controller |
| endpoint | `actions/api/endpoints/contracts.md` | `POST data/contracts`, `POST data/contracts/:id/pdf` | done | 1/1 | create body delta + new PDF route |
| page | `actions/web/pages/contract-templates.md` | Contract Templates list+editor, contracts create dialog delta, contract-edit delta | done | 1/1 | admin template UI + create/edit UX |

**Pack Done/Total**: 7/7

## Non-blueprint artifacts (implemented but not separately spec'd)
- Seed script `roya-sales-ai-api-v2/scripts/seed-contract-templates.js` (upserts `roya-default` from migrated `contract_template.html` content).
- Permission seed entry `contract-template.manage` in `scripts/config-seed-data.js` (`permissions` + `admin` role).
- Removal of `src/templates/contract_template.html`, `contract-logo.png`, `contract-logo-ex.png` after migration.
