# Verification — Contract Template + PDF System

## Plan Consistency (pre-build)
- [x] Endpoints exist in specs — `data/contract-templates` CRUD, `POST data/contracts/:id/pdf`, `POST data/contracts` delta
- [x] Services exist in specs — `ContractTemplatesDataService`, `ContractPdfService`, `ContractsDataService` delta, `PdfRenderService` delta
- [x] Data model updated — `contract_templates` (new, global) + `contracts.templateId`/`notes`
- [x] Routes match — FE `/contract-templates`, `/contract-templates/new`, `/contract-templates/:id/edit`
- [x] Auth declared — `PermissionGuard('contract-template.manage')` on mutations; `WorkspaceAuthGuard` + `OwnershipGuard('contracts')` on contract routes
- [x] Recon findings reflected — static `src/templates/contract_template.html` fully replaced by DB-backed catalog

## Code Verification (post-build)
- [x] Endpoints implemented (method, route, guard)
  - `GET/GET :id/GET active /api/data/contract-templates` — `WorkspaceAuthGuard` only (any authenticated member)
  - `POST/PATCH :id/DELETE :id /api/data/contract-templates` — + `PermissionGuard('contract-template.manage')`
  - `POST /api/data/contracts` — accepts `templateId`, `notes` (both optional)
  - `POST /api/data/contracts/:id/pdf` — `OwnershipGuard('contracts')`; works regardless of signed/locked status (read-only export)
- [x] Services implemented
  - `ContractTemplatesDataService`: CRUD, `getDefaultTemplate()`, `listActiveTemplatesLite()`, single-default enforcement (`setDefaultTemplate`/`clearDefaultExcept`), delete blocked when default or last remaining
  - `ContractPdfService`: Puppeteer render via `PdfRenderService.renderHtmlToPdf` with `displayHeaderFooter`, dynamic logo header, contact+page-number footer, S3 upload
  - `ContractsDataService.createContractFromProposal`: resolves template (explicit `templateId` or default), fetches workspace branding via `SettingsDataService.getPublicSettings`, renders via reworked `renderContractHtml` (lower_snake_case tokens, `contract_notes` block, dynamic logo)
- [x] Pages/views at correct routes
  - `/contract-templates` (list, inline active toggle, default badge, edit/delete)
  - `/contract-templates/new`, `/contract-templates/:id/edit` (editor: key/name/nameEn/description/status/isDefault + HTML textarea + clickable `{{token}}` palette by category)
  - `/contracts` create dialog: Template select (active only, defaults to system default) + Notes textarea
  - `/contracts/:id/edit`: Notes field (editable pre-sign) + "Download PDF" button (works pre- and post-sign)
- [x] Layering: controller → service → repo
  - `ContractTemplatesController` → `ContractTemplatesDataService` → `ContractTemplatesRepository` (`MongoContractTemplatesRepository`, collection deliberately outside `TENANT_ISOLATED_COLLECTIONS` → global catalog)
  - `ContractsController` → `ContractsDataService`/`ContractPdfService` → `LegalContractsRepository`/`PdfRenderService`/`S3Service`
- [x] No direct external URLs in frontend — all calls via `AppDataService` → `ApiService` (`environment.apiBaseUrl` prefix)
- [x] Auth guards applied — see endpoints above
- [x] Acceptance criteria met (see mapping below)
- [x] No regressions — `tsc --noEmit` clean in both repos; `ng build --configuration production` clean (frontend); existing signed-contract lock rules, upload-signed flow, and contract status transitions untouched

## Acceptance Criteria Mapping
1. CRUD guarded correctly, GET open to any workspace member — ✅ `contract-templates.controller.ts`
2. Single-default enforcement + delete-blocking rules — ✅ `contract-templates.data.service.ts` (`setDefaultTemplate`, `deleteTemplate`)
3. Seed script upserts `roya-default` from migrated content, `isDefault: true` — ✅ `scripts/seed-contract-templates.js` + `scripts/contract-templates/roya-default.html`; wired into `npm run seed`
4. `POST /api/data/contracts` accepts `templateId`/`notes`, defaults to system default, renders via chosen template — ✅
5. `POST /api/data/contracts/:id/pdf` — Puppeteer, `displayHeaderFooter`, logo header, contact+page-number footer, S3 upload, `{ ok, url }`, works on locked contracts — ✅
6. Web create dialog Template select (active only) defaulting to default template + Notes textarea — ✅ `contracts.component.ts`
7. Admin pages: list (key, name, default badge, active toggle, edit/delete) + editor (fields + HTML textarea + clickable token palette) — ✅ `contract-templates.component.ts` / `contract-template-edit.component.ts`
8. Contract Edit "Download PDF" button opens returned URL in new tab — ✅ `contract-edit.component.ts`
9. `src/templates/contract_template.html` removed (no `contract-logo.png` existed in repo — confirmed via search, nothing else to remove) — ✅
10. Existing contract documents untouched — ✅ only the creation-time render path changed; no migration/rewrite of stored `contract` HTML

## Notes / Deviations
- Acceptance criterion 7 said "active toggle" in the list — implemented as an inline `p-inputSwitch` per row (disabled while the row is the active default, to avoid leaving the default template inactive; deactivate is still possible after flipping another template to default).
- Acceptance criterion 8 said "next to the existing print button" — the existing browser-print action lives inside the Visual Editor toolbar (a nested child component), not the Contract Edit page header; the new "Download PDF" button was placed in the Contract Edit page header actions instead (visible in both locked/unlocked states), which is the more discoverable and always-available location.
- Acceptance criterion 5 said the repeating header shows "the workspace logo" — after live PDF review (see Post-verify fix round below), the logo was **removed from the repeating per-page header** and kept only once, in the existing page-1 letterhead block (`contract-header`/`workspace_logo` token) that was already part of the contract HTML itself. Repeating it in the Puppeteer header too produced two logos stacked with no separation on every page. The repeating header is now a small text-only running title (workspace name); the repeating footer (contact info + "Page X of Y") is unchanged and still satisfies the page-numbering requirement. Net effect: still exactly one logo, one repeating footer, one repeating header band — just chrome text instead of chrome image up top.

## Post-verify fix round (same pack, before merge)
Live PDF review after initial verification surfaced three rendering defects, all fixed within this pack (no scope change, no new artifacts):
1. **Logo not rendering** — Puppeteer's isolated header/footer frame does not reliably wait for remote-image loads (known Chromium print-to-PDF limitation); a plain `<img src="https://...">` in `headerTemplate` rendered blank. Fixed by fetching the logo server-side and inlining it as a base64 data URI (`ContractPdfService.fetchLogoAsDataUri`), applied both to the (since-removed) header logo and the in-body page-1 letterhead logo, for the PDF render pass only — the stored/editor HTML is untouched.
2. **No visible margin** — Chromium gives a CSS `@page { margin }` declaration priority over the `margin` option passed to `page.pdf()`; the seeded template's `@media print` block had `@page { margin: 0 }`, silently overriding every margin value passed from `ContractPdfService`. Fixed by (a) removing that declaration from `scripts/contract-templates/roya-default.html` and re-seeding, and (b) adding `stripConflictingPageMargin()` in `ContractPdfService`, which strips any `margin` from `@page` rules in the HTML right before rendering — covers already-created contracts (static HTML snapshot from creation time) and future admin-edited templates. Final margins: `18mm` top, `20mm` bottom, `16mm` sides.
3. **Duplicate logo** — see acceptance-criterion-5 deviation above.

Verified via `tsc --noEmit` + `eslint` clean on `contract-pdf.data.service.ts` after each round, dev server restart with no errors, and user-confirmed live PDF download ("good").

## Result: PASS
