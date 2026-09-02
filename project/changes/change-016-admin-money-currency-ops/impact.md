# Impact Analysis — Admin Panel: Money Display + Currency/FX Operations

Change: `change-016-admin-money-currency-ops` · Repo: `payup-frontend-admin` (Angular 21, PrimeNG 21, Vitest, ngx-translate configured but admin UI hardcoded English) · Depends on: change-011 ✓, change-012 ✓, change-013

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Money type | **none** | — | No `Money` interface; **no pipes at all in the repo** |
| Shared formatter | **none** | — | Only two ad-hoc `Intl.NumberFormat` methods, both on unrouted legacy components |
| Currency model | **complete** | `core/services/admin-currencies.service.ts:6–12` | `exchangeRateToUSD` (10) — field no longer exists in the DB. No `rateFromUsd`, no `minorUnitExponent`, no provenance |
| Currency screen | **complete** | `core/pages/admin/currencies/currencies.component.ts` | Inline template. Rate column (31, 36), dialog (45–54), create default (77), save (80–87). **Zero validation.** No exponent, no sync, no staleness |
| FX sync endpoints | **none** | — | `POST /currencies/sync` and `GET /currencies/sync/status` shipped in change-011 with **zero references** in this repo |
| Admin payments model | **complete** | `core/services/admin-payments.service.ts:13–14, 42` | `amount: number`; `getPayment(): Observable<any>` |
| Admin payments UI | **complete** | `admin-payments.component.ts:45`, `admin-payment-detail.component.ts:22, 33` | **Raw unformatted** `{{ row.amount }} {{ row.currency }}`; detail typed `any` |
| Admin dashboard | **partial** | `core/services/dashboard.service.ts:8`, `pages/admin/dashboard/dashboard.ts:52–58` | `payments.revenue: number` typed and fetched, **never bound to a template** |
| Products / refunds | **none** (routed) | — | Not in `app.routes.ts` or `app.menu.ts`. Confirmed absent from the deployed admin surface |
| Legacy unrouted code | **complete** | `core/pages/`, `core/services/` | Merchant-portal copy: `payments.service.ts`, `products.service.ts`, `customers.service.ts`, `currencies.service.ts`, products pages, merchant payments page + refund flow, `reports.component.ts`. Compiles, carries stale money models, unreachable |
| Badge pattern | **complete** | `webhook-health.component.ts:41`, `currencies.component.ts:37` | `p-tag` with dynamic severity — reusable for staleness |
| Loading-action pattern | **complete** | `gateway-catalog.component.ts:166`, `webhooks.component.ts:116` | `p-button [loading]` — reusable for Sync now |
| Confirm-dialog pattern | **complete** | `security.component.ts:683–709`, `webhooks.component.ts:474–503` | `ConfirmationService` + danger accept — reusable for the exponent guard. **`currencies.component.ts` has none today** |
| Tests | **none** | `src/app/app.spec.ts` | One smoke test, and it is stale — line 21 expects the title `payup-frontend-customer-control` |

**Feature state**: `complete` but wrong for currency CRUD and payment display · `partial` for dashboard revenue (fetched, never shown) · `none` for the money module, FX operations UI, exponent management, and tests.

---

## Affected Modules

| Module | Changes needed |
|--------|----------------|
| **Platform Config — Currencies** | Rate field rename + inverted semantics; exponent column and guarded editor; source and freshness columns; sync button; status strip; first-ever validation |
| **Payments Overview** | `amount` → `Money`; two raw bindings formatted; two `any`s typed |
| **Dashboard** | `revenue` → `Money` **and displayed** for the first time |
| **Shared** | New money module (`Money`, `formatMoney`, `MoneyPipe`) |

Three routed screens. Narrow surface, but the currency screen roughly doubles in functionality.

---

## Plan Docs to Update

- [x] `actions/admin-panel/pages/admin-panel.md` — header gains a **Money** note (module, `MoneyPipe`, read-only-for-money, no `toMinor`); **Currencies** entry rewritten with the new columns, sync action, status strip, dialog fields, validation, and exponent confirm guard; **Payments List / Detail** and **Platform Dashboard** record `Money` rendering and the revenue card
- [x] `actions/admin-panel/pages/admin-panel.md` → "Frontend Services" table (`AdminCurrenciesService` gains `sync()` / `getSyncStatus()`), "Pages Summary" row for `/currencies`, endpoint total 32 → 34, and a new **Admin Repo Cleanup** section recording the removal of the unrouted merchant copy

Not updated: `plan/data-model.md`, `plan/modules.md`, `rules.md`, `actions/backend/**` — settled by changes 011 and 012. Page count is unchanged, so `pages/_index.md` needs no edit.

---

## Code Impact

### Create

| Path | Purpose |
|------|---------|
| `src/core/money/money.model.ts` | `Money` interface |
| `src/core/money/money.util.ts` | `formatMoney` only — **no `toMinor`** (criterion 4) |
| `src/core/money/money.pipe.ts` | Standalone `MoneyPipe`; the repo's first pipe |
| `src/core/money/index.ts` | Barrel |
| `src/core/money/money.spec.ts` | Unit tests |
| `src/core/pages/admin/currencies/currencies.spec.ts` | Payload, exponent-guard, sync, and staleness tests |

### Modify

| File | Scope |
|------|-------|
| `core/services/admin-currencies.service.ts` | `AdminCurrency` (6–12): drop `exchangeRateToUSD`, add `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource`; add `sync()` and `getSyncStatus()` + a `SyncStatus` model |
| `core/pages/admin/currencies/currencies.component.ts` | **Largest edit.** Table columns (31, 35–38); dialog (45–54); create defaults (77); `openEdit` captures the loaded exponent (78); `save` (80–87) gated by the confirm dialog; add `ConfirmationService`, sync action, status load, validation |
| `core/services/admin-payments.service.ts` | `AdminPaymentSession.amount` → `Money`, drop `currency` (13–14); type `getPayment()` (42) |
| `core/pages/admin/payments/admin-payments.component.ts` | Raw binding (45) → `MoneyPipe` |
| `core/pages/admin/payments/admin-payment-detail.component.ts` | Raw binding (22) → `MoneyPipe`; type `payment` (33) |
| `core/services/dashboard.service.ts` | `payments.revenue` (8) → `Money` |
| `core/pages/admin/dashboard/dashboard.ts` | Add Revenue stat card beside the existing cards (52–58) |
| `src/app/app.spec.ts` | Stale title expectation (21) |

### Delete

| Path group | Files |
|------------|-------|
| Legacy merchant services | `services/payments.service.ts`, `services/products.service.ts`, `services/customers.service.ts`, `services/currencies.service.ts` |
| Legacy merchant pages | `pages/products/` (list, form, view), `pages/payments/` (merchant version + refund flow), `pages/customers/customer-view/`, `pages/reports/` |

All unrouted and unreferenced from `app.routes.ts` and `app.menu.ts`. Removed as a single group — criterion 28 forbids a partial removal, since a half-deleted copy is worse than either whole.

**Total: 6 created, 8 modified, ~10 deleted.**

---

## Ripple Map

| Trigger | Ripples to | Action |
|---------|-----------|--------|
| `AdminCurrency.exchangeRateToUSD` removed | `currencies.component.ts` (31, 36, 49, 77) | Four sites; all in one file |
| Rate semantics inverted (0.27 → 3.7545) | Operator interpretation, not code | Column header and dialog help text state *per 1 USD* — the only defence against a "correction" |
| `minorUnitExponent` exposed for editing | Every stored amount in that currency | Confirm dialog + change-011's `currency.exponent.updated` audit |
| `sync()` / `getSyncStatus()` added | Currency page init and header | Status must load independently of the list so a status failure never empties the table |
| `AdminPaymentSession.amount` → `Money` | List (45) and detail (22) | Two raw bindings; typing the detail model turns future drift into a compile error |
| `getPayment(): any` typed | Detail component | Removes the `any` that let this migration reach runtime |
| `revenue` → `Money` | Dashboard service + template | Field goes from fetched-and-discarded to displayed |
| `MoneyPipe` introduced | 3 templates | First pipe in the repo; establishes the pattern |
| Legacy code deleted | Nothing routed | Grep-confirmed unreferenced from `app.routes.ts` and `app.menu.ts` |

**Not a ripple**: `gateway-catalog.component.ts:228–232` reads currencies for a dropdown but uses only `code`, `name`, and `isActive` — unaffected by the rate rename.

---

## Reuse Opportunities

Every UI pattern this change needs already exists in the repo:

| Need | Existing pattern |
|------|------------------|
| Staleness badge | `p-tag` with dynamic severity — `webhook-health.component.ts:41` |
| Source badge | Same, already used for active/inactive at `currencies.component.ts:37` |
| Sync button with loading | `p-button [loading]` — `gateway-catalog.component.ts:166`; per-row variant at `webhooks.component.ts:116` |
| High-risk confirm | `ConfirmationService` + danger accept — `security.component.ts:683–709`; simpler form at `webhooks.component.ts:474–503` |
| Refresh action in a table header | `admin-payments.component.ts:32`, `list-filter-bar.component.ts:72–79` |

The money module is a straight port of the change-015 version minus `toMinor` and `toMajor`, so the interface and the pipe semantics carry over exactly.

---

## Plan-vs-Code Drift Found

| Drift | Resolution |
|-------|------------|
| Currency screen has **no validation at all** | Added — name, symbol, rate, exponent |
| Two change-011 endpoints shipped with zero UI callers | Wired |
| `AdminDashboardStats.payments.revenue` fetched every load, never displayed | Displayed |
| `getPayment(): Observable<any>` and `payment: any` | Typed |
| Money rendered raw with no pipe on two admin screens | Formatted |
| `app.spec.ts` expects the customer-portal title | Fixed |
| A large unrouted merchant-portal copy carries stale money models | **Deleted** |
| Admin menu labels hardcoded English despite ngx-translate being wired | Out of scope |
| `currencies.service.ts` (merchant) duplicates `admin-currencies.service.ts` | Falls under the legacy decision |

---

## Risk

**Complexity: MEDIUM-HIGH · Cross-module: NO (3 routed screens) · Migration: NO · Operator-error exposure: highest in the train**

| Risk | Severity | Mitigation |
|------|:--------:|------------|
| One-click exponent change reinterprets every stored amount in a currency | **Critical** | Confirm dialog with danger styling before any request (criteria 17–21) + change-011 audit entry |
| Admin "corrects" an inverted rate back to the old value | High | *Per 1 USD* in the column header and dialog help; `rateSource: 'manual'` makes the edit visible |
| `[object Object]` on the platform payments screen | Medium | Typed models replace both `any`s; criterion 26 |
| Sync button hammers the FX provider | Medium | Per-action loading disables it in flight; backend job is idempotent |
| Status endpoint failure blanks the currency table | Medium | Status loads independently; degrades to an unknown badge |
| Currency screen gains validation and rejects a previously-savable record | Low | Intended; existing seeded data satisfies the new rules |
| Three duplicated money modules drift across repos | Low | Accepted cost of the multi-repo layout; admin copy is deliberately minimal |
| Deleting legacy code removes something still wanted | Low | Grep-confirmed unreferenced from routes and menu; git retains it; criterion 28 requires the build and routes to pass afterwards |

---

## Recommendation

- **Create** — `src/core/money/` (5 files) + `currencies.spec.ts`
- **Complete** — currency administration, which change-011 left half-finished (model shipped, UI never followed); dashboard revenue, fetched but never shown
- **Modify** — `AdminCurrenciesService` (+2 endpoints), the currency screen (roughly doubles), `AdminPaymentsService` + 2 payment screens, `AdminDashboardService` + dashboard, `app.spec.ts`
- **Delete** — the unrouted merchant-portal copy (4 services + 4 page groups)
- **Ripple** — none outside this repo; this change closes the train

**Sequence within the change**: money module + spec → `AdminCurrenciesService` model and the two sync methods → currency table columns → sync button and status strip → exponent editor and the confirm guard (write `currencies.spec.ts` before this part) → payment list and detail → dashboard revenue card → delete the legacy unrouted copy → manual pass over `/currencies`, `/payments`, `/`.

**Line-number caveat**: captured on the current working tree before any edit. `currencies.component.ts` is an inline-template file that grows substantially here — re-locate by symbol.
