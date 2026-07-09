# Bug #023 — Filters Stuck Loading on Share Link

## Status
**DONE**
**Confirmed**: 2026-07-09 (user verified in browser via change-051)

## Reported
- **Date**: 2026-07-09
- **Severity**: high
- **Affected area**: customer-portal/shared-viewer + backend/dashboards filter endpoints

## Description
Dashboard filters work on the main dashboard but stay stuck on "Loading filters…" on the public share-link view.

## Expected Behavior
Share-link viewers can use filters and see widgets update, same as the authenticated dashboard (read-only).

## Steps to Reproduce
1. Open a dashboard with a filter widget — filters load and work.
2. Open the same dashboard via a share link.
3. Filter widget shows "Loading filters…" indefinitely.

## Root Cause
1. Shared viewer does not pass `dashboardId` to the filter widget.
2. Filter-options/search APIs require JWT; anonymous share viewers cannot call them.
3. Shared viewer does not re-fetch widget data when filters change.

## Fix Applied
Implemented in **change-051-bug-fix-share-link-filters**:
- Backend: `@Public()` + `OptionalJwtAuthGuard` + `shareToken` validation on EP-DASH-08/14/15
- Frontend: shared viewer passes `dashboardId`/`shareToken`; FilterService reloads widgets

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (backend tsc + frontend build PASS)
- [x] User confirmed fix resolves the issue in the browser

## Related Files
- See `project/changes/change-051-bug-fix-share-link-filters/`
