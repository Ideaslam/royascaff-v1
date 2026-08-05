# Pages — Safqa Web · Settings

### Settings `PG-SETTINGS-01`
- Route: `/settings`
- Status: done
- Components:
  - Tabbed schema-driven form (company/integration/financial/theme/system)
  - Company tab logo panel (avatar + upload + remove)
  - Theme tab **brand colors** panel: shared `app-color-palette` (max 5); schema `defaultColor` / type `color` hidden; keep `defaultFont`
- Service: AppDataService → EP-SETTINGS-01/02/03/04, EP-CONFIG-01
- Guard: layout; settings.manage for write / logo mutate
- Notes:
  - Logo upload/remove is immediate (not via Save settings)
  - Save sends `colorPalette`; BE derives `colorRoles` + syncs `defaultColor`
  - `AppSettings.colorPalette?` / `colorRoles?` / `logoUrl?`; hydrate palette from palette → roles → `defaultColor`
  - i18n en/ar: `settings.colorPalette`, `settings.colorPaletteHint`
