# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: new-feature
- **target-app**: api+web (`api` = `roya-sales-ai-api-v2`, `web` = `roya-sales-ai-frontend`)
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-CONTRACT-TEMPLATE
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Contracts (new sub-module: Contract Templates)
- Feature(s): Contract template catalog (admin-managed, global), server-side PDF export with workspace logo + repeating header/footer + page numbers, per-contract "Notes / Special Terms" block, template picker on contract creation
- Endpoint(s): new `data/contract-templates` CRUD; new `POST data/contracts/:id/pdf`; modify `POST data/contracts` (templateId, notes)
- Page(s)/View(s): web: new `Contract Templates` list + editor pages (Settings area); modify `Contracts` create dialog; modify `Contract Edit` (notes field, Download PDF button)
- Service(s): new `ContractTemplatesDataService`; new `ContractPdfService`; modify `ContractsDataService`

## Description
Today a contract is created from an endorsed proposal using **one static HTML file** baked into the API repo (`src/templates/contract_template.html`) with a hardcoded PNG logo and `{{UPPER_SNAKE}}` string placeholders. There is no server-side PDF generation — "PDF" today means the browser's `window.print()` on the raw HTML, so there is no reliable page-numbering, no repeating header/footer chrome, and the logo is a static file baked into the container image rather than the workspace's actual branding.

This change introduces a proper **Contract Template system**:

1. **Contract Templates catalog** (new Mongo collection `contract_templates`, global — not workspace-scoped, mirroring how Pipeline v3 proposal `templates` are a shared catalog). Each template is a full HTML document (head+style+body) containing dynamic placeholder tokens (`{{workspace_name}}`, `{{client_name}}`, `{{services}}`, `{{contract_notes}}`, etc. — lower_snake_case, see token catalog in the blueprint). Exactly one template is flagged `isDefault`.
2. **Template management module** (admin-only, new permission `contract-template.manage`): a list page + an editor page where an admin writes/edits the raw HTML content of a template and inserts placeholder tokens by clicking them from a categorized picker (Workspace / Client / Contract / Services & Financial / Signature) — the picker inserts `{{token}}` at the current cursor position in the HTML textarea. No AI involved anywhere in this flow.
3. **Seed migration**: the current `contract_template.html` (the real, in-production Roya contract — Arabic legal "عقد إدارة وتسويق إلكتروني") becomes the seed content for the **first template**, `key: "roya-default"`, flagged `isDefault: true`. Placeholders are renamed to the new lower_snake_case token catalog; the legal wording/clauses are otherwise preserved verbatim. A new **"Notes / Special Terms"** block (`{{contract_notes}}`) is added directly under the title/meta block, before the legal articles ("notes at the top" per request), rendered only when the contract has notes.
4. **Dynamic workspace logo**: the hardcoded `contract-logo.png` is replaced by the actual workspace logo (`settings.logoUrl`, same source already used for the sidebar/proposals) via the `{{workspace_logo}}` token, with a graceful text fallback when no logo is configured.
5. **Server-side PDF export**: new `ContractPdfService` reuses the existing Puppeteer wrapper (`PdfRenderService`, already used by Pipeline v3) to render a contract's stored HTML into a real PDF, using Puppeteer's native `displayHeaderFooter` + `headerTemplate`/`footerTemplate` (the only reliable way to get page numbers in a headless-Chromium PDF — CSS `counter(page)` does not work in Chromium's print-to-PDF path). Header = small workspace logo; footer = workspace contact info (left/right) + "Page X of Y" — repeating identically on every page. The generated PDF is uploaded to S3 under `contracts/{id}/generated/` and its URL returned; the FE gets a **"Download PDF"** button (contract edit page) alongside the existing browser-print fallback.
6. **Create-contract flow**: the "New Contract" dialog gains a **Template** dropdown (Client → Proposal → Template, defaulting to the system default template) and an optional **Notes / Special Terms** textarea.

Out of scope: AI-assisted contract drafting (explicitly not requested — creation stays 100% deterministic/template-based), per-workspace custom templates (decided: single global catalog for now), rewriting the legal clause wording itself (only chrome/tokens/notes change), e-signature workflows (existing upload-signed flow is untouched).

## Acceptance Criteria
1. `GET/POST/PATCH/DELETE /api/data/contract-templates` exist, guarded by `PermissionGuard('contract-template.manage')` for mutations; `GET` (list/byId) usable by any authenticated workspace member (needed for the create-contract template picker).
2. Exactly one template can be marked default at a time (setting a new default clears the previous one); deleting the default template is blocked while any other template exists, or blocked outright if it is the last template.
3. Seeding (`npm run seed:contract-templates` or folded into an existing seed script) upserts the `roya-default` template from the current `contract_template.html` content (tokens renamed, notes block + dynamic logo added) with `isDefault: true`.
4. `POST /api/data/contracts` accepts optional `templateId` (defaults to the system default template) and optional `notes`; the created contract's `contract` HTML is rendered from the chosen template, not the old static file.
5. `POST /api/data/contracts/:id/pdf` renders the contract's current HTML to a PDF via Puppeteer with `displayHeaderFooter: true`, a header showing the workspace logo, and a footer showing workspace contact info + "Page X of Y"; uploads to S3 and returns `{ ok, url }`. Locked (signed) contracts still allow PDF export (read-only action).
6. Web: `/contracts` create dialog shows a Template select (loaded from `GET /api/data/contract-templates`, active only) defaulting to the flagged-default template, plus an optional Notes textarea.
7. Web: new admin-only pages under Settings — `Contract Templates` list (key, name, default badge, active toggle, edit/delete) and a template editor (name/key/description/isDefault fields + HTML textarea + clickable token palette that inserts `{{token}}` at the cursor).
8. Web: Contract Edit page gets a "Download PDF" button next to the existing print button; clicking it calls the new endpoint and opens the returned URL in a new tab.
9. `src/templates/contract_template.html` and `contract-logo.png` are removed from the API repo once their content is fully migrated into the seeded Mongo template (no more static-file dependency for contract rendering).
10. Existing already-created contracts (stored `contract` HTML, already rendered/signed) are unaffected — this change only affects the *rendering path* for new contracts; nothing rewrites previously-created contract documents.

## Notes (optional)
- Confirmed via discovery: templates are a **single global catalog** (no per-workspace custom templates), managed by **admin-only** permission, "notes at the top" = a dedicated optional Notes/Special-Terms block under the header, PDF = **real server-side Puppeteer export** (not just better print CSS), and the create dialog **does** get a template picker.
- Placeholder token casing changes from the old `{{UPPER_SNAKE}}` convention to `{{lower_snake_case}}` (per the user's own examples: `{{workspace_name}}`, `{{services}}`, `{{client_name}}`) — this is a fresh template-authoring surface (DB-backed, not the old static file), so there is no live-template backward-compat concern.
