# Page — Resources Catalog

## Routes
- `/resources` — list page (ResourcesPageComponent)
- `/resources/new` — create (ResourceEditComponent)
- `/resources/:id/edit` — edit (ResourceEditComponent)

## Location
- List: `src/app/pages/resources/resources.component.ts`
- Edit: `src/app/pages/resources/resource-edit/resource-edit.component.ts`
- Nav: Sidebar → Catalog section (after Services)

## List Page — ResourcesPageComponent

### UI Pattern
- Page header + "Add Resource" button
- **Filter bar** (replaces tabs): three `p-select` dropdowns in a horizontal filter bar
  - Type filter: dropdown populated from resource types, with showClear + "All Types" placeholder
  - Name filter: dropdown populated from loaded resources names, with filter/search + showClear
  - Key filter: dropdown populated from loaded resources keys, with filter/search + showClear
- `p-table` with lazy loading, sort, paginator

### Columns
| Column | Sortable | Content |
|--------|----------|---------|
| Photo | no | Thumbnail circle (36px) or placeholder icon |
| Name | yes | `row.name` (localized) |
| Type | no | `typeKey` label from loaded types |
| Summary | no | `row.summary` truncated |
| Tags | no | `p-tag` badges |
| Actions | no | Edit, Delete |

### API
- Load types: `listResourceTypesLite({ page: 1, pageSize: 100 })`
- Load resources: `listResources({ page, pageSize, sort, order, q, typeKey })`
- Delete: `deleteResource(id)`

## Edit Page — ResourceEditComponent

### UI Pattern
- **Two-column layout** (`grid-template-columns: 1fr 1fr`), responsive → single column ≤ 1024px
- Route param `id` determines edit vs create mode
- Sticky action bar at top (save / cancel)

### Left Column — Core Data
1. **Identity Card** (`p-card`):
   - Photo (rounded square 100px preview with upload/remove icon buttons below)
   - Type (p-select dropdown; locked in edit mode) + Tags (chip input)
   - Name AR (required) + Name EN — in a 2×2 grid beside the photo

2. **Summary Card** (`p-card`):
   - Summary AR (textarea) + Summary EN (textarea) side by side

### Right Column — Dynamic Fields (sticky, scrolls with page)
- Section header with type icon + name + field count badge
- **Per-field accordion** (custom, no PrimeNG accordion):
  - Each field is a collapsible row
  - **Collapsed**: chevron (`pi-chevron-right` / `pi-chevron-down`), label, value preview (truncated text / "3 photo(s)" / "2 link(s)"), dataType badge
  - **Expanded**: full field editor
  - Smart default open: fields with data or `required=true` start expanded; empty optional fields start collapsed
- Field type renderers:
  - `text` → `<input pInputText>`
  - `textarea` → `<textarea pInputTextarea autoResize>`
  - `url` → input with `fa-solid fa-link` prefix icon
  - `number` → input with `fa-solid fa-hashtag` prefix icon
  - `email` → input with `fa-solid fa-envelope` prefix icon
  - `phone` → input with `fa-solid fa-phone` prefix icon
  - `list` → gradient chip zone with inline text input
  - `photo` → bordered zone: 72px preview (or dashed drop-zone placeholder) + upload/remove buttons
  - `photo-list` → gallery grid (76px thumbnails with hover-reveal delete + hover scale) + dashed "+ Upload" card + URL input row
  - `social-links` → bordered container with structured rows (globe icon + platform input | link icon + URL input | delete) + dashed add-link footer
- AI hint shown as small helper text below each field

### Data flow
- On type selection (create mode): load type's fields → render dynamic form section
- On save: merge core fields + `data: { [fieldKey]: value }` → `POST/PATCH /api/data/resources`
- Photo upload: separate `POST /:id/photo` after create (or inline base64 on create payload)

### API Methods (AppDataService)
- `listResources(params)` → `GET /api/data/resources`
- `listResourcesLite(params)` → `GET /api/data/resources/lite`
- `getResourceById(id)` → `GET /api/data/resources/:id`
- `saveResource(data)` → `POST /api/data/resources`
- `deleteResource(id)` → `DELETE /api/data/resources/:id`
- `uploadResourcePhoto(id, file)` → `POST /api/data/resources/:id/photo`
- `deleteResourcePhoto(id)` → `DELETE /api/data/resources/:id/photo`

## Models (app.models.ts)

```typescript
interface ResourceItem {
  id: string;
  typeId: string;
  typeKey: string;
  name: string;
  nameEn?: string;
  photo?: string;
  summary?: string;
  summaryEn?: string;
  data?: Record<string, unknown>;
  tags?: string[];
  isActive?: boolean;
}
```

## i18n keys
- `resources.title`, `.subtitle`, `.addResource`, `.editResource`, `.backToList`
- `resources.columns.*` (photo, name, type, summary, tags)
- `resources.filters.*` (type, name, key, allTypes, allNames, allKeys)
- `resources.form.*` (type, name, nameEn, photo, summary, summaryEn, tags, dynamicFields)
- `resources.messages.*` (added, updated, deleted, photoUploaded, photoDeleted)
- `resources.empty`, `.notFound`, `.allTypes`, `.confirmDelete`
- `resources.dataTypes.*` (text, textarea, photo, url, list, number, email, phone, socialLinks)
- `resources.socialPlatforms.*` (instagram, tiktok, youtube, x, linkedin, website, other)
- `layout.sidebar.resources`
