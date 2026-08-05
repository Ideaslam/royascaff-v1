# Services — Safqa API · Contract Templates

### SVC-CONTRACT-TEMPLATES-01 · ContractTemplatesDataService [domain, internal, Contracts]
- Status: done
- File: `src/services/data/contract-templates.data.service.ts`
- Repo: `CONTRACT_TEMPLATES_REPOSITORY` → `MongoContractTemplatesRepository` (collection `contract_templates`, flexible schema, global — deliberately outside `TENANT_ISOLATED_COLLECTIONS`)
- Methods:
  - `listTemplates(query)` — admin list (no `content` field)
  - `listActiveTemplatesLite()` — `{ id, key, name, nameEn, isDefault }[]`, any authenticated user (create-contract picker)
  - `getTemplateById(id)` / `getDefaultTemplate()` — `status: active` + `isDefault: true`
  - `createTemplate(input)` — validates unique `key`; `isDefault: true` clears default on all others first
  - `updateTemplate(id, patch)` — same default-exclusivity rule
  - `deleteTemplate(id)` — blocked if last remaining template, or if `isDefault` while other templates exist
- Side effects: none (pure data layer)
- Notes:
  - Rendering integration: `ContractsDataService.renderContractHtml` takes the resolved template `content` string instead of reading a static file (see `contracts.md` SVC-CONTRACTS-01)
  - Seeded via `scripts/seed-contract-templates.js` (upserts `roya-default`, migrated verbatim from the legacy `src/templates/contract_template.html`, now removed) — folded into `npm run seed`
