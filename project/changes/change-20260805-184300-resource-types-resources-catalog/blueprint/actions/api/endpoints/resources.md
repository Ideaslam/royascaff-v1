# Endpoints — Resources

## Controller
- File: `src/modules/data/resources.controller.ts`
- Route: `@Controller('data/resources')`
- Guard: `@UseGuards(WorkspaceAuthGuard)` (class-level)
- Registered in: `DataModule`

## Routes

| Method | Path | Guard | DTO | Service method | Response |
|--------|------|-------|-----|----------------|----------|
| GET | `/` | — | ListQueryDto (+typeKey, +tags query) | listResourcesParsed | PaginatedResponse |
| GET | `/lite` | — | ListQueryDto (+typeKey) | listResourcesLiteParsed | PaginatedResponse |
| GET | `/:id` | — | — | getResourceById | JsonObject \| 404 |
| POST | `/` | — | UpsertResourceDto | create or upsert (id check) | `{ ok: true, id }` |
| PATCH | `/:id` | OwnershipGuard('resources') | PatchResourceDto | merge + upsert | `{ ok: true }` |
| DELETE | `/:id` | OwnershipGuard('resources') | — | removeResource | `{ ok: true }` |
| POST | `/:id/photo` | OwnershipGuard('resources') | UploadResourcePhotoDto | uploadPhoto | `{ ok: true, photoUrl }` |
| DELETE | `/:id/photo` | OwnershipGuard('resources') | — | removePhoto | `{ ok: true }` |

## Query params
- `typeKey` (optional) — filter resources by type key
- `tags` (optional, comma-separated) — filter by tags

## Notes
- OwnershipGuard on mutations (PATCH/DELETE/photo) — same as services
- Photo upload follows clients logo pattern (base64 JSON body)
- Add 'resources' case to `OwnershipService.getDocumentByCollection()`
