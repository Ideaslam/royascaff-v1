# Endpoints — Resource Types

## Controller
- File: `src/modules/data/resource-types.controller.ts`
- Route: `@Controller('data/resource-types')`
- Guard: `@UseGuards(WorkspaceAuthGuard)` (class-level)
- Registered in: `DataModule`

## Routes

| Method | Path | Guard | DTO | Service method | Response |
|--------|------|-------|-----|----------------|----------|
| GET | `/` | — | ListQueryDto | listResourceTypesParsed | PaginatedResponse |
| GET | `/lite` | — | ListQueryDto | listResourceTypesLiteParsed | PaginatedResponse (includes fields array) |
| GET | `/:id` | — | — | getResourceTypeById | JsonObject \| 404 |
| POST | `/` | — | UpsertResourceTypeDto | create or upsert (id check) | `{ ok: true, id }` |
| PATCH | `/:id` | — | PatchResourceTypeDto | merge + upsert | `{ ok: true }` |
| DELETE | `/:id` | — | — | removeResourceType | `{ ok: true }` \| 409 (in use) |

## Notes
- No PermissionGuard — same as services/service-categories (open to all workspace members)
- No OwnershipGuard — types are shared workspace config
- Key uniqueness enforced at service layer (409 on duplicate)
- Delete guarded: 409 if resources reference this type
