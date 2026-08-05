# Page — Resource Types (Settings)

## Routes
- `/resource-types` — list page (ResourceTypesPageComponent)
- `/resource-types/new` — create page (ResourceTypeEditComponent)
- `/resource-types/:id/edit` — edit page (ResourceTypeEditComponent)

## Location
- List: `src/app/pages/resource-types/resource-types.component.ts`
- Edit: `src/app/pages/resource-types/resource-type-edit/resource-type-edit.component.ts`
- Nav: Sidebar → Settings section, gated by `settings.manage`

## List Page — ResourceTypesPageComponent

### UI Pattern
- Page header: icon + title + "Add Type" button (navigates to `/resource-types/new`)
- `p-table` with lazy loading, search, sort
- Edit button navigates to `/resource-types/:id/edit`

### List Columns
| Column | Sortable | Content |
|--------|----------|---------|
| Icon | no | `<i [class]="row.icon">` or default icon |
| Name | yes | `row.name` (localized) |
| Key | yes | `row.key` |
| Fields | no | `row.fields?.length` count |
| Sort Order | yes | `row.sortOrder` |
| Actions | no | Edit, Delete buttons |

## Edit Page — ResourceTypeEditComponent

### UI Pattern
- **Two-column layout** (`grid-template-columns: 1fr 1fr`), responsive → single column ≤ 1024px
- Route param `id` determines edit vs create mode
- Fetches full type by ID on load (GET `/api/data/resource-types/:id`)
- Sticky action bar at top (save / cancel)

### Left Column — Type Info
1. **Identity Card** (`p-card`, 2×2 grid):
   - Key (text, required) + Sort Order (number)
   - Name AR (text, required) + Name EN (text)

2. **Details Card** (`p-card`, 2×2 grid):
   - Description AR (textarea) + Description EN (textarea)
   - Icon (text input + live preview `<i>`) + AI Context (textarea)

### Right Column — Field Definitions (sticky)
- Section header: "Field Definitions" + field count badge
- **Per-field accordion** (custom):
  - Each field is a collapsible row
  - **Collapsed**: chevron, field key (monospace purple), label preview, dataType badge, green required dot, delete button
  - **Expanded**: 2-column grid with Key, DataType (dropdown), Label AR, Label EN, AI Hint (full-width), Required (checkbox)
  - All fields start expanded on load; newly added fields start expanded
- DataType options: text, textarea, photo, photo-list, url, list, number, email, phone, social-links
- "+ Add Field" button centered at bottom of accordion
- Empty state message when no fields defined

## API Methods (AppDataService)
- `listResourceTypes(params)` → `GET /api/data/resource-types`
- `listResourceTypesLite(params)` → `GET /api/data/resource-types/lite`
- `getResourceTypeById(id)` → `GET /api/data/resource-types/:id`
- `saveResourceType(data)` → `POST /api/data/resource-types`
- `deleteResourceType(id)` → `DELETE /api/data/resource-types/:id`

## Models (app.models.ts)

```typescript
interface ResourceTypeField {
  key: string;
  label: string;
  labelEn?: string;
  dataType: 'text' | 'textarea' | 'photo' | 'photo-list' | 'url' | 'list' | 'number' | 'email' | 'phone' | 'social-links';
  required?: boolean;
  aiHint?: string;
  sortOrder?: number;
}

interface ResourceType {
  id: string;
  key: string;
  name: string;
  nameEn?: string;
  description?: string;
  descriptionEn?: string;
  icon?: string;
  aiContext?: string;
  fields: ResourceTypeField[];
  sortOrder?: number;
  isActive?: boolean;
}
```

## i18n keys
- `resourceTypes.title`, `.subtitle`, `.addType`, `.editType`, `.confirmDelete`
- `resourceTypes.columns.*` (icon, name, key, fields, sortOrder)
- `resourceTypes.form.*` (key, name, nameEn, description, icon, aiContext, sortOrder, fieldsTitle, addField, fieldKey, fieldLabel, fieldLabelEn, fieldDataType, fieldRequired, fieldAiHint)
- `resourceTypes.messages.*` (added, updated, deleted, deleteFailed, saveFailed)
- `resourceTypes.empty`
- `layout.sidebar.resourceTypes`
