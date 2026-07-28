# Impact Analysis — Workspace logo upload

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | none | `settings.model.ts`, `plan/data-model.md` §settings | No `logoUrl` on settings (clients already have it) |
| Service(s) | partial | `SettingsDataService` get/patch only; `ClientsDataService.uploadLogo/removeLogo` + `S3Service` reusable | No workspace logo upload/delete; SettingsDataService not injected with S3 yet |
| Endpoint(s) | partial | `SettingsController` GET/PATCH; clients `POST/DELETE :id/logo` | No `POST/DELETE /api/data/settings/logo` |
| DTO / secrets | partial | `PatchSettingsDto` whitelist; `stripSettingsSecrets` | Logo must **not** be a free PATCH text field — dedicated endpoints; GET already returns non-secret fields |
| Page(s) | partial | `settings.component.ts` schema-driven Company fields; `create-client-dialog` logo panel UX | No logo control on Company tab |
| Chrome | none | `sidebar.component.ts` hardcodes `BRAND.logoPath` | Does not read workspace `logoUrl` |
| FE model/state | partial | `AppSettings` lacks `logoUrl`; `StateService.settings$` / `getSettingsFromDb` | Need optional `logoUrl` + upload/remove API helpers |

Feature state: **none** (workspace logo) — **complete** pattern exists for client logos

## Affected Modules
- **Workspace Settings (api)** — persist `logoUrl`; upload/remove via S3 under `workspaces/{workspaceId}/`
- **Workspace Settings (web)** — Company tab logo panel (upload / remove / preview)
- **Layout / Sidebar (web)** — show workspace logo when present; else Safqa brand
- **i18n** — settings logo labels (can mirror `clients.uploadLogo` / `logoHint`)

## Pack blueprint files to create
- [ ] `blueprint/plan/data-model.md` — settings entity after-state + `## Delta` (`logoUrl`)
- [ ] `blueprint/plan/modules.md` — Workspace Settings feature slice (logo)
- [ ] `blueprint/actions/api/services/settings.md` — SVC upload/remove logo
- [ ] `blueprint/actions/api/endpoints/settings.md` — EP-SETTINGS-03/04
- [ ] `blueprint/actions/web/pages/settings.md` — PG-SETTINGS-01 Company logo UX
- [ ] `blueprint/actions/web/pages/layout.md` or notes in settings — sidebar logo source (if layout page exists; else document under settings + sidebar in pages)
- [ ] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files likely modified (implement step)
| Repo | File | Change |
|------|------|--------|
| api | `models/settings.model.ts` | Add `logoUrl?: string` |
| api | `services/data/settings.data.service.ts` | Inject `S3Service`; `uploadLogo` / `removeLogo` (mirror clients) |
| api | `modules/data/settings.controller.ts` | POST/DELETE `logo` + `PermissionGuard('settings.manage')` |
| api | `dtos/data/settings.dto.ts` | `UploadWorkspaceLogoDto` (same shape as client) |
| web | `core/models/app.models.ts` | `AppSettings.logoUrl?` |
| web | `core/services/app-data.service.ts` | `uploadWorkspaceLogo` / `removeWorkspaceLogo` |
| web | `core/services/state.service.ts` | default settings include `logoUrl` if needed |
| web | `pages/settings/settings.component.ts` | Company-tab logo panel above fields |
| web | `layout/sidebar/sidebar.component.ts` | bind img to settings `logoUrl` \|\| `BRAND.logoPath` |
| web | `assets/i18n/en.json` + `ar.json` | settings logo strings |

## Risk: **L**, cross-module **Y** (settings + sidebar), migration **N** (optional field; empty = no logo)

## Recommendation
- **Create**: EP-SETTINGS-03/04, SettingsDataService logo methods, Settings Company logo UI, sidebar binding
- **Modify**: settings model/DTO surface, AppSettings, Settings page, Sidebar
- **Complete**: — (no partial workspace logo today)
- **Reuse**: client logo mime/size rules + base64 body + S3 upload/delete
- **Ripple**: none for proposals/PDFs (explicitly out of scope)

## Status target (per artifact in the pack after implement)
- settings `logoUrl` (data-model) → done
- EP-SETTINGS-03/04 → done
- SVC-SETTINGS logo methods → done
- PG-SETTINGS-01 Company logo → done
- Sidebar workspace logo → done

## Dependencies
- depends-on: — (none)
- Soft reuse: client logo implementation (already merged)
