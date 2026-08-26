# Bug #006 — App switch triggers infinite list requests

## Status
**DONE**

## Reported
- **Date**: 2026-08-26
- **Severity**: critical
- **Affected area**: merchant dashboard list pages (`payup-frontend-customer-control` + mirrored `payup-frontend-admin`)

## Description
Changing the App filter on Payments (and the header app on Products and other list pages) fired thousands of list/stats requests, then failed with `Maximum call stack size exceeded` / `Failed to fetch`.

## Expected Behavior
Switching app should update context once and load the current page once.

## Steps to Reproduce (if applicable)
1. Open `/payments` or `/products`
2. Change the App filter or header app switcher
3. Network tab should show one list request, not a repeating storm

## Root Cause

`selectedApp$` is **not** the later loop. After A → B it emits once. If nothing calls `setSelectedApp()` again, `appId` stays B.

There are two independent triggers for the same load method:

```text
                loadList(B)
                     ▲
                     │
          ┌──────────┴──────────┐
          │                     │
 selectedApp$ A → B         PrimeNG
 (subscriber)              onLazyLoad
```

The storm looks like:

```text
selectedApp$ emits B
        ↓
subscriber calls load(B)          ← request #1
        ↓
table [value] / [totalRecords] / [loading] update
        ↓
PrimeNG fires onLazyLoad
        ↓
onLazyLoad calls load(B)          ← request #2
        ↓
table updates again
        ↓
onLazyLoad → load(B)              ← #3, #4, …
```

`appId` is B the whole time. The later calls are PrimeNG, not RxJS.

A second bug on Payments: `onAppSelected` subscribed to `selectedApp$` and never unsubscribed, so leftover handlers could ping-pong after leaving the page. That is separate from the table loop.

Payments has no lazy table. Its extra calls came from both `onAppSelected` and `watchSelectedApp` calling `loadPayments()`.

## Fix Applied

1. **Payments** — `onAppSelected` only updates the filter and `setSelectedApp()`. It does not load. `watchSelectedApp` loads once when the app actually changes. `setSelectedApp` is a no-op for the same `_id`; `selectedApp$` uses `distinctUntilChanged` by `_id`.
2. **Lazy list pages** (products, customers, tokens, gateways, rules, deliveries, apps, admin lists) — `selectedApp$` / search / filter only store state and reset the table. They do **not** call the API. `onLazyLoad` owns the fetch.
3. **`LazyLoadGate.take()`** — drops a PrimeNG `onLazyLoad` that repeats the same page/sort/filters/app. Unrelated to global app state. Used only so a table bind does not refetch the same query.

```text
App changes
    ↓
update appId, page = 1
table.reset()
    ↓
onLazyLoad
    ↓
API (once)
```

## Verification
- [x] Fix implemented in code
- [x] User confirmed one list request on app switch
- [x] Pagination / sort / search still load

## Related Files
- `payup-frontend-customer-control/src/core/services/app-context.service.ts`
- `payup-frontend-customer-control/src/core/shared/utils/list-query.util.ts`
- `payup-frontend-customer-control/src/core/pages/payments/payments.component.ts`
- `payup-frontend-customer-control/src/core/pages/products/products.component.ts`
- `payup-frontend-customer-control/src/core/pages/customers/customers.component.ts`
- `payup-frontend-customer-control/src/core/pages/tokens/tokens.component.ts`
- `payup-frontend-customer-control/src/core/pages/gateways/gateways.component.ts`
- `payup-frontend-customer-control/src/core/pages/gateway-rules/gateway-rules.component.ts`
- `payup-frontend-customer-control/src/core/pages/notifications/deliveries/deliveries.component.ts`
- `payup-frontend-customer-control/src/core/pages/apps/apps.component.ts`
- Same set under `payup-frontend-admin/`
- `.ai-control/project/rules.md` (RULE-013)
