# Service — ResourceTypesDataService

## Identity
- File: `src/services/data/resource-types.data.service.ts`
- Injected repos: `RESOURCE_TYPES_REPOSITORY` (ResourceTypesRepository)
- Registered in: `DataServicesModule`

## Methods

### listResourceTypesParsed(query: ParsedListQuery): PaginatedResponse
- Calls `ensureSeeded()` first (auto-seed on empty workspace, same as service-categories)
- `listAll()` → filter by search (name, nameEn, key) → sort → paginate
- Returns: id, key, name, nameEn, icon, description, descriptionEn, aiContext, fields count, sortOrder, isActive

### listResourceTypesLiteParsed(query: ParsedListQuery): PaginatedResponse
- Same as list but lite DTO: id, key, name, nameEn, icon, sortOrder, isActive, fields (full array for FE form rendering)

### getResourceTypeById(id: string): JsonObject | null

### createResourceType(body: JsonObject): { id: string }
- Validate `key` required + unique per workspace (same pattern as service-categories)
- Normalize key: lowercase, trim

### upsertResourceType(id: string, body: JsonObject): void
- Unique key check (exclude self)

### removeResourceType(id: string): void
- Check if any resources reference this type → 409 if in use (same as service-categories delete guard)

### ensureSeeded(): void (private)
- On empty workspace: seed from `DEFAULT_RESOURCE_TYPES` (lib/defaults/resource-types.defaults.ts)
- Three seeded types: "Team Member", "Partner", "Collaborator"

## Sort whitelist
`['id', 'key', 'name', 'nameEn', 'sortOrder']`

## Search fields
`['key', 'name', 'nameEn', 'description', 'descriptionEn']`
