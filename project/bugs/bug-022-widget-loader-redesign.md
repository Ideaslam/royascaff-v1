# Bug #022 — Widget Loading Spinner Poor Design / Off-Center

## Status
**DONE**
**Confirmed**: 2026-07-09

## Reported
- **Date**: 2026-07-09
- **Severity**: low
- **Affected area**: customer-portal/dashboards (dashboard-viewer, shared-viewer)

## Description
While dashboard widgets load data, each card shows a thin orange PrimeIcons spinner stuck in the **top-left** of the content area. It looks unfinished compared to the rest of the UI (centered purple header icons, polished cards).

## Expected Behavior
Widget loading state should feel intentional: a centered, brand-aligned spinner that fills the widget body cleanly on both KPI and chart cards.

## Steps to Reproduce (if applicable)
1. Open a dashboard with multiple widgets.
2. While widget data is fetching, observe the loading indicator in each card.
3. Spinner appears top-left, thin, and visually weak.

## Root Cause
1. Markup uses a bare `<i class="pi pi-spin pi-spinner">` with only `font-size` + color — no layout wrapper.
2. In `dashboard-viewer.page.scss`, `.widget-body` uses `align-items: stretch` and `.widget-body--compact` uses `align-items: flex-start`, so the spinner is not centered (especially on KPI cards).
3. Shared viewer already centers the body, but still uses the same crude icon.

## Fix Applied
1. Replaced PrimeIcons spinner with a centered SVG dual-ring loader (aligned with `page-loader` visual language).
2. Styled `.widget-loading` to fill the widget body (`flex: 1`, `align-self: stretch`) and center content, with a soft pulse halo.
3. Applied the same markup/CSS in dashboard viewer and shared viewer.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/dashboards/dashboard-viewer/dashboard-viewer.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/dashboards/dashboard-viewer/dashboard-viewer.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/dashboards/shared-viewer/shared-viewer.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/dashboards/shared-viewer/shared-viewer.page.scss`
