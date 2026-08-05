# Impact Analysis — Read-only permission catalog (UI)

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Page | partial | `roles-permissions.component.{ts,html,css}` | Exposes permission CRUD UI |
| API | complete | EP-PERMS-04..06 (`roles.manage`) | Out of scope — remain for seed/admin/dev |
| Seed | complete | `config-seed-data.js` permissions[] | Untouched |

Feature state: partial

## Affected Modules
- Roles & Permissions web page — remove permission mutate UI/handlers

## Pack blueprint files to create
- [x] `blueprint/actions/web/pages/roles.md`
- [x] `blueprint/_index.md` + pack `status.md`

## Risk: complexity (L), cross-module (N), migration (N)

## Recommendation
- **Modify**: Roles page only (remove permission CRUD chrome + dead code)
- **Defer**: Locking/removing EP-PERMS-04..06 (separate pack if desired)

## Code files to touch
- `roya-sales-ai-frontend/src/app/pages/roles-permissions/roles-permissions.component.html`
- `roya-sales-ai-frontend/src/app/pages/roles-permissions/roles-permissions.component.ts`
- `roya-sales-ai-frontend/src/app/pages/roles-permissions/roles-permissions.component.css` (only if orphan styles)
