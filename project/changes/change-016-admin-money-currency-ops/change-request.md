# Change Request

## Metadata
- **date**: 2026-08-31
- **change-type**: modify-feature
- **target-app**: admin-panel
- **affected-repos**: `payup-frontend-admin`
- **priority**: high

## Scope
- Module(s): Platform Config (Currencies), Payments Overview, Dashboard
- Feature(s): Currency administration + FX operations; cross-merchant payment list/detail; platform revenue
- Endpoint(s): EP-AD16–18 (currency CRUD), **new to the UI** EP-AD35 (`POST /currencies/sync`) and EP-AD36 (`GET /currencies/sync/status`), EP-AD24–25 (payments), EP-AD05 (dashboard)
- Page(s)/View(s): `admin-panel:` `/currencies`, `/payments`, `/payments/:sessionId`, `/`
- Service(s): `AdminCurrenciesService`, `AdminPaymentsService`, `AdminDashboardService`; **new** shared money module
- Depends on: **change-011** ✓ (currency model + sync endpoints), **change-012** ✓ (money), **change-013** for the contract
- Closes the release train: after this, no app in the stack is on the old contract

---

## Description

### Problem

The admin panel carries the tail of both breaking changes, and it is the only app that carries change-011's full weight.

**Change-011 left the currency screen orphaned.** `AdminCurrency` (`core/services/admin-currencies.service.ts:6–12`) still models `exchangeRateToUSD`, a field that no longer exists in the database. The screen displays it, edits it, and defaults it to `1` on create. Editing a currency now posts a field the API ignores while omitting the two it requires. Worse, the semantics inverted: `rateFromUsd` is *units per 1 USD*, so SAR moved from `0.27` to `3.7545`. An admin reading the old label over the new number would conclude the data is corrupt.

Two admin endpoints shipped in change-011 and have **zero references** in this repo: EP-AD35 (`POST /currencies/sync`) and EP-AD36 (`GET /currencies/sync/status`). There is currently no way for an operator to force an FX refresh, and no way to see whether the hourly job is even running. The rates driving every conversion in the platform are, from the admin's point of view, invisible.

`minorUnitExponent` is likewise absent from the UI. It is the single highest-risk field in the system — changing it reinterprets every stored amount in that currency — and change-011 deliberately audits it as `currency.exponent.updated`. Today it cannot be seen or edited at all.

**Change-012 broke the money displays**, and here they were already the weakest in the stack. `admin-payments.component.ts:45` renders `{{ row.amount }} {{ row.currency }}` — raw, unformatted, no pipe. `admin-payment-detail.component.ts:22` does the same. Both now print `[object Object]`.

`AdminDashboardStats.payments.revenue` (`dashboard.service.ts:8`) is typed, fetched, and **never displayed** — the platform revenue figure is loaded on every dashboard visit and thrown away.

There is no formatting utility of any kind in this repo. No pipes at all, no shared money helper — only two ad-hoc `Intl.NumberFormat` methods on unrouted legacy components.

### Desired outcome

The currency screen becomes a real FX operations console: rates with provenance and freshness, a manual sync, and a guarded exponent edit. Every money display in the routed admin app renders through one primitive.

### Currency screen — `core/pages/admin/currencies/currencies.component.ts`

The largest piece of this change. The component is a single file with an inline template, a table, and a dialog, and it currently has **no validation of any kind**.

**Table** (today: Code, Name, Symbol, Rate (USD), Active, Edit):

| Column | Source | Notes |
|--------|--------|-------|
| Code | `code` | unchanged |
| Name | `name` | unchanged |
| Symbol | `symbol` | unchanged |
| **Rate (per 1 USD)** | `rateFromUsd` | replaces "Rate (USD)". The header must say *per 1 USD* — the number changed by ~14× for SAR and the label is the only thing telling the operator why |
| **Exponent** | `minorUnitExponent` | new |
| **Source** | `rateSource` | new — `p-tag`: `fastforex` info, `manual` warn, `seed` secondary |
| **Updated** | `rateUpdatedAt` | new — relative age, `p-tag` severity by staleness |
| Active | `isActive` | unchanged |

**Header actions** (new):

- **Sync now** — `p-button` with `[loading]="syncing"`, following the `gateway-catalog.component.ts:166` pattern. Calls `POST /currencies/sync`, then reloads the table and the status.
- **Sync status strip** — from `GET /currencies/sync/status`: provider name, last success, last failure, staleness, active currency count. Rendered as a `p-tag` with severity by freshness, following `webhook-health.component.ts:41`. Loaded on page init alongside the list.

**Edit dialog** (today: Code, Name, Symbol, Exchange Rate to USD, Active — no validation):

| Control | Change |
|---------|--------|
| Code | unchanged; stays disabled on edit |
| Name, Symbol | unchanged; **now required** |
| **Rate (per 1 USD)** | `rateFromUsd`, `p-inputNumber`, up to 6 fraction digits, `> 0`. Help text: "Units of this currency per 1 USD. USD itself is 1." A manual edit sets `rateSource: 'manual'` server-side |
| **Minor unit exponent** | `p-select` over `0 | 2 | 3`, required. Help text naming KWD/BHD/OMR as 3 and JPY as 0 |
| Active | unchanged |

Create defaults change from `{ isActive: true, exchangeRateToUSD: 1 }` to `{ isActive: true, rateFromUsd: 1, minorUnitExponent: 2 }`.

**The exponent guard.** Changing `minorUnitExponent` on an existing currency reinterprets every amount already stored in it — a KWD product priced at `12500` means 12.500 at exponent 3 and 125.00 at exponent 2. This is the most destructive single edit available anywhere in the platform, and today the screen would let an admin do it with one click and no prompt.

On save, if the exponent differs from the loaded value, a PrimeNG `ConfirmDialog` blocks the request. It follows the high-risk pattern from `security.component.ts:683–709`: warning icon, explicit header, danger-styled accept, and a message naming the currency and both values — "Change KWD from 3 to 2? Every amount already stored in KWD will be reinterpreted." The backend writes a `currency.exponent.updated` audit entry either way; the dialog is what makes the act deliberate.

`ConfirmationService` is already used in `merchant-detail`, `libraries`, `webhooks`, and `security`, so this is house style, not a new dependency.

### Money module

`src/core/money/` — the same four files as the portal (`money.model.ts`, `money.util.ts`, `money.pipe.ts`, `money.spec.ts`), with the same `Money` interface and the same `MoneyPipe`.

**It is duplicated, not shared.** `profile.md` records the stack as a multi-repo folder layout with no npm workspaces, so there is no shared-package mechanism to publish into. Three near-identical copies (checkout, portal, admin) is the honest cost of that architecture. The admin copy needs only `formatMoney` and the pipe — no `toMinor`, because the admin panel writes no money.

That last point is worth stating plainly: **the admin panel is read-only for money.** No product form, no refund button, no settings input. Only `rateFromUsd` and `minorUnitExponent` are written, and neither is money — one is a float rate, the other an integer exponent. So the input-conversion machinery that dominates change-015 has no counterpart here.

### Payments overview

| File | Line | Today | After |
|------|------|-------|-------|
| `admin-payments.service.ts` | 13–14 | `amount: number; currency: string` | `amount: Money`; drop the redundant `currency` |
| `admin-payments.service.ts` | 42 | `getPayment(): Observable<any>` | typed `AdminPaymentDetails` |
| `admin-payments.component.ts` | 45 | `{{ row.amount }} {{ row.currency }}` | `{{ row.amount \| money }}` |
| `admin-payment-detail.component.ts` | 22 | `{{ payment.amount }} {{ payment.currency }}` | `{{ payment.amount \| money }}` |
| `admin-payment-detail.component.ts` | 33 | `payment: any = null` | typed |

The two `any`s are replaced because a typed detail model is what would have turned this migration into a compile error instead of a runtime `[object Object]`.

### Dashboard

`AdminDashboardStats.payments.revenue` (`dashboard.service.ts:8`) becomes `Money`, and — since it is already fetched on every load — a **Revenue stat card is added** to `dashboard.ts` alongside the existing total/completed cards at 52–58. Typing a field the platform admin cannot see would leave the data no more useful than it is today.

No charts exist on the admin dashboard and none are added.

### Legacy unrouted code — deleted

`src/core/pages/` and `src/core/services/` contain a large body of merchant-portal code copied from `payup-frontend-customer-control` and never wired into `app.routes.ts` or `app.menu.ts`: `payments.service.ts`, `products.service.ts`, `customers.service.ts`, `currencies.service.ts` (the merchant one, distinct from `admin-currencies.service.ts`), the products/product-form/product-view pages, the merchant payments page with its refund flow, and `reports.component.ts` with dummy money strings.

None of it is reachable, so none of it breaks. All of it now carries stale money models — `Product.price: number`, `RefundRequest.amount: number`, `Currency.exchangeRateToUSD` — sitting in a repo where those shapes are wrong.

**It is deleted in this change.** The risk of leaving it is that the next person adding an admin product screen copies a decimal price field out of a file that looks authoritative. The cost of deleting it is losing a reference copy, which git retains.

Migrating it instead was never a real option — it would mean maintaining a merchant portal inside the admin app.

### Tests

The repo has one spec — `src/app/app.spec.ts` — and it is stale: line 21 still expects the title `payup-frontend-customer-control`. Fixed in passing.

Added:

**`core/money/money.spec.ts`** — `formatMoney` returns `display` with no locale; renders correct fraction counts for exponents 0, 2, and 3; `MoneyPipe` handles `null` without throwing.

**`core/pages/admin/currencies/currencies.spec.ts`**
- The create payload contains `rateFromUsd` and `minorUnitExponent`, and no `exchangeRateToUSD`
- Saving with an unchanged exponent does **not** open the confirm dialog
- Saving with a changed exponent **does**, and cancelling issues no HTTP request
- The sync button calls the endpoint and reloads both the list and the status
- Staleness severity maps correctly across fresh / aging / stale

### Out of scope

- Refunds from the admin panel — deliberately absent per `actions/admin-panel/pages/admin-panel.md` ("no refund button in V1")
- Admin product management
- Rate history or a rate time series — change-011 decided audit entries only
- Publishing an admin OpenAPI spec — change-013 records this as excluded by existing policy
- Translating the admin UI; menu labels are hardcoded English today and stay that way
- Charts on the admin dashboard

---

## Acceptance Criteria

### Money module

1. `src/core/money/` exports `Money`, `formatMoney`, and a standalone `MoneyPipe`.
2. `formatMoney` returns `Money.display` with no locale, and derives fraction digits from `exponent` when a locale is given — no hardcoded `2`.
3. `MoneyPipe` renders `null` and `undefined` as an em dash rather than throwing.
4. No `toMinor` exists in this repo — the admin panel writes no money, and adding the helper would invite one.

### Currency screen — change-011

5. `exchangeRateToUSD` appears nowhere in `payup-frontend-admin`.
6. `AdminCurrency` carries `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, and `rateSource`.
7. The table shows Rate (per 1 USD), Exponent, Source, and Updated as new columns; the rate header states *per 1 USD*.
8. The edit dialog exposes `rateFromUsd` (up to 6 fraction digits, `> 0`) and `minorUnitExponent` (`p-select` over 0/2/3, required).
9. Create defaults are `{ isActive: true, rateFromUsd: 1, minorUnitExponent: 2 }`.
10. Name, symbol, rate, and exponent are all validated before save — the screen currently validates nothing.
11. `rateSource` renders as a `p-tag` with distinct severities for `fastforex`, `manual`, and `seed`.

### FX operations

12. A **Sync now** button calls `POST /api/admin/v1/currencies/sync` with a per-action loading state.
13. On success the table and the sync status both reload; a failure surfaces a toast and leaves the table untouched.
14. `GET /api/admin/v1/currencies/sync/status` is called on page init and its provider, last success, last failure, staleness, and active-currency count are displayed.
15. A staleness badge changes severity by rate age, using the `webhook-health` `p-tag` pattern.
16. `AdminCurrenciesService` exposes `sync()` and `getSyncStatus()`; both endpoints have at least one caller.

### Exponent guard

17. Saving a currency whose `minorUnitExponent` differs from the loaded value opens a `ConfirmDialog` before any HTTP request.
18. The dialog names the currency, the old value, and the new value, and states that stored amounts will be reinterpreted.
19. It uses the high-risk styling from `security.component.ts:683–709` — warning icon, explicit header, danger accept.
20. Cancelling issues no request and leaves the form open.
21. Saving with an unchanged exponent shows no dialog.

### Money display — change-012

22. `AdminPaymentSession.amount` is `Money`; the redundant `currency` string is gone.
23. `getPayment()` returns a typed model, not `Observable<any>`; `admin-payment-detail.component.ts:33` is typed.
24. The raw bindings at `admin-payments.component.ts:45` and `admin-payment-detail.component.ts:22` render through `MoneyPipe`.
25. `AdminDashboardStats.payments.revenue` is `Money` and is displayed on a Revenue stat card.
26. No admin screen renders `[object Object]`, `NaN`, or `undefined` where an amount belongs.
27. A KWD payment renders three decimals; a JPY payment renders zero.

### Legacy code

28. The unrouted merchant-portal code listed above is deleted in full — services and pages together, no partial removal — and the app still builds and routes correctly.

### Build and tests

29. `npm run build` and `ng build --configuration production` compile with zero TypeScript errors.
30. `money.spec.ts` and `currencies.spec.ts` cover every case listed in the description.
31. `app.spec.ts` no longer expects the title `payup-frontend-customer-control`.
32. `npm test` passes.

### Manual verification

33. Open `/currencies`: rates, exponents, sources, and ages all render; the sync status strip is populated.
34. Press Sync now: the button shows loading, the table refreshes, `rateUpdatedAt` moves forward, and `rateSource` becomes `fastforex`.
35. Edit a currency's rate only — no dialog, saves cleanly.
36. Edit KWD's exponent from 3 to 2 — the dialog appears; cancel, then confirm; verify a `currency.exponent.updated` entry in `/audit-logs`.
37. Open `/payments` and a payment detail: both render formatted amounts.
38. Open `/`: the Revenue card shows a real figure.

---

## Acceptance of the release train

39. With 013–016 all merged, no app in the stack references `exchangeRateToUSD`, and no app sends or reads a decimal money value.

---

## Notes

### This change carries two migrations, not one

Every other downstream change absorbs change-012 alone. The admin panel is the only consumer of change-011's currency model, so it absorbs both. The currency screen work is genuinely new UI — a sync button, a status strip, a staleness badge, an exponent column, and a guarded edit — not a rename.

That makes 016 larger than 015 in *new* surface while being far smaller in *touched* surface: three routed screens versus seven modules.

### Why the exponent guard is not optional

Change-011 introduced `currency.exponent.updated` as an audit action specifically because, quoting its change request, "changing an exponent reinterprets every stored amount in that currency, and leaving it unaudited would open a window where the single highest-risk currency edit in the system leaves no trace."

The audit entry records that it happened. The confirm dialog is what makes it deliberate. Shipping the field without the dialog would put a one-click data-reinterpretation control on a screen that today validates nothing at all.

### Read-only for money

Worth restating because it shapes the whole change: the admin panel displays money and never submits it. `rateFromUsd` is a rate, not money. `minorUnitExponent` is an integer exponent, not money. So criterion 4 forbids `toMinor` outright — if a future admin screen needs to accept an amount, that is a design decision that should be made explicitly, not enabled by a helper sitting unused in the money module.

### Risks

| Risk | Mitigation |
|------|------------|
| An admin misreads `3.7545` as corruption and "corrects" it to `0.27` | Column header and dialog help text both state *per 1 USD*; a manual edit is stamped `rateSource: 'manual'` and is visible in the table |
| A one-click exponent change silently reinterprets stored amounts | Confirm dialog with danger styling (17–21) plus the change-011 audit entry |
| The sync button fires repeatedly and hammers the provider | Per-action loading state (12) disables it in flight; the backend job is idempotent |
| Sync status endpoint is unavailable and blocks the page | Status loads independently of the list; a failure degrades to an unknown badge, never an empty table |
| `[object Object]` on the platform payments screen | Typed models replace both `any`s (23); criterion 26 |
| Three duplicated money modules drift apart across repos | Accepted cost of the multi-repo layout; identical spec in all three change requests, and the admin copy is deliberately the smallest |
| Deleting the legacy unrouted code removes something still wanted | Grep-confirmed unreferenced from `app.routes.ts` and `app.menu.ts`; recoverable from git; criterion 28 requires the build and routes to pass afterwards |
| Admin UI stays English-only | Pre-existing; out of scope |
