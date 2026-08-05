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
- Notes (REQ-CONTRACT-TEMPLATE cover/watermark/font pack — `scripts/contract-templates/roya-default.html` content redesign, re-seeded, no method/schema change):
  - **Cover page** (`page-break-after: always`, true edge-to-edge bleed on print): single solid `{{brand_secondary}}` fill — no gradient, no pattern; large bold hero title + tagline in light text; bottom two-column info strip (Contract Number / Client Name / Date Issued / Submitted By | Phone / Email / Address). True bleed is driven by `body.pdf-cover-pass`/`body.pdf-content-pass` print rules paired with `ContractPdfService`'s two-pass render (see `contracts.md` SVC-CONTRACTS-02) — CSS alone (negative margins/overflow) cannot bleed past Chromium's print margin box.
  - **At-a-glance strip**: short accent-colored summary band right after the cover, before المادة الأولى — Contract Number / Client / Duration / `{{contract_total}}`.
  - **Watermark**: `position: fixed`, diagonally-rotated, low-opacity `{{workspace_name}}` text on every content page (not the cover) — Chromium repeats `position: fixed` elements per printed page automatically, no per-page JS. Page-number visual weight is handled separately by `ContractPdfService`'s footer template.
  - **Restyle** (legal wording/order unchanged): numbered clause "badges" via CSS counters replace plain `المادة X` headers; boxed callout styling on the financial-terms and termination clause intros; refined spacing/table/signature styling.
  - **Font**: `<head>` includes `{{document_font_link}}` (Google Fonts `<link>` for the workspace's selected font — `Cairo`/`Tajawal`/`Amiri`) and `body { font-family: {{document_font}} }`, replacing the old hardcoded font stack.
  - Old in-body letterhead (logo + `<h1>` + meta) folded into the cover; article content opens with a slim recap line instead.
- Notes (REQ-SETTINGS-FORMAL): default `roya-default` party-1 clause + signature header use `{{workspace_formal_name}}` / `{{workspace_cr}}` / `{{workspace_representative}}` / `{{workspace_city}}` (no hardcoded Roya legal entity); brand/trade references keep `{{workspace_name}}`. Re-seed via `npm run seed:contract-templates`.
