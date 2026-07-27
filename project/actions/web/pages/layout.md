# Pages — Safqa Web · Layout

### Sidebar `PG-LAYOUT-01`
- Route: shell (all authenticated layout pages)
- Status: done
- Components: sidebar logo icon `<img>`
- Service: `StateService.settings$` (bootstrap via `getSettingsFromDb`)
- Notes: `src` = workspace `logoUrl` when set; else `BRAND.logoPath` (Safqa); alt prefers company name
