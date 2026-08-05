# Data Model Delta — change-20260805-144725-contract-template-pdf-system

## New collection: `contract_templates` (global catalog — not tenant-isolated, like `templates`)
Purpose: admin-managed HTML contract templates with dynamic placeholder tokens; exactly one is the system default.

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `key` | String | unique slug, e.g. `roya-default` | — |
| `name` | String | display name (AR) | — |
| `nameEn` | String | optional display name (EN) | — |
| `description` | String | optional, shown in list/picker | — |
| `isDefault` | Boolean | exactly one `true` among `status: active` docs | — |
| `status` | Enum | `active` \| `inactive` | — |
| `content` | String | full HTML document (head+style+body) with `{{lower_snake_case}}` tokens | — |
| `createdAt` / `updatedAt` | String (ISO) | | — |
| `createdBy` | String | user id | → `user` |

**Rules:** setting `isDefault: true` on a template clears it on all others (single active default). Deleting a template that is currently `isDefault` is blocked while other templates exist; the last remaining template cannot be deleted (system always has ≥1 template). Not workspace-scoped — every workspace sees the same catalog (decision: global-only, no per-workspace custom templates in this iteration).

Files: `mongodb-contract-templates.repository.ts`, `dtos/data/contract-templates.dto.ts`, `contract-templates.data.service.ts`

## Delta: `contracts` (existing collection, see main `project/plan/data-model.md` §10)
Add:
| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `templateId` | String | id of `contract_templates` doc used to render `contract` HTML; recorded for traceability/regeneration | → `contract_templates` |
| `notes` | String | optional free text; rendered into the template's `{{contract_notes}}` block | — |

No change to existing fields; fully additive.

## Placeholder token catalog (authoritative — used by the template editor's token picker AND `renderContractHtml`)

| Token | Category | Source | Notes |
|-------|----------|--------|-------|
| `{{workspace_name}}` | Workspace | `settings.companyName` | falls back to `-` |
| `{{workspace_logo}}` | Workspace | `settings.logoUrl` | resolves to `<img>` tag or empty string if unset |
| `{{workspace_email}}` | Workspace | `settings.email` | |
| `{{workspace_phone}}` | Workspace | `settings.phone` | |
| `{{workspace_address}}` | Workspace | `settings.address` | |
| `{{client_name}}` | Client | client/proposal | |
| `{{client_address}}` | Client | client | |
| `{{client_cr}}` | Client | client | |
| `{{client_representative}}` | Client | override only | |
| `{{client_contact_name}}` | Client | override only | |
| `{{client_contact_phone}}` | Client | override only | |
| `{{contract_number}}` | Contract | generated doc id | |
| `{{contract_date}}` | Contract | render time, ar-SA long date | |
| `{{contract_duration}}` | Contract | proposal `creativeOptions.project.duration`, override-able | |
| `{{contract_notes}}` | Contract | `contract.notes` | computed HTML block; renders empty string when notes blank |
| `{{technical_appendix_number}}` | Contract | override only | free-form, e.g. appendix ref number |
| `{{ad_commission_percent}}` | Contract | override only, default `10%` | |
| `{{services}}` | Services/Financial | computed from proposal services | ex-`SERVICES_SCOPE_SECTION` |
| `{{financial_table}}` | Services/Financial | computed from proposal services | ex-`FINANCIAL_TABLE_ROWS`, `<tr>` rows only |
| `{{client_signature_label}}` | Signature | client company name | |

Any other `{{token}}` a template author writes is treated as a free override key (same `overrides: Record<string,string>` mechanism as today) — unresolved tokens are simply left as-is unless present in `overrides`.
