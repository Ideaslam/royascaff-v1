# Bug #002 — Admin list pages NG0900 iterable error

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-06-30
- **Severity**: high
- **Affected area**: admin-panel list pages (libraries, gateway catalog, currencies, audit logs)

## Description
All admin panel list pages throw `NG0900: Error trying to diff '[object Object]'. Only arrays and iterables are allowed` when rendering tables.

## Expected Behavior
List pages load API data into `p-table` as arrays and render rows without runtime errors.

## Steps to Reproduce
1. Log into admin panel
2. Navigate to SDK Libraries, Gateway Catalog, Currencies, or Audit Logs
3. Console shows NG0900 and table fails to render

## Root Cause
Admin frontend services assign raw HTTP responses directly to table `[value]` bindings. Several admin API list endpoints return wrapped objects (`{ libraries }`, `{ gateways }`, `{ currencies }`, `{ logs, pagination }`) instead of bare arrays or `{ data, pagination }`. Components expect arrays / `PaginatedResponse.data`, so `p-table` receives an object and `*ngFor` throws NG0900.

## Fix Applied
Unwrap API responses in admin services using `map()`:
- `AdminLibrariesService.listLibraries()` → `response.libraries`
- `AdminAvailableGatewaysService.listAll()` → `response.gateways`
- `AdminCurrenciesService.listCurrencies()` → `response.currencies` (+ create/update unwrap `response.currency`)
- `AdminAuditService.query()` → maps `{ logs, pagination }` to `{ data, pagination }`

## Verification
- [x] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `payup-frontend-admin/src/core/services/admin-libraries.service.ts`
- `payup-frontend-admin/src/core/services/admin-available-gateways.service.ts`
- `payup-frontend-admin/src/core/services/admin-currencies.service.ts`
- `payup-frontend-admin/src/core/services/admin-audit.service.ts`
