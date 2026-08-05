# Pages — Contract Templates (new, admin-only)

## Route
`/settings/contract-templates` (list) and `/settings/contract-templates/:id/edit` + `/settings/contract-templates/new` (editor) — grouped under Settings in `app.routes.ts`, gated by `authGuard` + `*appHasPermission="'contract-template.manage'"` (route-level or nav-level, consistent with how `roles.manage` gates `/roles`).

Sidebar: new entry "قوالب العقود" (Contract Templates) under the same section as Roles/Settings, visible only with `contract-template.manage`.

## List page — `contract-templates.component.ts`
Standalone component, PrimeNG `p-table` (mirrors `contracts.component.ts` list styling): columns Key, Name, Status (active/inactive tag), Default (badge/star icon), Actions (Edit, Set as default, Delete). "New Template" button top-right. Delete confirms via `confirm()` like existing contracts delete; blocked server-side (409) if it's the last/default template — surface via toast.

## Editor page — `contract-template-edit.component.ts`
Two-column layout:
- **Left (fields)**: Key (locked after create), Name (AR), Name (EN, optional), Description (optional), `isDefault` toggle, Status select.
- **Right (content editor)**: large monospace `<textarea>` bound to `content` (raw HTML) + a **token palette** above/beside it — grouped chips/buttons per category from the token catalog (`data-model-delta.md`): Workspace, Client, Contract, Services & Financial, Signature. Clicking a token inserts `{{token}}` at the textarea's current caret position (via `selectionStart`/`selectionEnd`, then refocus) — no rich text editor, no AI.
- A small **live preview** panel (iframe `srcdoc`) below/beside the textarea, re-rendering on input (debounced) using placeholder sample data so the admin can see the layout while typing (best-effort visual aid only, not the exact final render).
- Save button → `POST`/`PATCH` `data/contract-templates`; Cancel → back to list.

## Delta — `contracts.component.ts` (create dialog)
Add, after the Proposal select:
- **Template** `p-select` — options from `AppDataService.listActiveContractTemplates()`, `optionLabel: name`, `optionValue: id`; default-selected to the item flagged `isDefault`.
- **Notes / Special Terms** — optional `<textarea>` (small, ~3 rows), placeholder hints "any special terms for this contract (optional)".
`confirmCreate()` passes `templateId` and `notes` (when non-empty) into `createContractFromProposal(...)`.

## Delta — `contract-edit.component.ts`
- **البيانات tab**: add a "Notes / Special Terms" `<textarea>` field (same edit/lock rules as other meta fields — disabled once `isContractLocked()`); saved via existing `saveMeta()` flow (add `notes` to the diff/patch).
- **العقد tab toolbar**: add a "Download PDF" `p-button` (icon `pi pi-file-pdf`) next to the existing content-save button, calling `AppDataService.downloadContractPdf(contract.id)` → opens the returned URL in a new tab (`window.open(url, '_blank', 'noopener')`); available regardless of lock state (read-only export).

## `AppDataService` delta (`core/services/app-data.service.ts`)
```ts
listActiveContractTemplates(): Promise<{ id: string; name: string; nameEn?: string; isDefault: boolean }[]>
listContractTemplates(params: ListQueryParams): Promise<PaginatedResult<ContractTemplateListItem>>
getContractTemplateById(id: string): Promise<ContractTemplate | null>
createContractTemplate(body: Partial<ContractTemplate>): Promise<{ ok: boolean; id: string }>
patchContractTemplate(id: string, patch: Partial<ContractTemplate>): Promise<void>
deleteContractTemplate(id: string): Promise<void>
downloadContractPdf(id: string): Promise<{ ok: boolean; url: string }>
```
`createContractFromProposal` gains `templateId?`, `notes?` in its body type.

## `app.models.ts` delta
```ts
export interface ContractTemplate {
  id: string; key: string; name: string; nameEn?: string; description?: string;
  content: string; isDefault: boolean; status: 'active' | 'inactive';
  createdAt?: string; updatedAt?: string;
}
export type ContractTemplateListItem = Omit<ContractTemplate, 'content'>;
```
`Contract` gains `templateId?: string; notes?: string;`.

## i18n
New keys under `contracts.templates.*` (list/editor labels, token category names) and `contracts.notes*`/`contracts.downloadPdf` in `assets/i18n/ar.json` + `en.json`.
