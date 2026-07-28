# Pages — Safqa Web · Layout (pack delta)

### Sidebar `PG-LAYOUT-01`
- Route: shell (all authenticated layout pages)
- Status: done
- Components: sidebar logo icon `<img>`
- Service: reads workspace settings from `StateService.settings$` (already loaded at bootstrap via `getSettingsFromDb`)
- Notes:
  - Image `src` = `settings.logoUrl` when non-empty; else `BRAND.logoPath` (Safqa)
  - Alt text: company name if available, else app name
  - On logo upload/remove from Settings, sidebar updates reactively via settings state
  - Collapsed sidebar behavior unchanged (same icon container)

## Delta

- **Modify** sidebar logo source from hard-coded brand path to workspace logo with brand fallback
- No new routes
