# Services — Safqa API · Contracts

### SVC-CONTRACTS-01 · ContractsDataService [domain, internal, Contracts]
- Status: done
- Methods: list/search/get/create/patch/delete; send; update status; upload signed file; `createContractFromProposal`
- Deps: LegalContractsRepository, ServicesCatalogRepository, ProposalsDataService, ClientsDataService, ContractTemplatesDataService, SettingsDataService, S3Service, MailjetService
- Side effects: email, file
- Notes (REQ-PROP-UNIFY part 3):
  - `extractServiceIdsFromProposal` accepts string ids **or** `{ id }` objects
  - `resolveServicesForContract` merges proposal line-item snapshots with catalog for SOW + financial
  - `buildFinancialTableRows` uses `price × (qty || 1)`
  - Persists clean `serviceIds: string[]`
- Notes (REQ-CONTRACT-TEMPLATE):
  - `createContractFromProposal` resolves the template (`templateId` or `ContractTemplatesDataService.getDefaultTemplate()`), fetches workspace branding via `SettingsDataService.getPublicSettings`, and renders via `renderContractHtml` using the `{{lower_snake_case}}` token catalog (see `project/plan/data-model.md` §10a) — no more static `src/templates/contract_template.html` (removed)
  - `renderContractHtml` gains `templateContent`, `notes`, `workspaceBranding` inputs; `buildContractNotesHtml(notes?)` resolves `{{contract_notes}}` (empty when blank); `buildWorkspaceLogoHtml(logoUrl?, workspaceName?)` resolves `{{workspace_logo}}` (`<img>` or bold-text fallback)
  - Persists `templateId` and `notes` on the created contract document (additive)

### SVC-CONTRACTS-02 · ContractPdfService [domain, internal, Contracts]
- Status: done
- File: `src/services/data/contract-pdf.data.service.ts`
- Methods: `renderContractPdf(workspaceId, contractHtml): Promise<Buffer>`; `exportAndUploadContractPdf(workspaceId, contractId, contractHtml): Promise<{ url }>`
- Deps: `PdfRenderService` (Pipeline v3's Puppeteer wrapper, see `pipeline-v3-foundations.md`), `SettingsDataService`, `S3Service`
- Side effects: file (S3 upload to `contracts/{id}/generated/contract-{id}.pdf`)
- Design:
  - Real "Page X of Y" via Puppeteer's native `displayHeaderFooter`/`headerTemplate`/`footerTemplate` (CSS `counter(page)` is unreliable in Chromium's print-to-PDF path). Footer: contact info (email/phone left, address right) + page number, repeating on every page. Header: small text-only running workspace-name title — **not** the logo (the contract's own body HTML already renders the logo once, in the page-1 letterhead; repeating it in the Puppeteer header too produced a duplicate-logo bug during live review).
  - `fetchLogoAsDataUri(url)`: fetches the workspace logo server-side and inlines it as a base64 `data:` URI (6s timeout, graceful `''` fallback) — Puppeteer's header/footer frame doesn't reliably wait for remote-image loads; also used to swap the logo `<img src>` inside the main contract HTML body for the PDF render pass only (stored/editor HTML keeps the plain remote URL).
  - `stripConflictingPageMargin(html)`: Chromium gives a CSS `@page { margin }` declaration priority over the JS `margin` option passed to `page.pdf()`. Strips any `margin` out of `@page` rules in the HTML right before rendering, so this service's `margin` option (`{ top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' }`) always wins — covers contracts created before a template fix too, since contract HTML is a static snapshot from creation time.
