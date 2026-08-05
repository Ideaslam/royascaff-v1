# Service — ResourcesDataService

## Identity
- File: `src/services/data/resources.data.service.ts`
- Injected repos: `RESOURCES_REPOSITORY` (ResourcesRepository)
- Injected services: `S3Service` (photo upload)
- Registered in: `DataServicesModule`

## Methods

### listResourcesParsed(query: ParsedListQuery, filters?: { typeKey?: string; tags?: string[] }): PaginatedResponse
- `listAll()` → filter by typeKey (if provided) → filter by tags (if provided) → filter by search → sort → paginate
- Returns: id, typeId, typeKey, name, nameEn, photo, summary, summaryEn, tags, isActive

### listResourcesLiteParsed(query: ParsedListQuery, filters?: { typeKey?: string }): PaginatedResponse
- Lite DTO for pickers: id, typeId, typeKey, name, nameEn, photo, summary, summaryEn, data (full for snapshot)
- Used by project create/edit resources picker (Part 2)

### getResourceById(id: string): JsonObject | null
- Full document including data

### createResource(body: JsonObject): { id: string }

### upsertResource(id: string, body: JsonObject): void

### removeResource(id: string): void

### uploadPhoto(resourceId: string, fileBase64: string, mimeType?: string, fileName?: string): { photoUrl: string }
- Same pattern as clients logo upload
- Max 2MB, allowed: image/jpeg, image/png, image/webp
- S3 folder: `resources/${resourceId}`
- Delete old photo if replacing
- Store URL on `photo` field

### removePhoto(resourceId: string): void
- Extract key from current photo URL → S3 delete → clear field

## Sort whitelist
`['id', 'name', 'nameEn', 'typeKey']`

## Search fields
`['name', 'nameEn', 'summary', 'summaryEn', 'typeKey']`
