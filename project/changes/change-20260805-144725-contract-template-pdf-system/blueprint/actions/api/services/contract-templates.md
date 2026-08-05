# Service — ContractTemplatesDataService (new)

File: `src/services/data/contract-templates.data.service.ts`
Repo: `CONTRACT_TEMPLATES_REPOSITORY` → `MongoContractTemplatesRepository` (collection `contract_templates`, generic flexible schema, same pattern as `MongoLegalContractsRepository`).

## Methods
- `listTemplates(query: ParsedListQuery): Promise<PaginatedResponse<JsonObject>>` — admin list (name/key/status/isDefault columns).
- `listActiveTemplatesLite(): Promise<{ id, key, name, nameEn, isDefault }[]>` — for the create-contract picker (any authenticated user).
- `getTemplateById(id: string): Promise<JsonObject | null>`
- `getDefaultTemplate(): Promise<JsonObject | null>` — `status: active` + `isDefault: true`; throws/logs if none found (should never happen post-seed).
- `createTemplate(input): Promise<{ id }>` — validates unique `key`; if `isDefault: true`, clears default on all others first.
- `updateTemplate(id, patch): Promise<void>` — same default-exclusivity rule as create.
- `deleteTemplate(id): Promise<void>` — throws if this is the last template, or if it is `isDefault` and other templates exist (caller must set another default first).

## Rendering integration
`ContractsDataService.renderContractHtml` (delta below) takes the resolved template `content` string as input instead of reading a static file, and applies the token catalog from `data-model-delta.md` via a renamed `applyTemplateVars`-style substitution (unchanged mechanism, new token names).

## SOW / financial section builders (unchanged, relocated names only)
`buildServicesScopeSection` → resolves `{{services}}`; `buildFinancialTableRows` → resolves `{{financial_table}}`. Logic unchanged from current `contracts.data.service.ts` (still Arabic legal-clause HTML fragments built from proposal services).

## New: `buildContractNotesHtml(notes?: string): string`
Returns empty string when `notes` is blank; otherwise a simple boxed block (heading "ملاحظات خاصة بالعقد" / "Notes & Special Terms" + the free text, HTML-escaped) — resolves `{{contract_notes}}`.

## New: `buildWorkspaceLogoHtml(logoUrl?: string, workspaceName?: string): string`
Returns `<img>` pointing at `logoUrl` (S3 public URL, no more base64 static PNG) when present; falls back to the workspace name as plain bold text when no logo is configured. Resolves `{{workspace_logo}}`.
