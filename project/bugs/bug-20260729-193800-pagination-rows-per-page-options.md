# Bug 20260729-193800 — Pagination rows-per-page limited to 5

## Status
**DONE** — Confirmed 2026-07-29

## Reported
- **Date**: 2026-07-29
- **Severity**: low
- **Affected area**: web / list tables (Services and other paginated lists)

## Description
The rows-per-page dropdown on list tables only offers **5**. Users cannot show 10, 25, or 50 rows at once (screenshot: Services list — “Showing 1 to 5 of 9”, dropdown value `5`).

## Expected Behavior
Rows-per-page options should be **5, 10, 25, 50**.

## Steps to Reproduce
1. Open Services (or another list with PrimeNG paginator)
2. Open the rows-per-page dropdown in the table footer
3. Only `5` is available

## Root Cause
PrimeNG `p-table` bindings hardcode `[rowsPerPageOptions]="[5]"` on list pages. The dropdown can only show that single value.

Same pattern on: Services, Service Categories, Proposals, Clients, Contracts, Users, AI Jobs, Roles & Permissions.

## Fix Applied
Changed `[rowsPerPageOptions]="[5]"` → `[5, 10, 25, 50]` on all affected list tables. Default rows remain 5.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-sales-ai-frontend/src/app/pages/services/services.component.ts`
- `roya-sales-ai-frontend/src/app/pages/service-categories/service-categories.component.ts`
- `roya-sales-ai-frontend/src/app/pages/proposals/proposals.component.ts`
- `roya-sales-ai-frontend/src/app/pages/clients/clients.component.ts`
- `roya-sales-ai-frontend/src/app/pages/contracts/contracts.component.ts`
- `roya-sales-ai-frontend/src/app/pages/user/user.component.ts`
- `roya-sales-ai-frontend/src/app/pages/ai-jobs/ai-jobs.component.ts`
- `roya-sales-ai-frontend/src/app/pages/roles-permissions/roles-permissions.component.html`
