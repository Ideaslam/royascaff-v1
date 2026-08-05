# Endpoints — Contract Templates (new)

Controller: `src/modules/data/contract-templates.controller.ts` → `@Controller('data/contract-templates')`, `@UseGuards(WorkspaceAuthGuard)` at class level (same as contracts/settings).

| Method | Path | Guard (extra) | Body/Query | Response |
|--------|------|----------------|------------|----------|
| GET | `/` | — (any workspace member) | `ListQueryDto` | `PaginatedResponse` (admin list) |
| GET | `/active` | — (any workspace member) | — | `{ id, key, name, nameEn, isDefault }[]` — for create-contract picker |
| GET | `/:id` | — | — | full template doc or 404 |
| POST | `/` | `PermissionGuard('contract-template.manage')` | `CreateContractTemplateDto` | `{ ok, id }` |
| PATCH | `/:id` | `PermissionGuard('contract-template.manage')` | `PatchContractTemplateDto` | `{ ok }` |
| DELETE | `/:id` | `PermissionGuard('contract-template.manage')` | — | `{ ok }` or 409 if last/default-without-replacement |

### DTOs (`src/dtos/data/contract-templates.dto.ts`)
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

See `endpoints/contracts.md` for the `data/contracts` delta (create body + new `:id/pdf` route).
