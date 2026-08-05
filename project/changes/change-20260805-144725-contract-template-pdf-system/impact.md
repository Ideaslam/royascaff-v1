# Impact Analysis — Contract Template + PDF System

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema (contracts) | complete | `mongodb-legal-contracts.repository.ts` (flexible schema, collection `contracts`) | no `templateId`/`notes` fields yet |
| Schema (contract templates) | none | — | collection does not exist |
| Service (contract render) | partial | `contracts.data.service.ts` (`renderContractHtml`, `applyTemplateVars`, static file load) | hardcoded static template + PNG logo, `{{UPPER_SNAKE}}` tokens |
| Service (contract PDF) | none | — | no Puppeteer contract PDF path; FE does `window.print()` only |
| Endpoint (contracts) | complete | `contracts.controller.ts` | `POST /` needs `templateId`/`notes`; needs new `POST /:id/pdf` |
| Endpoint (contract templates) | none | — | no controller |
| Page (contracts list/create) | partial | `contracts.component.ts` | create dialog has Client+Proposal only, no Template/Notes |
| Page (contract edit) | partial | `contract-edit.component.ts` | no "Download PDF" button, no Notes field |
| Page (template management) | none | — | no admin UI |
| Permissions | partial | `config-seed-data.js` (`permissions`, `roles`) | no `contract-template.manage` key |
| Reusable PDF infra | complete | `pipeline-v3/pdf/pdf-render.service.ts` | plain `@Injectable`, no NestJS DI deps beyond `config`/`logger` → directly reusable outside `pipeline-v3` module; `renderHtmlToPdf()` options need extending for `displayHeaderFooter`/`headerTemplate`/`footerTemplate`/`margin` |
| Reusable branding source | complete | `settings.data.service.ts` (`getPublicSettings` → `logoUrl`, `companyName`, `email`, `phone`, `address`) | same source already used by proposal PDFs (`assemble.service.ts`, `export.service.ts`) |

Feature state: **partial** (contract creation/edit/list exist and work; template system, dynamic branding, and real PDF export do not).

## Affected Modules
- **Contracts (API)**: new `contract-templates` persistence + service + controller; `ContractsDataService.renderContractHtml` reworked to take template HTML + new token vocabulary; `CreateContractDto` gains `templateId`/`notes`; new `ContractPdfService` + `POST /:id/pdf`; new seed script `seed-contract-templates.js`; remove `src/templates/contract_template.html` + `contract-logo.png` once migrated; new permission `contract-template.manage` in `config-seed-data.js`.
- **Contracts (Web)**: create dialog gets Template select + Notes textarea; contract-edit gets Notes field (meta tab) + "Download PDF" button; new `Contract Templates` list + editor pages + route + sidebar entry (admin-only, gated by `contract-template.manage`); `AppDataService` gains contract-template CRUD + `downloadContractPdf`; `app.models.ts` gains `ContractTemplate` type + `Contract.templateId`/`notes`.
- **Permissions (API+Web)**: new permission key seeded + assigned to `admin` role only; FE `*appHasPermission` guard on the new nav entry/pages.

## Pack blueprint files to create
- [x] `blueprint/plan/data-model-delta.md` — `contract_templates` collection (after-state) + `contracts` delta (`templateId`, `notes`)
- [x] `blueprint/plan/modules-delta.md` — Contracts module gains "Contract Templates" sub-feature
- [x] `blueprint/actions/api/services/contract-templates.md`
- [x] `blueprint/actions/api/services/contracts.md` (delta: render + PDF)
- [x] `blueprint/actions/api/endpoints/contract-templates.md`
- [x] `blueprint/actions/api/endpoints/contracts.md` (delta: create body, `:id/pdf`)
- [x] `blueprint/actions/web/pages/contract-templates.md`
- [x] `blueprint/actions/web/pages/contracts.md` (delta: create dialog, edit page)
- [x] `blueprint/_index.md` + pack `status.md`

## Risk: complexity Medium-High, cross-module Yes (contracts + settings + permissions), migration Yes (one-time seed of `roya-default` template; no destructive migration of existing `contracts` documents)

## Recommendation
- **Create**: `contract_templates` collection + repo + service + controller; `ContractPdfService`; template management web pages; seed script.
- **Modify (ripple)**: `ContractsDataService.renderContractHtml`/`applyTemplateVars` (new token source + vocabulary); `contracts.controller.ts` (`POST /`, new `POST /:id/pdf`); `CreateContractDto`; contracts create dialog + contract-edit page; `config-seed-data.js` (new permission); `PdfRenderService.renderHtmlToPdf` (extend options, backward compatible).
- **Remove** (post-migration): `src/templates/contract_template.html`, `contract-logo.png`, `contract-logo-ex.png`.

## Status target (per artifact in the pack after implement)
- `contract_templates` schema → done
- `ContractTemplatesDataService` / controller / DTOs → done
- `ContractPdfService` + `PdfRenderService` header/footer option → done
- `ContractsDataService` render rework + `templateId`/`notes` → done
- `POST /:id/pdf` endpoint → done
- Seed script + permission seed → done
- Web: create dialog (template + notes) → done
- Web: contract-edit (notes + Download PDF) → done
- Web: Contract Templates list + editor pages → done
- Static template file removal → done

## Dependencies
- depends-on: — (none)
