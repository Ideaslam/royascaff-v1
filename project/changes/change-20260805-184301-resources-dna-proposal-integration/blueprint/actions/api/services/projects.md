# Service Delta — ProjectsDataService (resources integration)

## Files
- `src/services/data/projects.data.service.ts`
- `src/dtos/projects/create-project.dto.ts` (or equivalent)

## Modify: create()

Accept `resources` in create body. Normalize with `normalizeResourceSnapshots()`:

```typescript
const resources = normalizeResourceSnapshots(body.resources);
```

Pass to both `projectsRepo.create()` and `createDnaVersionInternal()`:

```typescript
const { id } = await this.projectsRepo.create({
  ...existing fields,
  resources,
});
const dnaVersion = await this.createDnaVersionInternal(workspaceId, id, userId, {
  ...existing seed,
  resources,
});
```

## Modify: createDnaVersionInternal()

Add `resources` to seed type and persist:

```typescript
seed: {
  ...existing fields,
  resources?: unknown[];
}

// In create call:
resources: Array.isArray(seed.resources) ? seed.resources : [],
```

## Modify: updateDnaVersionInputs()

Handle `resources` in patch (same as `services`):

```typescript
if (Array.isArray(patch.resources)) {
  next.resources = normalizeResourceSnapshots(patch.resources);
}
```

## Modify: update() (project patch)

Handle `resources` in project-level patch:

```typescript
if (Array.isArray(patch.resources)) {
  patch.resources = normalizeResourceSnapshots(patch.resources);
}
```

## New: normalizeResourceSnapshots() (private helper)

Normalize and validate resource snapshot array:

```typescript
function normalizeResourceSnapshots(raw: unknown): JsonObject[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((r) => r && typeof r === 'object' && String((r as JsonObject).name || '').trim())
    .map((r) => {
      const s = r as JsonObject;
      return {
        id: s.id != null ? String(s.id) : undefined,
        typeId: s.typeId != null ? String(s.typeId) : undefined,
        typeKey: String(s.typeKey || ''),
        typeName: String(s.typeName || ''),
        typeNameEn: s.typeNameEn != null ? String(s.typeNameEn) : undefined,
        name: String(s.name || '').trim(),
        nameEn: s.nameEn != null ? String(s.nameEn) : undefined,
        photo: s.photo != null ? String(s.photo) : undefined,
        summary: s.summary != null ? String(s.summary) : undefined,
        summaryEn: s.summaryEn != null ? String(s.summaryEn) : undefined,
        data: (s.data && typeof s.data === 'object') ? s.data : {},
        aiContext: s.aiContext != null ? String(s.aiContext) : undefined,
      };
    });
}
```

## DTO Changes

Add `resources?: any[]` with `@Type(() => Object)` to:
- Create project DTO
- Patch project DTO
- DNA version input patch endpoint body

Same `@Type(() => Object)` pattern as `services` and `data` fields from Part 1.
