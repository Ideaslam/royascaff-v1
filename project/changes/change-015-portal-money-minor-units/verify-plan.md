# Pre-Build Plan Verification — change-015

Plan doc updated: `actions/customer-portal/pages/dashboard.md`.

## 1. Feature coverage
- All seven affected modules are specced with their money behaviour: Dashboard, Products, Customers, Payments, Gateway Rules, Apps → App View, plus the `CurrenciesService` entry under "Money handling". PASS
- The new shared primitive is recorded: `core/money/` with `MoneyPipe` and the `toMinor` / `toMajor` service-layer boundary. PASS
- No backend work — every endpoint this change calls already exists. PASS

## 2. Service coverage
- Each page names a service that maps to documented endpoints: `ProductsService` → EP-PR02–07, `PaymentsService` → EP-TR01–04 + EP-PY01, `CustomersService` → EP-CU01–07, `DashboardService` → EP-DB01, `GatewayRulesService` → EP-GW09–17, `AppSettingsService` → EP-AP09/11, `CurrenciesService` → EP-CO01. PASS
- Every one of those endpoints already declares the minor-unit request shape or the `Money` response shape in `actions/backend/endpoints/`. PASS

## 3. Data model consistency
- Request keys the portal sends match the backend action docs exactly: product `*Minor` + required `currency` (EP-PR01/EP-PR06), refund `amountMinor` (EP-PY01), settings `minimumAmountMinor` / `maximumAmountMinor` (EP-AP09–11), rule-test `context.amountMinor` (EP-GW17). PASS
- Response shapes match: `amount` as `Money` (EP-TR02–04, EP-CU07), revenue and daily amounts as `Money` (EP-DB01), convert as `{ original, converted, exchangeRate }` (EP-CO05). PASS
- `Currency.minorUnitExponent` and `rateFromUsd` exist in `plan/data-model.md` from change-011 and are exposed by EP-CO01 — so the exponent every price input depends on has a documented source. PASS
- GatewayRule condition fields `amountMinor` / `productPriceMinor` match `plan/data-model.md` and EP-GW17. PASS

## 4. Endpoint–page linking
- Routes in the page spec match the repo: `/products/*`, `/payments`, `/customers/*`, `/`, `/gateway-rules`, `/apps/view/:id`. No route added or removed. PASS

## 5. Auth declarations
- Unchanged. All affected pages keep `authGuard` + `merchantGuard`; app-scoped pages keep `AppContextService`. No new endpoint, so no new auth declaration. PASS

## 6. Custom rules
- **RULE-022**: requests carry integer minor units under `*Minor` keys; responses render from `Money`; the never-hardcode-100 constraint is met by driving every input's fraction digits from `minorUnitExponent` and confining conversion to `toMinor` / `toMajor`. PASS
- **RULE-022** no-derivation clause: line subtotals read the server-allocated `product.total` instead of `price × quantity`. PASS
- **RULE-023**: `rateFromUsd` stays a float; the portal displays no rates today. PASS

## Result: PASS

Two pre-existing inconsistencies are recorded in the plan rather than silently carried: `chartData` is typed `Money` but not rendered (`ChartModule` imported with no `<p-chart>`), and gateway-rule money thresholds are single numbers compared across currencies. Both are explicitly out of scope in the change request.
