# Page Delta — Project Create (resources picker step)

## Files
- `src/app/pages/projects/project-create/project-create.component.ts`

## Current state

4-step wizard:
| Step | Key | Content |
|------|-----|---------|
| 0 | `projects.steps.info` | Client, name, type, digital presence, competitors, description, KPIs |
| 1 | `projects.steps.services` | Services picker (catalog checkbox grid + editable lines) |
| 2 | `projects.steps.files` | RFP + images + color palette |
| 3 | `projects.steps.template` | Template + language → generate |

## After-state

5-step wizard — add Resources step between Services and Files:

| Step | Key | Content |
|------|-----|---------|
| 0 | `projects.steps.info` | (unchanged) |
| 1 | `projects.steps.services` | (unchanged) |
| **2** | **`projects.steps.resources`** | **Resources picker** |
| 3 | `projects.steps.files` | (unchanged, was step 2) |
| 4 | `projects.steps.template` | (unchanged, was step 3) |

## New step: Resources picker (step 2)

### UI pattern

- Card header: "Select Resources" (translated)
- **Type tabs** — horizontal tab bar from loaded resource types (only types that have resources)
- Each tab shows a checkbox grid of resources filtered by that type
- Below tabs: **Selected Resources** summary showing grouped selections with remove buttons

### Data flow

1. On mount (or entering step 2): load resource types via `listResourceTypesLite({ page: 1, pageSize: 100 })` and all resources via `listResourcesLite({ page: 1, pageSize: 200 })` (or paginated with type filter)
2. Group resources by `typeKey` for tab rendering
3. User toggles resources → `selectedResources: ResourceSnapshot[]`
4. Each selected resource becomes a snapshot:
   ```typescript
   {
     id: resource.id,
     typeId: resource.typeId,
     typeKey: resource.typeKey,
     typeName: type.name,
     typeNameEn: type.nameEn,
     name: resource.name,
     nameEn: resource.nameEn,
     photo: resource.photo,
     summary: resource.summary,
     summaryEn: resource.summaryEn,
     data: resource.data || {},
     aiContext: type.aiContext || '',
   }
   ```

### Resource card UI

Each resource in the grid:
- Rounded photo thumbnail (40px) or placeholder icon
- Name (localized)
- Summary (truncated, 1 line)
- Checkbox for selection
- Subtle type badge

### Selected resources summary

Below the grid, a compact summary:
- Grouped by type: "Team Members (3)" / "Partners (2)"
- Each item: photo mini + name + remove (×) button
- Collapsible per type group

### Validation

- Step 2 has **no required minimum** (resources are optional)
- User can proceed with 0 selected resources

## Modify: generate()

Add `resources` to the `projectsApi.create()` payload:

```typescript
resources: this.selectedResources.map((r) => ({
  id: r.id,
  typeId: r.typeId,
  typeKey: r.typeKey,
  typeName: r.typeName,
  typeNameEn: r.typeNameEn,
  name: r.name,
  nameEn: r.nameEn,
  photo: r.photo,
  summary: r.summary,
  summaryEn: r.summaryEn,
  data: r.data,
  aiContext: r.aiContext,
})),
```

## Modify: next() validation

Update step index checks since a new step was inserted. No validation required for the resources step (optional).

## Modify: stepLabels

```typescript
stepLabels = [
  'projects.steps.info',
  'projects.steps.services',
  'projects.steps.resources',   // ← new
  'projects.steps.files',
  'projects.steps.template',
];
```

## New class fields

```typescript
resourceTypes: ResourceType[] = [];
allResources: ResourceItem[] = [];
selectedResources: ResourceSnapshot[] = [];
activeResourceTypeKey: string = '';
```

## Imports

Add `ResourceType`, `ResourceItem` from `app.models.ts`.

## i18n keys

- `projects.steps.resources` — step label
- `projects.resources.title` — card header
- `projects.resources.empty` — "No resources available"
- `projects.resources.selected` — "Selected Resources"
- `projects.resources.noneSelected` — "No resources selected (optional)"
