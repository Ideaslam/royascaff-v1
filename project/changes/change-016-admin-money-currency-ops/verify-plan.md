# Pre-Build Plan Verification — change-016

Plan doc updated: `actions/admin-panel/pages/admin-panel.md`.

## 1. Feature coverage
- All three affected routed screens are specced with their new behaviour: Currencies (columns, sync action, status strip, dialog fields, validation, exponent guard), Payments List / Detail (`Money` rendering), Platform Dashboard (revenue card). PASS
- The new shared primitive is recorded in the page-spec header, including the deliberate absence of `toMinor`. PASS
- The removal of the unrouted merchant-portal copy is recorded under "Admin Repo Cleanup". PASS
- No backend work — both FX endpoints already exist. PASS

## 2. Service coverage
- `AdminCurrenciesService` → EP-AD16–18, EP-AD35, EP-AD36; `AdminPaymentsService` → EP-AD24–25; `AdminDashboardService` → EP-AD05. All present in the "Frontend Services" table and all backed by entries in `actions/backend/endpoints/admin.md`. PASS
- EP-AD35 and EP-AD36 delegate to `ExchangeRateSyncService.syncNow('manual')` and `.getSyncStatus()`, both registered in `actions/backend/services/core.md` behind `IExchangeRateSyncService`. PASS

## 3. Data model consistency
- `AdminCurrency` mirrors EP-AD16–18: `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource`. All exist on `Currency` in `plan/data-model.md` from change-011. PASS
- The sync status shape (provider, last success, last failure, staleness, active currency count) matches EP-AD36 as documented. PASS
- `AdminPaymentSession.amount` as `Money` matches EP-AD24; the typed detail model matches EP-AD25, including `currencyConversion` as `{ original, converted, exchangeRate }`. PASS
- `statistics.payments.revenue` as `Money` matches EP-AD05. PASS

## 4. Endpoint–page linking
- Pages Summary row for `/currencies` now lists EP-AD16–18, EP-AD35, EP-AD36. Endpoint total corrected 32 → 34, matching `actions/backend/endpoints/_index.md`, which records 34 admin endpoints. PASS
- No route added or removed; 15 routes unchanged. PASS

## 5. Auth declarations
- Unchanged. All three screens keep `authGuard` + `adminGuard`. EP-AD35 and EP-AD36 are declared `admin` in the backend endpoint doc, matching the guards already on `/currencies`. PASS

## 6. Custom rules
- **RULE-022**: money renders from `Money`; the admin panel submits no amount, so the minor-unit request clause has no surface here — and the money module omits `toMinor` so it cannot acquire one accidentally. PASS
- **RULE-023**: `rateFromUsd` is displayed and edited as an unrounded float, never wrapped as `Money`; the column header states *per 1 USD* so the change-011 semantics inversion is visible to the operator. PASS
- Change-011's `currency.exponent.updated` audit action is backed in the UI by a confirm dialog before any exponent write — the audit records that it happened, the dialog makes it deliberate. Recorded in the page spec. PASS

## Result: PASS

This is the only downstream change absorbing two upstream migrations, and both are now reflected in one page spec: change-011 in the Currencies entry, change-012 in Payments and Dashboard.
