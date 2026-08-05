# Pages — Safqa Web · Layout

### Sidebar `PG-LAYOUT-01`
- Route: shell (all authenticated layout pages)
- Status: done
- Components: sidebar logo icon `<img>`
- Service: `StateService.settings$` (bootstrap via `getSettingsFromDb`)
- Notes: `src` = workspace `logoUrl` when set; else `BRAND.logoPath` (Safqa); alt prefers company name
- Nav IA (2026-08-05): sections **Main → Sales → Catalog → AI → Admin**; short labels (Classic / Creative / Archive / Categories / Assistant / Usage / Roles); Usage icon `fa-chart-line`; routes + permission guards unchanged
