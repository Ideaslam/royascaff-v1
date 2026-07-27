# Pages — Safqa Web · Settings (pack delta)

### Settings `PG-SETTINGS-01`
- Route: `/settings`
- Status: done
- Components:
  - Tabbed schema-driven form (company/integration/financial/theme/system) — existing
  - **Company tab logo panel** (above company name fields): avatar/preview, Upload, Remove, hint text
- Service: AppDataService → EP-SETTINGS-01/02 + **EP-SETTINGS-03/04**
- Guard: layout; `settings.manage` for write / logo mutate
- Notes:
  - Reuse create-client-dialog logo UX pattern (file input, 2MB, jpeg/png/webp/svg)
  - Upload/remove call dedicated endpoints immediately (do not wait for Save settings)
  - On success: update `StateService.settings$` / local `settings.logoUrl` preview
  - Read-only users see preview only (no upload/remove buttons)
  - i18n: `settings.logo` / `settings.uploadLogo` / `settings.removeLogo` / `settings.logoHint` (en + ar); hint may mirror clients copy
  - `AppSettings.logoUrl?: string`

## Delta

- **Add** Company-tab workspace logo panel + FE API helpers
- **Extend** AppSettings with optional `logoUrl`
- Schema field renderer unchanged (logo is a special control, not a new schema type)
