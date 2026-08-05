# Service Delta — ContractsDataService

File: `src/services/data/contracts.data.service.ts` (existing, see main `project/actions/api/services/contracts.md`)

## `renderContractHtml` — reworked signature
```ts
renderContractHtml(input: {
  contractDocId: string;
  templateContent: string;      // NEW: resolved contract_templates.content (was: static file load)
  proposal: JsonObject;
  client: JsonObject | null;
  services: JsonObject[];
  notes?: string;                // NEW
  workspaceBranding: {           // NEW: from SettingsDataService.getPublicSettings
    logoUrl?: string; companyName?: string; email?: string; phone?: string; address?: string;
  };
  overrides?: Record<string, string>;
}): string
```
- Drops `loadContractTemplate()`/`contractTemplatePath()`/`contractLogoPath()`/`contractLogoImgHtml()` (static-file helpers removed once seed migration lands).
- Builds the token map per `blueprint/plan/data-model-delta.md` catalog (lower_snake_case keys) and applies via the existing split/join substitution (`applyTemplateVars`, unchanged mechanism).
- `overrides` keeps working exactly as today (arbitrary key overrides layered on top of computed values) — only the built-in key names change casing.

## `createContractFromProposal` — delta
```ts
createContractFromProposal(input: {
  proposalId: string;
  templateId?: string;   // NEW — falls back to ContractTemplatesDataService.getDefaultTemplate()
  notes?: string;         // NEW — stored on the contract doc, also passed into renderContractHtml
  overrides?: Record<string, string>;
  endAt?: string;
  title?: string;
}): Promise<{ id: string }>
```
- Injects `ContractTemplatesDataService` (template lookup) and `SettingsDataService` (workspace branding) as new constructor deps.
- Persists `templateId` and `notes` on the created contract document (additive fields, see data-model delta).
- Everything else (proposal must be `endorsed`, services resolution, financial rows) is unchanged.

## New: `ContractPdfService` (new file `src/services/data/contract-pdf.data.service.ts`)
```ts
class ContractPdfService {
  constructor(private pdfRender: PdfRenderService, private settings: SettingsDataService, private s3: S3Service) {}
  async renderContractPdf(workspaceId: string, contractHtml: string): Promise<Buffer>;
  async exportAndUploadContractPdf(workspaceId: string, contractId: string, contractHtml: string): Promise<{ url: string }>;
}
```
- `renderContractPdf` builds the Puppeteer `headerTemplate`/`footerTemplate` HTML strings from `settings.getPublicSettings(workspaceId)` (logo, companyName, email, phone, address) and calls the extended `PdfRenderService.renderHtmlToPdf(html, { landscape: false, format: 'A4', displayHeaderFooter: true, headerTemplate, footerTemplate, margin: { top: '18mm', bottom: '20mm', left: '16mm', right: '16mm' } })`.
- **Header template**: text-only — small (~8px) centered workspace-name running title, no logo. (Deviation from the original plan: the contract's own body HTML already renders the logo once, in the page-1 letterhead block; repeating it in the Puppeteer header too produced two logos stacked with no separation. See `verify-code.md` → "Post-verify fix round".)
- **Footer template**: single line, `justify-content: space-between` — left = email/phone, center = `Page <span class="pageNumber"></span> / <span class="totalPages"></span>`, right = address. Font ~8px, top border rule, matches existing footer tone.
- **`fetchLogoAsDataUri(url)`** (module-level helper): fetches the workspace logo server-side and returns a `data:` base64 URI, with a 6s timeout and graceful `''` fallback on any failure (logged via `logger.warn`). Puppeteer's header/footer frame does not reliably wait for remote-image loads (Chromium print-to-PDF limitation), so a plain remote `<img src>` intermittently renders blank — inlining removes the network dependency entirely. Also used to swap the logo `<img src>` inside the main contract HTML body (`htmlWithLogo`) for the PDF render pass only; the stored/editor HTML keeps the plain remote URL.
- **`stripConflictingPageMargin(html)`** (module-level helper): Chromium gives a CSS `@page { margin }` declaration priority over the `margin` option passed to `page.pdf()`. Since contract HTML is a static snapshot taken at creation time, a contract created before a template fix would keep silently fighting this service's margin forever. This helper regex-strips any `margin` declaration out of `@page { ... }` rules in the HTML immediately before rendering, so the `margin` option above is always authoritative regardless of what the stored/template HTML declares.
- `exportAndUploadContractPdf` uploads the buffer via `S3Service.uploadFile(buffer, 'contract-{id}.pdf', 'application/pdf', 'contracts/{id}/generated')` and returns its public URL — no new document field needed (generated on demand, not cached), matching "not depending on AI" simplicity (deterministic, regenerate-on-click).

## `PdfRenderService.renderHtmlToPdf` — extend options (backward compatible)
File: `src/pipeline-v3/pdf/pdf-render.service.ts`
```ts
renderHtmlToPdf(html: string, options?: {
  landscape?: boolean; format?: string;
  displayHeaderFooter?: boolean;   // NEW
  headerTemplate?: string;          // NEW
  footerTemplate?: string;          // NEW
  margin?: { top?: string; bottom?: string; left?: string; right?: string }; // NEW
}): Promise<Buffer>
```
All new options are optional and default to today's behavior (`displayHeaderFooter: false`) when omitted — no change to existing Pipeline v3 callers.
