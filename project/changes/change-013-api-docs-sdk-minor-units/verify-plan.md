# Pre-Build Plan Verification — change-013

Scope note: this change updates **no** planning document. It brings the published OpenAPI specs in line with `project/actions/backend/`, which change-012 already made authoritative. These checks therefore verify that the plan the specs must match is itself complete and internally consistent.

## 1. Feature coverage
- Every money-bearing route the specs document has an entry in `actions/backend/endpoints/`: public checkout (EP-PC01–03), public payments (EP-PP01–03), webhooks (EP-PW01–04), transactions (EP-TR01–04), products (EP-PR01–06), app settings (EP-AP09–11), refunds (EP-PY01), customer payments (EP-CU07), currencies (EP-CO01, EP-CO03, EP-CO05), gateway rule test (EP-GW17), dashboard (EP-DB01). PASS
- No page/view coverage required — `api-docs` renders specs through Redoc and `web-sdk` has no `actions/` folder per `profile.md`. PASS

## 2. Service coverage
- Every endpoint above names a service in the action docs (`PaymentSessionService`, `ProductService`, `ICurrencyService`, `AppSettingsService`, `CustomerService`, `GatewayRuleService`, `AdminCurrencyService`). SVC-M01 (money module) is registered in `services/payments.md`. PASS

## 3. Data model consistency
- No new entities. The `Money` schema being added to the specs mirrors the response shape already recorded in `plan/data-model.md` and in `services/payments.md` (SVC-M01 `toMoney`). `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource` all exist on `Currency` in `data-model.md` from change-011. PASS
- The three responses being newly typed (`DashboardReport`, `ConvertCurrencyResponse`, `CustomerPaymentListItem`) each have a documented backend shape — EP-DB01, EP-CO05, EP-CU07 respectively. PASS

## 4. Endpoint–page linking
- N/A: no pages. Route-level linkage is tracked in `scripts/route-checklist.md`, which gains a change-013 row. PASS

## 5. Auth declarations
- Unchanged by this change. Every documented route keeps the auth already declared in the action docs (SDK JWT, merchant JWT, admin JWT, public). The admin surface — including EP-AD35/EP-AD36 — stays out of the published specs by existing policy. PASS

## 6. Custom rules
- **RULE-022** (money is integer minor units; responses wrap `Money`) is what the specs are being made to express. PASS
- **RULE-023** (rates are stored floats, never money) is honoured: `exchangeRate` stays `type: number` and is explicitly documented as not a `Money`. PASS

## Result: PASS

Plan is consistent; the gap is entirely between the plan and the published specs, which is what this change closes.
