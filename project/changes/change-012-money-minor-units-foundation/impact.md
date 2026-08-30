# Impact Analysis — Money as Integer Minor Units (Foundation + Backend)

Change: `change-012-money-minor-units-foundation` · Repo: `payup-api-typescript` · Depends on: `change-011-currency-fx-sync-service`

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Money value module | **none** | — | No `Money` type, no shared helpers, no allocation logic. Money is a bare `number` everywhere. |
| Currency exponent source | **partial** | `constants/currency-constants.ts` | bug-008 added the table + helpers; change-011 relocates the table to `constants/iso-currency-exponents.ts`, backs it with `Currency.minorUnitExponent`, and leaves re-exports behind. This change routes every caller through `ICurrencyService` and deletes the re-exports. **Two artifacts may survive — the DB and the one static table.** |
| Schema — Payment | **complete** | `models/Payment.ts` | All 8 money fields are decimal `Number`. No exponent snapshot. `taxAmount` hides in `metadata`. |
| Schema — Product | **complete** | `models/Product.ts` | 5 decimal money fields. `currency` optional. Undeclared `inventory.price` read by session service. |
| Schema — Currency | **complete** | `models/Currency.ts` | `rateFromUsd` + `minorUnitExponent` land in change-011. No further schema work here — this change is a pure consumer. |
| Schema — App settings | **complete** | `models/App.ts`, `models/interfaces/app-settings.interface.ts` | `minimumAmount` / `maximumAmount` decimal; also never enforced. |
| Schema — GatewayRule | **complete** | `models/GatewayRule.ts` | Condition `field: 'amount' \| 'productPrice'` compared against decimal thresholds in `Mixed`. |
| Schema — AuditLog | **complete** | `models/AuditLog.ts` | `metadata: Mixed`, untyped. No money convention. |
| Validation | **complete** | 7 Zod schemas | All accept decimals. `POST /currencies/convert` bypasses Zod entirely (`parseFloat`). |
| Services | **complete** | 14 services | ~20 arithmetic sites on floats. Two independent rounding policies produce the line-vs-total mismatch. |
| Gateway adapters | **partial** | `services/gateway/gateways/` | bug-008 made Stripe + Moyasar exponent-aware. `base-gateway.ts` interface still says `amount: number` (major). MyFatoorah/PayPal/Test untouched. |
| Endpoints | **complete** | ~20 routes | Every money response is a bare decimal. |
| Aggregations | **complete** | 4 `$sum` pipelines | Sum decimals; exact once values are integers. |
| Webhooks | **complete** | `services/notifications/utils/payload-builder.ts` | Emits decimals to merchant endpoints. |
| Audit — money events | **none** | `services/audit/audit-service.ts` | Only auth/admin events exist. **Zero** product, payment, refund, or price events. |
| Tests | **partial** | `tests/` | Only bug-008's scaling test + one SDK test. No session, conversion, or contract coverage. |

**Feature state**: `complete` for money handling (it exists and is wrong), `none` for the money module and money audit events.

---

## Affected Modules

| Module | Changes needed |
|--------|----------------|
| **payments** | Session creation rewritten to integer arithmetic + remainder allocation; session queries, DTOs, and responses return `Money`; refund request/response renamed |
| **gateways** | `base-gateway.ts` interface renamed to `amountMinor`; all 5 adapters convert at their own boundary; routing rule condition fields renamed; bug-008 helpers absorbed into the money module |
| **core** | Product price fields renamed; currency service converts in integer space and gains `minorUnitExponent`; dashboard/customer aggregations return `Money`; audit service gains money events |
| **apps** | `settings.payment.minimumAmountMinor` / `maximumAmountMinor` |
| **admin** | Admin payment + dashboard services return `Money`; currency admin exposes `minorUnitExponent` |
| **notifications** | Webhook payload builder emits `Money`; template sample payloads and in-app bodies updated |

Cross-module by nature — money is not a module, it is a type that leaks into all of them. That is precisely why it is being centralised.

---

## Plan Docs to Update

- [ ] `plan/data-model.md` — Payment, Product, Currency, App settings, GatewayRule field tables
- [ ] `plan/modules.md` — Payment Session Creation, Product Catalog, Audit Trail feature descriptions
- [ ] `rules.md` — rewrite `RULE-022` from "additive session money fields" to the minor-unit canonical rule
- [ ] `actions/backend/services/payments.md` — SVC-P01, SVC-P02, SVC-P07
- [ ] `actions/backend/services/gateways.md` — adapter interface + per-provider conversion
- [ ] `actions/backend/services/core.md` — product, currency, dashboard, customer, audit services
- [ ] `actions/backend/services/admin.md` — admin payment + dashboard services
- [ ] `actions/backend/services/notifications.md` — SVC-N08 payload builder
- [ ] `actions/backend/services/apps.md` — settings service
- [ ] `actions/backend/endpoints/public-checkout.md` — EP-PC01–PC03
- [ ] `actions/backend/endpoints/public-payments.md` — process/callback amount handling
- [ ] `actions/backend/endpoints/gateways.md` — transactions, core (currencies), dashboard, audit
- [ ] `actions/backend/endpoints/apps.md` — products CRUD, app settings
- [ ] `actions/backend/endpoints/admin.md` — EP-AD25 + currency admin

Not updated: `plan/roles-and-authorization.md` (no auth change), `actions/{checkout,customer-portal,admin-panel}/` (changes 014–016).

---

## Code Impact

### Create

| Path | Purpose |
|------|---------|
| `src/services/money/money.ts` | `Money` type, `fromMinor`, `toDisplay`, `add`, `multiplyByQuantity`, integer + `MAX_SAFE_INTEGER` guards |
| `src/services/money/currency-exponents.ts` | Resolver over `ICurrencyService.getCurrencyExponent` (change-011). Declares no table — imports `constants/iso-currency-exponents.ts` as the unknown-currency fallback |
| `src/services/money/gateway-exponents.ts` | Per-gateway format strategy (`integer-minor` \| `decimal-string`) + Stripe's divisible-by-10 rule |
| `src/services/money/allocate.ts` | Largest-remainder allocation |
| `src/services/money/convert.ts` | Integer-space FX, single half-up rounding event |
| `src/services/money/index.ts` | Module barrel |
| `src/scripts/migrate-money-minor.ts` | `--dry-run` default; drops payments, converts product prices, reseeds currency exponents |
| `src/scripts/verify-money-data.ts` | Scans all documents for legacy decimals / non-integer minors |
| `src/scripts/verify-money-e2e.ts` | Session → checkout → test-gateway pay, asserting amounts at every hop |
| `tests/money/money.test.ts` | Unit (criterion 17) |
| `tests/money/golden-cases.test.ts` + `golden-cases.json` | Golden (criterion 18) — absorbs `tests/gateway-amount-scaling.test.ts` |
| `tests/money/gateway-contract.test.ts` | Contract, HTTP mocked per adapter (criterion 19) |
| `tests/money/invariant.test.ts` | Property-based, 10k seeded cases (criterion 20) |

### Modify — models (7)

`Payment.ts` · `Product.ts` · `Currency.ts` · `App.ts` · `interfaces/app-settings.interface.ts` · `GatewayRule.ts` · `AuditLog.ts`

### Modify — DTOs (3)

`dto/payment-session-list.dto.ts` · `dto/payment-session-details.dto.ts` · `dto/customer-payment-list.dto.ts`

### Modify — services (15)

`payment/payment-session-service.ts` *(largest — arithmetic rewrite + allocation)* · `payment/payment-service.ts` · `payment/base-payment-processor.ts` · `payment/transaction-session-service.ts` · `currency/currency-service.ts` + `currency/currency-service.interface.ts` *(re-sign `convertCurrency` to minor units, delegate to `money/convert.ts`, delete the residual float rounding)* · `core/product-service.ts` · `core/dashboard-service.ts` · `core/customer-service.ts` · `admin/admin-payment-service.ts` · `admin/admin-dashboard-service.ts` · `gateway/gateway-selection-service.ts` · `gateway/gateway-rule-service.ts` · `audit/audit-service.ts` *(+ money events)* · `notifications/utils/payload-builder.ts`

### Modify — gateway layer (6)

`gateway/base-gateway.ts` *(interface rename)* · `gateways/stripe-gateway.ts` · `gateways/moyasar-gateway.ts` · `gateways/myfatoorah-gateway.ts` · `gateways/paypal-gateway.ts` · `gateways/test-gateway.ts`

### Modify — controllers / routes (10)

`public-api/v1/checkout/session/base-session.controller.ts` · `public-api/v1/checkout/checkout/checkout.controller.ts` · `merchant-panel/v1/products/products.controller.ts` · `merchant-panel/v1/payments/payments.controller.ts` · `merchant-panel/v1/apps/settings.controller.ts` · `merchant-panel/v1/core/currencies.controller.ts` *(+ add missing Zod schema)* · `merchant-panel/v1/gateways/gateway-rules.controller.ts` · `merchant-panel/v1/transactions/sessions.controller.ts` · `merchant-panel/v1/reports/dashboard.controller.ts` · `company-admin/v1/admin-v1.routes.ts`

### Modify — constants, seeds, existing tests (5)

`constants/currency-constants.ts` *(surrender bug-008 helpers to the money module; keep the enum)* · `scripts/seed-gateway-rules.ts` *(minor thresholds + renamed fields)* · `services/notifications/seed.ts` *(sample payloads)* · `services/notifications/utils/notification-meta.ts` *(amount rendering)* · `tests/gateway-amount-scaling.test.ts` *(folded into golden suite)*

**Total: ~14 created, ~46 modified.**

---

## Ripple Map

| Trigger | Ripples to | Action |
|---------|-----------|--------|
| `Payment.amount` → `amountMinor` | 4 aggregation pipelines, 3 DTOs, 8 response builders, webhook whitelist | Rename + wrap in `Money` at the response edge |
| `Product.price` → `priceMinor` | Session pricing, product CRUD, gateway rule `productPrice` condition, seed scripts | Rename; delete the phantom `inventory.price` fallback |
| `base-gateway.ts` interface rename | All 5 adapters + `base-payment-processor.ts` + `payment-service.ts` | Compile errors surface every caller |
| `currencyConversion` restructured into two `Money` objects | `resolveCurrencyConversion` / `identityCurrencyConversion` helpers in `Payment.ts`, 5 consumers | Rewrite both helpers to return `Money` |
| bug-008 helpers move out of `currency-constants.ts` | `stripe-gateway.ts`, `moyasar-gateway.ts`, `tests/gateway-amount-scaling.test.ts` | Repoint imports; do **not** leave a second money utility behind |
| `GatewayRule` condition field rename | `gateway-rule-service.ts`, `gateway-selection-service.ts`, seed script, existing rule documents | Renaming makes stale rules stop matching rather than mis-route |
| Any money response shape change | Checkout, portal, admin, OpenAPI, web SDK | **Out of scope here** — changes 013–016, same release train |

---

## Reuse Opportunities

- **bug-008's exponent table and golden test** are the seed of the money module — move, don't rewrite.
- `resolveCurrencyConversion` / `identityCurrencyConversion` (`models/Payment.ts`) already centralise conversion reads; they become `Money`-returning.
- `auditService.auditFromRequest` already extracts actor/IP/UA; money events only need a typed metadata helper on top.
- `PaymentTracer.traceGatewayHttpCall` wraps every adapter call — the natural place to assert outbound integer amounts in contract tests.

---

## Plan-vs-Code Drift Found

| Drift | Resolution |
|-------|------------|
| `Product.inventory.price` read at `payment-session-service.ts:544` but absent from the schema | Delete the fallback |
| `metadata.taxAmount` returned as `totalTax` but never modelled | Promote to `taxAmountMinor` |
| `App.settings.payment.minimumAmount` / `maximumAmount` stored and validated but never enforced | Rename now; enforcement logged as a separate future change |
| `POST /currencies/convert` bypasses Zod | Add the missing schema |
| `web-sdk/src/utils.ts` `validateAmount` / `validateCurrency` are dead code | Removed in change-013 |

---

## Risk

**Complexity: HIGH · Cross-module: YES · Migration: YES (destructive, pre-production)**

| Risk | Severity | Mitigation |
|------|:--------:|------------|
| A money field is missed and silently reads `undefined` | High | Renames make it a compile error; `npm run type-check` is acceptance criterion 8 |
| An adapter gets the wrong multiplier | High | Contract tests assert exact outbound bodies (criterion 19) |
| Three-decimal currencies regress after bug-008 | High | bug-008's assertions are folded into the golden fixture, not discarded (criterion 18) |
| Allocation logic is subtly wrong | High | Property test, 10k seeded cases (criterion 20) |
| Mixed old/new documents corrupt `$sum` | Medium | Payments dropped; `verify-money-data.ts` proves no legacy shape survives (criterion 22) |
| Frontends and OpenAPI break on merge | Medium | Accepted and planned — single release train 011→016 |
| Two competing money utilities after bug-008 | Medium | Explicit ripple item: `currency-constants.ts` surrenders its helpers |
| `display` not localised for Arabic | Low | Documented as locale-neutral; frontends localise from `minor` + `exponent` |

---

## Recommendation

- **Create** — `src/services/money/` (6 files), 3 scripts, 4 test suites + golden fixture
- **Complete** — currency exponent handling (bug-008 added the constants table, change-011 put it in the DB; finish by moving every read into the money module behind `ICurrencyService`); gateway adapter conversion (Stripe/Moyasar done, MyFatoorah/PayPal/Test remaining)
- **Modify** — 7 models, 3 DTOs, 15 services, 6 gateway files, 10 controllers, 5 constants/seed/test files
- **Ripple** — `resolveCurrencyConversion` helpers, 4 aggregations, webhook whitelist, gateway rule conditions, seed scripts

**Prerequisite**: change-011 must be merged — it supplies `Currency.minorUnitExponent`, `ICurrencyService`, and `constants/iso-currency-exponents.ts`, which this change reads rather than defines.

**Line-number caveat**: every `file.ts:NNN` citation in this document and in the change request was captured **before** change-011. Change-011 refactors `currency-service.ts`, `currencies.controller.ts`, `admin-v1.routes.ts`, and `seed-currencies.ts`, so those anchors will have shifted. Re-locate by symbol, not by line.

**Sequence within the change**: money module + tests → models → services (session service last, since it owns the allocation rewrite) → adapters → controllers/DTOs → audit events → migration + verification scripts.
