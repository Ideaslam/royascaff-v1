# Data Model Delta — Resource Types + Resources

## 15. resource_types
Purpose: workspace-scoped configurable type definitions for resource catalog items

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `key` | String | required, unique per workspace | — |
| `name` | String | required (AR) | — |
| `nameEn` | String | optional (EN) | — |
| `description` | String | optional (AR) | — |
| `descriptionEn` | String | optional (EN) | — |
| `icon` | String | PrimeNG icon class | — |
| `aiContext` | String | AI hint for DNA/proposal | — |
| `fields` | Array&lt;ResourceTypeField&gt; | see sub-table | — |
| `sortOrder` | Number | display order | — |
| `isActive` | Boolean | soft archive, default true | — |
| `createdBy` | String | auto-injected | → `user` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

### ResourceTypeField (embedded)

| Field | Type | Constraints |
|-------|------|-------------|
| `key` | String | required, unique within type |
| `label` | String | required (AR) |
| `labelEn` | String | optional (EN) |
| `dataType` | Enum | `text` \| `textarea` \| `photo` \| `url` \| `list` \| `number` \| `email` \| `phone` \| `social-links` |
| `required` | Boolean | default false |
| `aiHint` | String | how AI should use this field |
| `sortOrder` | Number | field display order |

Relations: one workspace → many resource_types; one resource_type → many resources
Tenant-isolated: **yes** — add to `TENANT_ISOLATED_COLLECTIONS`
Files: `mongodb-resource-types.repository.ts`, `dtos/data/resource-types.dto.ts`

---

## 16. resources
Purpose: workspace-scoped catalog items belonging to a resource type

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `_id` | String | PK | — |
| `workspaceId` | String | tenant | → `workspaces` |
| `typeId` | String | required | → `resource_types` |
| `typeKey` | String | denormalized for filtering | — |
| `name` | String | required (primary display) | — |
| `nameEn` | String | optional (EN) | — |
| `photo` | String | S3 URL, convenience field | — |
| `summary` | String | optional (AR) | — |
| `summaryEn` | String | optional (EN) | — |
| `data` | Object | dynamic fields per type definition | — |
| `tags` | String[] | cross-type tagging | — |
| `isActive` | Boolean | soft archive, default true | — |
| `createdBy` | String | auto-injected | → `user` |
| `createdAt` | Date | auto | — |
| `updatedAt` | Date | auto | — |

Relations: belongs to resource_type (via typeId); one workspace → many resources
Tenant-isolated: **yes** — add to `TENANT_ISOLATED_COLLECTIONS`
Files: `mongodb-resources.repository.ts`, `dtos/data/resources.dto.ts`

## Delta

- **Added**: §15 `resource_types` (new collection)
- **Added**: §16 `resources` (new collection)
- **Modified**: `TENANT_ISOLATED_COLLECTIONS` — add `resource-types`, `resources`
