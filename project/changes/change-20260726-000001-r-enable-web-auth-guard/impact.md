# Impact Analysis — Enable web authGuard

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none | — | — |
| Service(s) | complete | `core/guards/auth.guard.ts`, TokenService | guard exists |
| Endpoint(s) | none | — | — |
| Page(s) | partial | `app.routes.ts` L42 | guard commented |

Feature state: partial

## Affected Modules
- Auth (web) — one-line route config + verify public routes

## Pack blueprint files to create
- [x] `blueprint/actions/web/pages/auth.md` — route guard note
- [x] `blueprint/_index.md` + pack `status.md`

## Risk: complexity (L), cross-module (N), migration (N)

## Recommendation
- **Modify**: `app.routes.ts` — enable authGuard on MainLayout

## Status target
- MainLayout auth protection → done
