# Endpoints — Safqa API · Contract Templates

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`). Controller: `src/modules/data/contract-templates.controller.ts` → `@Controller('data/contract-templates')`.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-CONTRACT-TEMPLATES-01 | GET | /api/data/contract-templates | authenticated | list query | paginated (no `content`) | ContractTemplatesDataService | done | admin list |
| EP-CONTRACT-TEMPLATES-02 | GET | /api/data/contract-templates/active | authenticated | — | `{ id, key, name, nameEn, isDefault }[]` | ContractTemplatesDataService | done | create-contract template picker (any workspace member) |
| EP-CONTRACT-TEMPLATES-03 | GET | /api/data/contract-templates/:id | authenticated | param | full template doc or 404 | ContractTemplatesDataService | done | |
| EP-CONTRACT-TEMPLATES-04 | POST | /api/data/contract-templates | authenticated + `PermissionGuard('contract-template.manage')` | body: CreateContractTemplateDto | `{ ok, id }` | ContractTemplatesDataService | done | |
| EP-CONTRACT-TEMPLATES-05 | PATCH | /api/data/contract-templates/:id | authenticated + `PermissionGuard('contract-template.manage')` | body: PatchContractTemplateDto | ok | ContractTemplatesDataService | done | |
| EP-CONTRACT-TEMPLATES-06 | DELETE | /api/data/contract-templates/:id | authenticated + `PermissionGuard('contract-template.manage')` | param | ok | ContractTemplatesDataService | done | 409 if last remaining template or default-without-replacement |

## DTOs (`src/dtos/data/contract-templates.dto.ts`)
```ts
class CreateContractTemplateDto {
  key!: string; name!: string; nameEn?: string; description?: string;
  content!: string; isDefault?: boolean; status?: 'active' | 'inactive';
}
class PatchContractTemplateDto {
  name?: string; nameEn?: string; description?: string;
  content?: string; isDefault?: boolean; status?: 'active' | 'inactive';
}
```

See `contracts.md` (EP-CONTRACTS-04/10) for the `data/contracts` create-body delta and the PDF export route.
