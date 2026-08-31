# Impact Analysis — Customer Portal to Minor Units

Change: `change-015-portal-money-minor-units` · Repo: `payup-frontend-customer-control` (Angular 21, PrimeNG 21, ngx-translate en/ar + RTL, Vitest + jsdom) · Depends on: change-011 ✓, change-012 ✓, change-013

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Money type | **none** | — | No `Money` interface; every amount is `number` + separate `currency: string` |
| Shared formatter | **none** | — | No pipe, no util, no component. Four ad-hoc formatters instead |
| Currency exponent | **none** | `core/services/currencies.service.ts:5–10` | `Currency` has `code`, `name`, `symbol`, `exchangeRateToUSD`. **No exponent anywhere in the repo** — every price input hardcodes 2 decimals |
| Product model | **complete** | `core/services/products.service.ts:6–182` | 4 interfaces × 5–6 money fields, all `number`; `currency?` optional |
| Product form | **complete** | `pages/products/product-form/product-form.component.ts` (975 lines, inline template) | 4 × `p-inputNumber` hardcoded `minFractionDigits: 2` / `maxFractionDigits: 2`; payload is a raw object spread; currency optional and clearable |
| Product edit load | **partial** | same file, 817–837 | Maps `price` + `currency` only — silently blanks `compareAtPrice`, `unitPrice`, `costPerItem`. **Pre-existing bug** |
| Payments model | **complete** | `core/services/payments.service.ts` | `PaymentSession.amount` (10), product `price`/`sessionPrice`/`currentProductPrice` (29–35), `RefundRequest.amount` (86), `totalRevenue` (190) |
| Payments UI | **complete** | `pages/payments/payments.component.html` | 8 `CurrencyPipe` bindings; **2 recomputations** at 401, 404; hardcoded `'USD'` at 39 |
| Refund flow | **complete** | `pages/payments/payments.component.ts:308–332` | Sends `{ amount, reason }`; native `confirm()` with a raw number; full-amount only |
| Dashboard | **complete** | `pages/dashboard/dashboard.ts`, `services/dashboard.service.ts` | `revenue \| currency:'USD'` hardcoded (91); `session.amount` (158); `chartData` typed, loaded, **never rendered** — `ChartModule` imported at 7/23 with no `<p-chart>` |
| Customers | **complete** | `services/customers.service.ts:87–94`, `customer-view.component.ts:343–347` | `amount: number`; ad-hoc `Intl.NumberFormat` |
| Gateway rules | **complete** | `pages/gateway-rules/` | `fieldOptions` `'amount'` / `'productPrice'` (TS 142–151); condition values are plain text inputs (HTML 369–379); test context `p-inputNumber mode="currency" currency="USD"` (454–461) |
| App settings | **complete** | `pages/apps/app-view/app-view.component.ts` | `minimumAmount` (488–493), `maximumAmount` (505–510), decimal, hardcoded 2 digits; Arabic-only UI |
| Tests | **none** | `src/app/app.spec.ts` | One bootstrap smoke test. Vitest + jsdom configured and unused. **Zero money coverage** |
| i18n / RTL | **complete** | `TranslationService:86–100` | Working `en`/`ar` with `dir="rtl"` — the only frontend with a real Arabic path |

**Feature state**: `complete` for money handling (present everywhere, uniformly wrong for the new contract) · `partial` for product edit-load · `none` for the money module, the exponent, and tests.

---

## Affected Modules

| Module | Changes needed |
|--------|----------------|
| **Products** | 4 interfaces re-typed; 4 price inputs made exponent-aware; explicit `*Minor` mapper; `currency` required; edit-load bug fixed |
| **Payments** | 8 display bindings; 2 recomputations deleted; refund payload renamed; confirm dialog reworked |
| **Customers** | `CustomerPaymentListItem.amount` → `Money`; ad-hoc formatter deleted |
| **Dashboard** | 4 money fields → `Money`; hardcoded `'USD'` removed; chart data typed but still not rendered |
| **Gateway Rules** | 2 condition field values renamed; money condition inputs become integer controls; test context renamed |
| **Apps** | Settings min/max → `*Minor` with exponent-aware entry |
| **Core — Currencies** | `exchangeRateToUSD` → `rateFromUsd`; **`minorUnitExponent` added — the field every price input now depends on** |

Seven of the portal's ten modules. Money is not a module here either; it is a type that leaked into most of them.

---

## Plan Docs to Update

- [x] `actions/customer-portal/pages/dashboard.md` — added a "Money handling" section (module, `MoneyPipe`, major-in/minor-out boundary, exponent-driven inputs, no-derivation rule) plus a `CurrenciesService` entry; updated Dashboard, Products, Customers, Payments, Gateway Rules, and Apps → App View

Not updated: `plan/data-model.md`, `plan/modules.md`, `rules.md`, `actions/backend/**` — settled by change-012. `actions/customer-portal/pages/_index.md` needs no edit (page count unchanged).

---

## Code Impact

### Create

| Path | Purpose |
|------|---------|
| `src/core/money/money.model.ts` | `Money` interface |
| `src/core/money/money.util.ts` | `formatMoney`, `toMinor`, `toMajor`, `subtractMoney` |
| `src/core/money/money.pipe.ts` | Standalone `MoneyPipe` — the display path for a template-heavy app |
| `src/core/money/index.ts` | Barrel |
| `src/core/money/money.spec.ts` | Unit tests (criterion 31) |
| `src/core/pages/products/product-form/product-form.spec.ts` | Payload + validation + edit-load regression (criterion 32) |

### Modify — services (7)

| File | Scope |
|------|-------|
| `services/currencies.service.ts` | `exchangeRateToUSD` → `rateFromUsd`; add `minorUnitExponent`, `rateUpdatedAt`, `rateSource`; `getCurrency()` (23) becomes the exponent lookup and stops being dead code |
| `services/products.service.ts` | `Product`, `ProductListItem`, `CreateProductRequest`, `UpdateProductRequest` (6–182) — responses `Money`, requests `*Minor`; explicit mappers replace pass-through |
| `services/payments.service.ts` | `PaymentSession.amount` (10), session product prices (29–35), `RefundRequest` → `amountMinor` (86), refund response (128–129), `totalRevenue` (190) |
| `services/customers.service.ts` | `CustomerPaymentListItem.amount` (89) → `Money` |
| `services/dashboard.service.ts` | `orders.revenue` (10), `PaymentSession.amount` (16), `dailyPayments[].amount` (39), `summary.totalAmount` (43), `summary.averageDaily` (45) → `Money` |
| `services/gateway-rules.service.ts` | Test payload `context.amount` → `context.amountMinor` (106–107) |
| `services/app-settings.service.ts` | `payment.minimumAmount` / `maximumAmount` (32–33) → `*Minor` |

### Modify — pages (9)

| File | Scope |
|------|-------|
| `pages/products/product-form/product-form.component.ts` | 4 price controls (210–284) exponent-driven; currency select (196–206) required, `showClear` removed; validation (919); `loadProduct` (817–837) maps all four prices; payload mapper (928–968) strips `valuesString`; `formatCurrencyLabel` (808–810) shows the exponent |
| `pages/products/products.component.ts` | `CurrencyPipe` (141) → `MoneyPipe`; `formatCurrencyLabel` (286–287) shows the exponent |
| `pages/products/product-view/product-view.component.ts` | Delete `formatPrice` (356–363); bind through the pipe |
| `pages/payments/payments.component.html` | 8 bindings (39, 253, 331, 391, 395, 401, 404, 413); **401 and 404 read the server-allocated line total** |
| `pages/payments/payments.component.ts` | Refund payload (310–313) → `amountMinor`; native `confirm()` (309) → PrimeNG confirm dialog with `display`; toast (320) |
| `pages/customers/customer-view/customer-view.component.ts` | Delete `formatCurrency` (343–347); bind through the pipe |
| `pages/dashboard/dashboard.ts` | Revenue (91) and session amount (158) → `MoneyPipe`; drop hardcoded `'USD'` |
| `pages/gateway-rules/gateway-rules.component.ts` | `fieldOptions` (142–151); defaults `100` → `10000` (192–195, 211–214); `addCondition` (521–525); test context (114–118, 559–565) |
| `pages/gateway-rules/gateway-rules.component.html` | Field dropdown (353–358); condition value control (369–379) becomes integer for money fields; test amount input (454–461) loses `mode="currency" currency="USD"` |
| `pages/apps/app-view/app-view.component.ts` | Min/max controls (488–493, 505–510) exponent-driven; defaults (909–910); save path (969–994) converts to `*Minor` |

**Total: 6 created, ~17 modified.**

---

## Ripple Map

| Trigger | Ripples to | Action |
|---------|-----------|--------|
| `Currency` gains `minorUnitExponent` | Product form, app settings, every future money input | The enabling change — without it every input guesses 2 decimals |
| `exchangeRateToUSD` removed | `currencies.service.ts:9` only (typed, never read in UI) | Clean removal; no display regression |
| Product interfaces re-typed | Product form, list, view, and both mappers | Compile errors enumerate every consumer |
| `currency` becomes required | Create form, edit form, `ensureProductCurrency()` backfill, existing products with no currency | Backfill retained; a legacy product without a currency must be caught on load, not on save |
| Product payload becomes an explicit mapper | Removes the accidental `valuesString` leak | Behaviour change beyond the rename — recorded, intended |
| `RefundRequest.amount` → `amountMinor` | Refund button, confirm dialog, success toast | Full-amount only; no new input |
| `payments.component.html:401/404` | Session detail line items | Read `product.total`; **do not port the multiplication** |
| Gateway-rule field values renamed | Existing saved rules in the database | Stale rules stop matching rather than mis-route — safer, but operators must re-save. Needs a release note |
| App settings keys renamed | `app-view` save path, stored settings documents | Backend already migrated by change-012 |
| `MoneyPipe` introduced | 11 `CurrencyPipe` bindings + 2 `Intl` helpers | Single display path; both ad-hoc helpers deleted |
| Arabic RTL | Every money surface | `MoneyPipe` accepts a locale from the outset — this is the only frontend where that matters today |

---

## Reuse Opportunities

- **`CurrenciesService.getCurrency(code)` already exists** (line 23) and has never been called. It becomes the exponent lookup — dead code turned into the load-bearing piece.
- **`ensureProductCurrency()`** (802–805) already backfills a missing currency on load; making currency required needs the guard, not a new one.
- **`formatCurrencyLabel`** exists in two places for dropdown labels. It is not an amount formatter, so it survives the consolidation and just gains the exponent hint.
- **`TranslationService` already sets `dir="rtl"` and exposes the active language** — `MoneyPipe`'s locale argument has a real source to read from, unlike in checkout.
- **Vitest + jsdom is configured** (`angular.json:103–105`) and unused. The two new suites need no tooling work.
- **PrimeNG `ConfirmDialog`** is already the established pattern elsewhere in the stack, so replacing the native `confirm()` follows house style rather than inventing one.

---

## Plan-vs-Code Drift Found

| Drift | Resolution |
|-------|------------|
| Product edit silently blanks `compareAtPrice`, `unitPrice`, `costPerItem` (817–837) | **Fixed** — the mapping is being rewritten anyway |
| `totalRevenue` (39) and dashboard `revenue` (91) hardcode `'USD'` for every merchant | **Fixed** |
| UI-only `valuesString` is sent to the API inside variants | **Fixed** by the explicit mapper |
| Rule-test amount input hardcodes `currency="USD"` | **Fixed** — becomes an integer control |
| `ChartModule` imported (7, 23), `chartData` loaded, no `<p-chart>` rendered | Typed correctly; **wiring the chart is out of scope** |
| Refund reason hardcoded `'Customer requested refund'`; no partial refund | Out of scope |
| Variant model supports `price`, UI (465–472) exposes none | Out of scope; mapper handles it if present |
| `reports.component.ts` hardcodes `'12,000'` / `'41.90'`; route redirects to dashboard (`app.routes.ts:58`) | Dead — left alone |
| Many pages hardcode English despite working `ar` support | Out of scope |
| Gateway-rule thresholds compare a single number across currencies | Pre-existing modelling weakness; recorded, out of scope |

---

## Risk

**Complexity: HIGH · Cross-module: YES (7 modules) · Migration: NO · Data-corruption exposure: the only frontend that writes money**

| Risk | Severity | Mitigation |
|------|:--------:|------------|
| A merchant's price is silently rounded or truncated on save | **High** | `toMinor` throws rather than truncates (criterion 3); round-trip asserted (4, 19, 34–35) |
| KWD/BHD/OMR merchants cannot enter the third decimal | **High** | Exponent drives every control (13); KWD and JPY both asserted (14–15) |
| A request still carries a decimal or an old key → 400 | High | Explicit mappers replace object spread (6–7); grep assertion (11) |
| Displayed line totals disagree with the session total | Medium | Recomputation deleted (25); remainder case tested (26) |
| Existing gateway rules stop matching after the field rename | Medium | Intended failure mode; needs an operator release note |
| Legacy products with no currency block the now-required field | Medium | `ensureProductCurrency()` backfill on load |
| 975-line inline-template form changed with no prior test coverage | Medium | New spec file (32) written before the edit |
| Arabic RTL money rendering regresses | Low | Criterion 39; locale support built in from the start |
| Dashboard chart stays unrendered | Low | Pre-existing; explicitly out of scope |

---

## Recommendation

- **Create** — `src/core/money/` (5 files) + `product-form.spec.ts`
- **Complete** — currency exponent support, which does not exist in this repo at all and which every price input now depends on; product edit-load mapping (partial since before this change)
- **Modify** — 7 services, 10 page files, 4 product interfaces, 11 display bindings, 2 request-key groups, 2 gateway-rule enums
- **Delete** — 2 ad-hoc `Intl` amount formatters, 2 client-side recomputations, `exchangeRateToUSD`
- **Ripple** — saved gateway rules in the database; legacy products with no currency

**Sequence within the change**: money module + spec → `CurrenciesService` exponent (nothing else can be correct before this) → product service mappers → product form (largest single file; write its spec first) → payments + refund → customers → dashboard → gateway rules → app settings → delete the ad-hoc formatters → manual SAR/KWD round trips → Arabic pass.

**Line-number caveat**: captured on the current working tree before any edit. `product-form.component.ts` is a 975-line inline-template file that shifts heavily as work proceeds — re-locate by symbol, not by line.
