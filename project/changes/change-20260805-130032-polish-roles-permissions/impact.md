# Impact Analysis — Roles & Permissions polish

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none | — | — |
| Service(s) | complete | API permissions seed (string categories) | No seed change needed |
| Endpoint(s) | complete | EP-ROLES-*, EP-PERMS-* | Untouched |
| Page(s) | partial | `roya-sales-ai-frontend/src/app/pages/roles-permissions/` | Layout + missing category i18n + page size 5 |

Feature state: partial

## Affected Modules
- Roles & Permissions page — layout, category labels, paginator default
- i18n `en`/`ar` — `rolesPermissions.categories.projects` + `pipeline` (+ permission column label)
- Optional: `pagination.constants.ts` — page-local `ROLES_PERMISSIONS_PAGE_SIZE = 15`

## Pack blueprint files to create
- [x] `blueprint/actions/web/pages/roles.md`
- [x] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Risk: complexity (L), cross-module (N), migration (N)

## Recommendation
- **Modify**: Roles page markup/styles/TS + i18n category keys
- **Skip**: API seeds (already correct string categories)

## Status target (per artifact in the pack after implement)
- Roles & Permissions matrix → done

## Code files to touch
- `roya-sales-ai-frontend/src/app/pages/roles-permissions/roles-permissions.component.html`
- `roya-sales-ai-frontend/src/app/pages/roles-permissions/roles-permissions.component.ts`
- `roya-sales-ai-frontend/src/app/pages/roles-permissions/roles-permissions.component.css`
- `roya-sales-ai-frontend/src/assets/i18n/en.json`
- `roya-sales-ai-frontend/src/assets/i18n/ar.json`
- `roya-sales-ai-frontend/src/app/core/constants/pagination.constants.ts` (add page-local constant only)
