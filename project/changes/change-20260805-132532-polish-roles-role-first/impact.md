# Impact Analysis — Roles role-first redesign

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Page | partial | `roles-permissions.component.*` | Matrix UX; needs role selection panel |

Feature state: partial

## Code files to touch
- `roles-permissions.component.html`
- `roles-permissions.component.ts` (`selectedRoleId`, assigned counts)
- `roles-permissions.component.css`
- `assets/i18n/en.json` + `ar.json`

## Risk: L · cross-module N · migration N
