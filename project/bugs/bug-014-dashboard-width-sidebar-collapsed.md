# Bug #014 — Dashboard does not expand when sidebar is collapsed

## Status
**DONE** — Fix confirmed by user

## Reported
- **Date**: 2026-07-06
- **Confirmed**: 2026-07-06
- **Severity**: medium
- **Affected area**: customer-portal / `pages/dashboards/dashboard-viewer`

## Description
When the side nav is collapsed, the dashboard content does not expand to use the freed horizontal space. Empty margin remains on the right side of the dashboard widgets area.

## Expected Behavior
Collapsing the sidebar shrinks it to 64px; the main content area (and dashboard gridster layout) should grow to fill the full remaining viewport width.

## Steps to Reproduce
1. Open any dashboard (e.g. `/app/dashboards/:id`).
2. Collapse the sidebar using the chevron toggle.
3. Observe dashboard widgets do not expand to full width.

## Root Cause
Gridster with `setGridSize: true` sets a fixed inline pixel width on init. When the sidebar collapses, the container grows but Gridster only listens to window resize — not container resize. The grid's internal column layout was never recalculated.

## Fix Applied
- Capture Gridster API via `initCallback` in `buildGridsterOptions`.
- Attach `ResizeObserver` to `.gridster-wrap` after dashboard renders.
- On width change, call `gridsterApi.resize()` to clear the fixed inline width and recalculate the grid layout.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/dashboards/dashboard-viewer/dashboard-viewer.page.ts`
