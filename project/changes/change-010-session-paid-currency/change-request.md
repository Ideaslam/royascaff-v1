# Change Request

## Metadata
- **date**: 2026-08-26
- **change-type**: modify-feature
- **target-app**: backend-only
- **affected-repos**: backend, api-docs
- **priority**: high

## Scope
- Module(s): Payments & Checkout; Currency Management
- Feature(s): Payment Session Creation; Session Management (Portal); Checkout Page load (session GET)
- Endpoint(s):
  - EP-PC01 `POST /api/v1/checkout/web/session`
  - EP-PC02 `POST /api/v1/checkout/backend/session`
  - EP-PC03 `GET /api/v1/checkout/session/:token`
  - EP-TR04 `GET /api/merchant/v1/transactions/sessions/:sessionId`
  - EP-AD25 `GET /api/admin/v1/payments/:sessionId` (ripple)
- Docs: `api-docs/openapi/payup-public.yml`, `api-docs/openapi/payup-merchant.yml` (additive schema fields only)
- Page(s)/View(s): none in this change (checkout already renders `totalAmount` + `currency`; API fields must stay backward-compatible)
- Service(s): `PaymentSessionService`, `TransactionSessionService`, `AdminPaymentService`, webhook `whitelistPaymentFields`

## Description

**Problem.** A merchant (especially backend session) can send products priced in one currency (for example USD). PayUp converts the session total to the selected gateway default currency (for example SAR) and charges that converted amount. Today:

- `Payment.amount` / `Payment.currency` become the **charged** values (SAR).
- Each product snapshot keeps the **merchant/catalog** price and currency (USD).
- Conversion (`originalAmount`, `originalCurrency`, `convertedAmount`, `convertedCurrency`, `exchangeRate`) is computed, but only stuffed into `metadata.currencyConversion` when currencies differ.
- Create-session, checkout session details, and merchant/admin session (order) details expose `amount`/`currency` as the charged values and products as the original values, **without** a first-class exchange rate or a paired original/paid total. An integrator cannot reliably compare “my price” with “what was actually paid”.

**Compatibility rule (mandatory).** Many apps already integrate with these endpoints. This change is **additive only**:

- Do **not** rename, remove, or change the type/meaning of any existing response field.
- `amount`, `currency`, `totalAmount`, and each product `price` / `currency` keep today’s values and meaning.
- New data is **new keys only**. Existing clients that ignore unknown fields keep working.
- Do **not** replace the response body with a new shape.
- List endpoints (`GET /transactions/sessions`, paginated lists) stay unchanged unless a field is already present there.

**Desired behavior.** Persist and return both sides of the money **by adding fields**:

1. **Merchant / product amounts** — already on products (`price`, `currency`); unchanged.
2. **Paid / charged amounts** — already on the session (`amount` / `totalAmount`, `currency`); unchanged.
3. **Exchange rate + original total** — new `currencyConversion` object.
4. **Paid line items** — new `paidPrice` / `paidCurrency` on each product.

These new fields must appear on **session create**, **session details** (`GET /checkout/session/:token`), and **order/session details** (merchant `GET /transactions/sessions/:sessionId`, plus admin payment detail + webhook payment payload). Integrators compare their price with the final paid price without reading buried metadata.

`api-docs` (Public + Merchant OpenAPI) must be updated in the same change so published docs match the additive fields.

**Who is affected.** Backend and web SDK integrators; merchant portal session detail; admin payment detail; webhook consumers. Checkout page continues to charge and display the gateway amount (`amount`/`totalAmount` + `currency`).

**User story (happy).** Merchant creates a backend session with an inline product `{ name, price: 10, currency: "USD" }`. Gateway default is SAR. Session is stored and returned as: products still USD 10; paid amount is the SAR equivalent; `currencyConversion` includes original USD 10, converted SAR amount, and `exchangeRate`. Later `GET` session/order details return the same pair so the merchant can reconcile.

**User story (edge).** Same currency as gateway default → conversion object is still present with `exchangeRate: 1` and identical original/converted amounts. Conversion failure at create time must not silently charge a mismatched currency without recording that no conversion was applied. Legacy sessions with no stored conversion omit the object (null), or derive it only when `metadata.currencyConversion` already exists.

**Permissions.** Unchanged. Same auth as existing session create / session GET / merchant session detail / admin payment detail / webhooks.

**Data changes.** First-class `currencyConversion` on `Payment` (not only `metadata`). Product snapshots keep original `price`/`currency` and add paid-side fields (`paidPrice`, `paidCurrency`) so line items can be compared too.

**Out of scope.** Live FX provider; changing how `CurrencyService.convertCurrency` computes rates; new public “get order” route; checkout UI redesign; forcing historical backfill of missing conversion; renaming or retyping any existing response field.

## Exact response changes (additive only)

Existing keys below are **unchanged** (name, type, meaning). Only the **Added** keys are new.

Shared new object (nullable on legacy sessions that have no stored conversion):

```json
"currencyConversion": {
  "originalAmount": 10,
  "originalCurrency": "USD",
  "convertedAmount": 37.5,
  "convertedCurrency": "SAR",
  "exchangeRate": 3.75
}
```

Same currency as gateway default → still returned, with `exchangeRate: 1` and equal original/converted amounts.

Shared new product keys (existing `price` / `currency` stay the merchant/catalog values):

| New field | Type | Meaning |
|-----------|------|---------|
| `paidPrice` | number | Unit price in the charged (gateway) currency |
| `paidCurrency` | string | Charged currency (same as session `currency`) |

### 1. `POST /api/v1/checkout/web/session` and `POST /api/v1/checkout/backend/session`

**Unchanged (keep as-is):** `message`, `sessionId`, `redirectUrl`, `expiresAt`, `status`, `amount`, `currency`, `customer`.

`amount` / `currency` remain the **charged** gateway values (today’s behavior).

**Added (new keys only):**

| Field | Type | Notes |
|-------|------|--------|
| `currencyConversion` | object \| null | Original total vs charged total + rate |
| `products` | array | New on create response (not returned today). Each item: existing product shape `storeCode`/`title`/`price`/`currency`/`quantity`/`total`/`imageUrl` **plus** `paidPrice`/`paidCurrency` |

Example after change (existing keys first, new keys last):

```json
{
  "message": "Payment session created successfully",
  "sessionId": "…",
  "redirectUrl": "https://checkout…/checkout/ps-…?sdk_token=…",
  "expiresAt": "2026-08-26T12:00:00.000Z",
  "status": "init",
  "amount": 37.5,
  "currency": "SAR",
  "customer": { "email": "buyer@example.com", "phone": "+15551234567", "verifiedIdentifier": "buyer@example.com", "verifiedChannel": "email", "locked": true },
  "currencyConversion": {
    "originalAmount": 10,
    "originalCurrency": "USD",
    "convertedAmount": 37.5,
    "convertedCurrency": "SAR",
    "exchangeRate": 3.75
  },
  "products": [
    {
      "storeCode": "SKU-1",
      "title": "Premium Plan",
      "price": 10,
      "currency": "USD",
      "quantity": 1,
      "total": 10,
      "imageUrl": null,
      "paidPrice": 37.5,
      "paidCurrency": "SAR"
    }
  ]
}
```

### 2. `GET /api/v1/checkout/session/:token` (session details)

**Unchanged:** every existing field, including `totalAmount`, `currency`, `metadata`, and each product `sku` / `title` / `price` / `currency` / `quantity` / `imageUrl` / `productId`.

**Added:**

| Location | Field |
|----------|--------|
| root | `currencyConversion` |
| each `products[]` item | `paidPrice`, `paidCurrency` |

`totalAmount` / `currency` remain the charged values. Product `price` / `currency` remain the merchant values.

### 3. `GET /api/merchant/v1/transactions/sessions/:sessionId` (order / session details)

**Unchanged:** existing `PaymentSessionDetails` fields (`id`, `sessionId`, `amount`, `currency`, `products[].sku|title|price|currency|quantity|productId|sessionPrice`, status, gateway, urls, timestamps, …).

**Added:**

| Location | Field |
|----------|--------|
| root | `currencyConversion` |
| each `products[]` item | `paidPrice`, `paidCurrency` |

Merchant session **list** responses are not changed.

### 4. Ripple (same additive fields, no reshape)

- Admin `GET /api/admin/v1/payments/:sessionId`: add `currencyConversion` + product `paidPrice` / `paidCurrency`.
- Webhook payment payload (`whitelistPaymentFields`): add `currencyConversion` + product `paidPrice` / `paidCurrency`. Existing webhook keys stay.

### 5. `api-docs` (same change — must update)

Document the **new keys only** in:

- `api-docs/openapi/payup-public.yml` — `CreateSessionResponse`, `SessionProduct`, `CheckoutSessionDetails`
- `api-docs/openapi/payup-merchant.yml` — `PaymentSessionDetails`, `PaymentSessionProduct`

Do not rewrite those schemas from scratch. Do not mark the new fields `required` (legacy sessions / older clients).

## Acceptance Criteria
1. Creating a web or backend payment session whose product currency differs from the selected gateway default stores **both** the original total/currency and the charged total/currency plus the exchange rate on the `Payment` document (first-class `currencyConversion`, not only `metadata`).
2. Each session product snapshot keeps the original `price` + `currency` and also stores the converted `paidPrice` + `paidCurrency` used for the charged total.
3. Create-session responses keep every existing field with the same meaning and **add** `currencyConversion` plus `products` (with original and paid amounts).
4. `GET /api/v1/checkout/session/:token` keeps every existing field and **adds** `currencyConversion` plus per-product `paidPrice` / `paidCurrency`.
5. `GET /api/merchant/v1/transactions/sessions/:sessionId` keeps every existing field and **adds** the same new keys.
6. Admin payment detail and merchant webhook payment payloads **add** the same keys only (no sensitive extra data; no removed keys).
7. When original and gateway currencies match, `currencyConversion` is still returned with `exchangeRate: 1` and equal original/converted amounts.
8. Existing clients that only read `amount` / `currency` / `totalAmount` / product `price` continue to receive today’s values (charged session totals; original product prices).
9. `api-docs` Public + Merchant OpenAPI are updated in-place to document the additive fields; new fields are not required.

## Notes
- Conversion already exists in `PaymentSessionService.createPaymentSession` via `CurrencyService.convertCurrency`; this change promotes that result to a durable, documented contract.
- `amount` / `currency` / `totalAmount` remain the gateway-charged values so checkout and gateway adapters do not change their payment path.
- Assumed “order details” = merchant session detail (`EP-TR04`) plus checkout session GET. No separate Order collection exists (RULE-006: Payment is the session).
- `products` on create-session is a new key (create response does not include products today). That is additive, not a replacement.
