# Pages — Safqa Web · Contract Templates (admin-only)

### Contract Templates List `PG-CONTRACT-TEMPLATES-01`
- Route: `/contract-templates`
- Status: done
- Components: `contract-templates.component.ts` — PrimeNG `p-table` (key, name, status tag, default badge, inline `p-inputSwitch` active/inactive toggle — disabled while the row is the active default, to avoid leaving the default inactive — edit/delete actions); "New Template" button
- Service: AppDataService → EP-CONTRACT-TEMPLATES-01/04/05/06
- Guard: layout; nav entry gated by `*appHasPermission="'contract-template.manage'"` (sidebar-level; no route-level `canActivate`, consistent with other permission-gated pages e.g. Roles)
- Notes: delete blocked server-side (409) if last/default template — surfaced via toast

### Contract Template Edit `PG-CONTRACT-TEMPLATES-02`
- Route: `/contract-templates/new`, `/contract-templates/:id/edit`
- Status: done
- Components: `contract-template-edit.component.ts` — fields (Key, locked after create; Name AR/EN; Description; `isDefault` toggle; Status select) + a large HTML `<textarea>` bound to `content`, with a clickable, categorized token palette (Workspace / Client / Contract / Services & Financial / Signature, per `project/plan/data-model.md` §10a token catalog) that inserts `{{token}}` at the textarea's current caret position (`selectionStart`/`selectionEnd`, refocus) — plain textarea only, no rich-text editor, no live preview, no AI
- Service: AppDataService → EP-CONTRACT-TEMPLATES-03/04/05
- Guard: layout

## Delta — Contracts pages
See `contracts.md` (`PG-CONTRACTS-01` create-dialog Template/Notes delta, `PG-CONTRACTS-02` Notes field + Download PDF button delta).

## `AppDataService` delta (`core/services/app-data.service.ts`)
```ts
listContractTemplates(params: ListQueryParams): Promise<PaginatedResult<ContractTemplateListItem>>
listActiveContractTemplates(): Promise<ContractTemplateLite[]>   // { id, key, name, nameEn, isDefault }[]
getContractTemplateById(id: string): Promise<ContractTemplate | null>
createContractTemplate(template: Omit<ContractTemplate, 'id'|'createdAt'|'updatedAt'>): Promise<{ id: string }>
updateContractTemplate(id: string, patch: Partial<ContractTemplate>): Promise<void>
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
export interface ContractTemplateLite { id: string; key: string; name: string; nameEn?: string; isDefault: boolean; }
```
`Contract` gains `templateId?: string; notes?: string;`.

## i18n
New keys under `contractTemplates.*` (list/editor labels, token category names) and `contracts.pickTemplate`/`contracts.notes*`/`contracts.downloadPdf*` in `assets/i18n/ar.json` + `en.json`; `layout.sidebar.contractTemplates` nav label.
