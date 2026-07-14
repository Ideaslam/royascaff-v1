# Verify — change-066 (Connections UX redesign)  ✅ PASS

Frontend-only UX redesign: Connections management now uses a card grid aligned with Data Sources, a detail side drawer, type-picker-first create flow, breadcrumbs, and shared connection cards in the setup wizard.

## What was implemented

### Shared component
- `shared/components/connection-card/` — reusable card (source icon, name, type, status, source count, last tested). Supports list mode (chevron) and wizard selection mode (checkmark).

### ConnectionsPage (`/app/data/connections`)
- **Breadcrumbs:** Data Sources → Connections.
- **List:** table replaced with card grid; search/filter/sort/pagination preserved (default page size 12).
- **Detail drawer:** card click opens side drawer with full info, linked data sources (`listDataSources({ connectionId })`), inline rename, and grouped actions (test, rename, edit/re-auth, delete).
- **Create flow:** type-picker drawer first (category icons, CSV excluded, DB metadata enrichment) → credentials/OAuth form step with back navigation. Existing API behavior unchanged.

### Wizard alignment
- `choose-connection-step.component.ts` — reuses `ConnectionCardComponent` in selectable mode.

### i18n
- EN/AR keys for breadcrumb, detail drawer, type picker, OAuth hints.

## Verification

- **AC #1 — card grid:** table removed; card grid with toolbar/pagination. ✅
- **AC #2 — detail drawer:** click opens drawer with name, type, status, last tested, linked sources, grouped actions. ✅
- **AC #3 — breadcrumbs:** `Data Sources → Connections` with i18n. ✅
- **AC #4 — type-picker create:** two-step create (picker → form); CSV excluded; existing APIs preserved. ✅
- **AC #5 — wizard reuse:** `ChooseConnectionStep` uses `ConnectionCardComponent`. ✅
- **AC #6 — states + mobile:** loading skeleton grid, empty, error+retry retained; responsive grid + stacked detail actions on mobile. ✅
- **AC #7 — i18n/RTL:** new keys in en.json + ar.json; drawer uses existing RTL-aware `SideDrawerComponent`. ✅
- **AC #8 — build:** `ng build --configuration development` → exit 0 (pre-existing Sass `@import` warnings only). Docs updated. ✅

## Notes
- No backend/API changes.
- Screenshots not submitted — UI check marked skipped per template.

## Status: **PASS**
