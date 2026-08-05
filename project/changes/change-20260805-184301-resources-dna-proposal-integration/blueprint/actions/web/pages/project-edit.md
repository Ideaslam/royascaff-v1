# Page Delta — Project Edit (resources section)

## Files
- `src/app/pages/projects/project-edit/project-edit.component.ts`

## Current state

Single-page form with sections:
- Client + project info
- Digital presence
- Competitors
- Description / KPIs / budget / duration
- Research options
- Services picker
- Color palette
- Images

## After-state

Add **Resources** section between Services and Color Palette.

## New section: Resources picker

### UI pattern

Same picker UI as project-create step (shared pattern):
- Card header: "Resources"
- Type tabs → checkbox grid → selected summary
- Loads resource types and resources on mount

### Data flow

#### Hydration

When loading DNA version or project data, hydrate `selectedResources`:

```typescript
// In hydrateFromDna():
this.selectedResources = (version.resources || [])
  .filter((r) => r && typeof r === 'object' && String(r.name || '').trim())
  .map((r) => ({
    id: String(r.id || ''),
    typeId: String(r.typeId || ''),
    typeKey: String(r.typeKey || ''),
    typeName: String(r.typeName || ''),
    typeNameEn: r.typeNameEn ? String(r.typeNameEn) : undefined,
    name: String(r.name || ''),
    nameEn: r.nameEn ? String(r.nameEn) : undefined,
    photo: r.photo ? String(r.photo) : undefined,
    summary: r.summary ? String(r.summary) : undefined,
    summaryEn: r.summaryEn ? String(r.summaryEn) : undefined,
    data: (r.data && typeof r.data === 'object') ? r.data : {},
    aiContext: r.aiContext ? String(r.aiContext) : undefined,
  }));
```

#### Save

When saving (DNA version or project patch), include resources:

```typescript
// DNA version patch:
await this.projectsApi.patchDnaVersion(this.projectId, this.dnaVersionId, {
  ...existing patch fields,
  resources: this.selectedResources,
});

// Project patch:
await this.projectsApi.patch(this.projectId, {
  ...existing patch fields,
  resources: this.selectedResources,
});
```

### Mark DNA stale

Resource changes should mark DNA as stale (same as services changes):

```typescript
toggleResource(resource: ResourceItem, type: ResourceType): void {
  // toggle selection logic...
  markDnaStale(this);
}
```

## New class fields

```typescript
resourceTypes: ResourceType[] = [];
allResources: ResourceItem[] = [];
selectedResources: ResourceSnapshot[] = [];
activeResourceTypeKey: string = '';
```

## Modify: ProjectsService

Add `resources` to DNA version patch method signature:

```typescript
patchDnaVersion(projectId: string, vid: string, body: {
  info?: Record<string, unknown>;
  services?: unknown[];
  resources?: unknown[];   // ← new
  colorPalette?: unknown;
}): Promise<void>
```

## Modify: ProjectDnaVersion interface (app.models.ts)

```typescript
export interface ProjectDnaVersion {
  ...existing fields,
  resources?: Record<string, unknown>[];   // ← new
}
```

## i18n keys

- `projects.resources.title` — section header
- `projects.resources.selectType` — "Select type"
- `projects.resources.noResourcesForType` — "No resources for this type"
