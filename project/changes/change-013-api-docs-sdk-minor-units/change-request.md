# Change Request

## Metadata
- **date**: 2026-08-31
- **change-type**: modify-endpoint
- **target-app**: api-docs, web-sdk
- **affected-repos**: `api-docs`, `payup-web-sdk`
- **priority**: high

## Scope
- Module(s): Payments, Core (Products, Currencies), Apps, Gateways, Reports
- Feature(s): Public + Merchant OpenAPI contract documentation; Web SDK surface
- Endpoint(s): every money-bearing route in `openapi/payup-public.yml` and `openapi/payup-merchant.yml`
- Page(s)/View(s): none — `api-docs` renders specs through Redoc, no hand-written pages change
- Service(s): none (documentation + SDK dead-code removal)
- Depends on: **change-011** (currency field renames) and **change-012** (money minor units) — both implemented
- Blocks: nothing. 014/015/016 read this spec but do not import from it.

---

## Description

### Problem

Change-012 renamed or re-typed every money value in the API. The published OpenAPI specs still describe the old contract, so `api-docs` is now actively wrong: it tells integrators to send `price: 49.99` to an endpoint that rejects decimals with a 400, and it tells them to expect `amount: 37.5` from an endpoint that returns `{ minor: 3750, currency: "SAR", exponent: 2, display: "37.50 SAR" }`.

Recon found the damage is wider than the original estimate:

| Item | Estimated in change-012 | Actual |
|------|------------------------|--------|
| Typed money properties | ~30 | **37** |
| Major-unit `example:` values | ~12 | **12** (confirmed) |
| Money responses with no schema at all | not counted | **3** (`GET /reports/dashboard`, `POST /core/currencies/convert`, `GET /customers/{id}/payments`) |

There is no `Money` schema in either spec, and no automated validation — the specs are hand-authored YAML with no Redocly, Spectral, or swagger-cli step in `package.json` and no CI workflow in the repo. Nothing would have caught the drift.

`scripts/pin-request-examples.py` is a second source of truth. It is a one-shot text mutator that rewrites both YAML files in place, and it hardcodes `price: 49.99`, `price: 59.99`, `amount: 100`, and `exchangeRateToUSD: 1` in thirteen places. If the specs are fixed and the script is not, the next person who runs it silently reverts the migration.

The Web SDK is nearly untouched by all this, and that is worth recording rather than assuming. `PaymentSessionManager` sends only `{ products: [{ storeCode, quantity }], metadata, returnUrl }`. It receives `SessionResult` — `{ sessionId, redirectUrl, status, message? }`. **No money crosses the SDK boundary in either direction.** What it does carry is two dead validators, `validateAmount` and `validateCurrency`, with zero call sites, which imply a money surface that does not exist.

### Desired outcome

The two specs describe the post-012 contract exactly, with a shared `Money` schema, integer `*Minor` request fields, and minor-unit examples. The pinning script matches. The SDK sheds its dead money code and stays money-free by design.

### The `Money` schema

Added to `components.schemas` in **both** specs, sitting alongside `CurrencyConversion` and following the existing PascalCase convention:

```yaml
Money:
  type: object
  description: >
    Canonical money value. `minor` is the authoritative integer amount in the
    currency's smallest unit. `display` is locale-neutral; clients needing a
    localized string must format from `minor` and `exponent`.
  required: [minor, currency, exponent, display]
  properties:
    minor:
      type: integer
      format: int64
      description: Amount in minor units (e.g. 3750 = 37.50 SAR)
      example: 3750
    currency:
      type: string
      minLength: 3
      maxLength: 3
      example: SAR
    exponent:
      type: integer
      description: ISO 4217 minor-unit exponent — 3 for KWD/BHD/OMR, 0 for JPY, 2 for most
      example: 2
    display:
      type: string
      description: Locale-neutral rendering, for convenience only
      example: "37.50 SAR"
```

It is duplicated across the two files rather than shared, because the specs have no `$ref`-across-file mechanism today and introducing one would change how Redocusaurus bundles them. Duplication is the smaller cost.

### Request vs response — the asymmetry that must be documented

This trips up every integrator, so it gets an explicit note in both specs:

| Direction | Shape | Example |
|-----------|-------|---------|
| **Request** | bare integer, minor units, key suffixed `Minor` | `"priceMinor": 4999` |
| **Response** | `Money` object | `"price": { "minor": 4999, "currency": "USD", "exponent": 2, "display": "49.99 USD" }` |

Response keys are **not** renamed — `amount` stays `amount`, it just changes type. Request keys **are** renamed, so that a client sending the old decimal under the old key gets a hard 400 rather than a silent 100× error.

### Property-by-property conversion

**`payup-public.yml` — 11 properties**

| Schema | Property | Becomes | Line |
|--------|----------|---------|------|
| `InlineProduct` | `price` | `priceMinor` — `integer`, `exclusiveMinimum: 0` | 690–693 |
| `CreateSessionResponse` | `amount` | `$ref: Money` | 817 |
| `CurrencyConversion` | `originalAmount` / `convertedAmount` | restructured — see below | 836, 838 |
| `CreateSessionProduct` | `price`, `total`, `paidPrice` | `$ref: Money` ×3 | 847, 850, 852 |
| `SessionProduct` | `price`, `paidPrice` | `$ref: Money` ×2 | 861, 865 |
| `CheckoutSessionDetails` | `totalAmount`, `totalTax` | `$ref: Money` ×2 | 876, 877 |

**`payup-merchant.yml` — 26 properties**

| Context | Property | Becomes | Line |
|---------|----------|---------|------|
| refund request (inline) | `amount` | `amountMinor` — `integer` | 1299 |
| session stats response | `totalRevenue` | `$ref: Money` | 1885 |
| `AppPaymentSettings` | `minimumAmount`, `maximumAmount` | `minimumAmountMinor`, `maximumAmountMinor` — `integer` | 4149–4150 |
| `ProductInput` | `price`, `compareAtPrice`, `unitPrice`, `costPerItem`, `variants[].price` | `*Minor` — `integer` ×5 | 4481–4535 |
| `ProductUpdateInput` | same five | `*Minor` — `integer` ×5 | 4553–4603 |
| `Product` (response) | `price`, `compareAtPrice`, `unitPrice`, `costPerItem` | `$ref: Money` ×4 | 4622–4630 |
| `PaymentSessionSummary` | `amount` | `$ref: Money` | 4878 |
| `CurrencyConversion` | `originalAmount` / `convertedAmount` | restructured | 4918, 4920 |
| `PaymentSessionProduct` | `price`, `sessionPrice` (nullable), `paidPrice` | `$ref: Money` ×3 | 4929–4934 |
| `RefundResponse` | `amount` | `$ref: Money` | 5150 |
| `ConvertCurrencyInput` | `amount` | `amountMinor` — `integer` | 5305 |

`ProductInput.currency` becomes **required** — change-012 made it mandatory server-side, because a minor amount without a currency has no exponent and therefore no meaning.

### `CurrencyConversion` restructured

Both specs currently define a flat struct. It becomes two `Money` objects plus an unrounded float rate:

```yaml
CurrencyConversion:
  type: object
  description: FX snapshot taken at session creation. Not required — legacy sessions may omit it.
  properties:
    original:  { $ref: '#/components/schemas/Money' }
    converted: { $ref: '#/components/schemas/Money' }
    exchangeRate:
      type: number
      description: >
        Units of target per unit of source, full precision. A rate is not money —
        it is not rounded and is not a Money object.
      example: 3.7545
```

`originalCurrency` and `convertedCurrency` disappear: the currency now lives inside each `Money`.

### Examples — all twelve

| File | Line | Was | Becomes |
|------|------|-----|---------|
| `payup-merchant.yml` | 1302 | `amount: 10` | `amountMinor: 1000` |
| `payup-merchant.yml` | 1732 | `price: 49.99` | `priceMinor: 4999` |
| `payup-merchant.yml` | 1829 | `price: 59.99` | `priceMinor: 5999` |
| `payup-merchant.yml` | 2626 | `context.amount: 100` | `context.amountMinor: 10000` |
| `payup-merchant.yml` | 3534 | `amount: 100` | `amountMinor: 10000` |
| `payup-merchant.yml` | 4475 | `price: 49.99` | `priceMinor: 4999` |
| `payup-merchant.yml` | 4548 | `price: 59.99` | `priceMinor: 5999` |
| `payup-merchant.yml` | 5289 | `amount: 100` | `amountMinor: 10000` |
| `payup-merchant.yml` | 5301 | `amount: 100` | `amountMinor: 10000` |
| `payup-public.yml` | 224 | `price: 49.99` | `priceMinor: 4999` |
| `payup-public.yml` | 693 | `price: 49.99` | `priceMinor: 4999` |
| `payup-public.yml` | 748 | `price: 49.99` | `priceMinor: 4999` |

The two `exchangeRate: 3.75` examples (public 840, merchant 4922) are **rates, not money** and stay floats — RULE-023, untouched.

At least one example must use a **three-decimal currency**, so the exponent is not silently assumed to be 2 by everyone reading the docs. `CheckoutSessionDetails` gets a KWD case: `{ minor: 37500, currency: "KWD", exponent: 3, display: "37.500 KWD" }`.

### Change-011 currency fields

The currency schemas still carry `exchangeRateToUSD`, which no longer exists in the codebase:

| Schema | Line | Action |
|--------|------|--------|
| `CurrencyInput` | 4939, 4944, 4950 | `exchangeRateToUSD` → `rateFromUsd`; add `minorUnitExponent` (required, `enum: [0,2,3]`) |
| `CurrencyUpdateInput` | 4958, 4963 | same |
| `Currency` (response) | 4972 | `rateFromUsd`, `minorUnitExponent`, `rateUpdatedAt`, `rateProviderUpdatedAt`, `rateSource` (`seed`\|`manual`\|`fastforex`) |
| create/update examples | 3474, 3513 | `rateFromUsd: 3.7545` |

The semantics inverted — `rateFromUsd` is *units per 1 USD*, where `exchangeRateToUSD` was *USD per 1 unit*. The description must say so explicitly, because `SAR` moves from `0.27` to `3.7545` and a reader who assumes a typo will build the wrong client.

### The three undocumented money responses

`GET /reports/dashboard`, `POST /core/currencies/convert`, and `GET /customers/{customerId}/payments` are all `additionalProperties: true` today — the money in their responses is invisible to the spec. Change-015 has to consume exactly these three, from the spec. They get real schemas:

- `DashboardReport` — `statistics.orders.revenue`, `chartData.dailyPayments[].amount`, `chartData.summary.totalAmount`, `chartData.summary.averageDaily` as `Money`; all counts as `integer`
- `ConvertCurrencyResponse` — `originalAmount` / `convertedAmount` as `Money`, `exchangeRate` as unrounded `number`
- `CustomerPaymentListItem` — `amount` as `Money`

### `pin-request-examples.py`

Updated in the same commit as the specs, never after. Thirteen hardcoded values (lines 604, 867, 1000–1011, 1018–1024, 1419, 1431, 1435, 1488–1489, 1501, 1510–1511, 1514) move to minor units and renamed keys, and the `CurrencyInput` / `CurrencyUpdateInput` blocks it injects switch to `rateFromUsd` + `minorUnitExponent`.

A header comment records that money in requests is minor-unit integer, so the next person editing it does not reintroduce a decimal.

### Spec validation

The absence of any validation is what let this drift happen unnoticed. A `validate` script is added to `api-docs/package.json` using Redocly CLI, and `build` depends on it. Netlify runs `npm run build`, so a malformed spec fails the deploy rather than shipping. This is a small addition with a large payoff and it belongs in this change, not a future one.

### Web SDK

- Delete `validateAmount`, `validateCurrency`, and `VALID_CURRENCIES` from `src/utils.ts` (lines 20–28 and the constant they read). All three have zero call sites.
- Add a comment on `PaymentModel.toJSON()` recording that the SDK deliberately carries no money — the server prices the session from `storeCode`, and any future money field is a design change, not an addition.
- No type changes: `SessionResult` has no money fields and gains none.
- Version bump `3.0.0` → `3.0.1` in `package.json` and `src/config.ts` (`Config.VERSION`), since both must stay in step.

The SDK is **not** consumed by `payup-frontend-checkout` — grep found zero references. It is embedded by merchant storefronts. So this is a low-risk cleanup, not a coordinated release.

### Out of scope

- **Admin API spec.** No `payup-admin.yml` exists, and `scripts/route-checklist.md` line 30 records admin as deliberately excluded from published docs. The two new admin endpoints (`POST /api/admin/v1/currencies/sync`, `GET /api/admin/v1/currencies/sync/status`) therefore stay undocumented here. Change-016 builds the UI against the backend action docs. Publishing an admin spec is a standalone decision, not a side effect of a money migration.
- Frontend consumption of these contracts — changes 014, 015, 016
- Localizing `display` — it is defined as locale-neutral by RULE-022
- Rewriting `pin-request-examples.py` into a proper generator — it stays a one-shot mutator, just a correct one

---

## Acceptance Criteria

### Schema

1. A `Money` schema exists in `components.schemas` of both `payup-public.yml` and `payup-merchant.yml`, with `minor` (integer), `currency`, `exponent`, and `display` all required.
2. All **37** money properties are converted: request-side to `*Minor` integers, response-side to `$ref: Money`. No property of type `number` describing an amount survives in either file.
3. `CurrencyConversion` in both specs is `{ original: Money, converted: Money, exchangeRate: number }`; `originalAmount`, `convertedAmount`, `originalCurrency`, and `convertedCurrency` no longer appear.
4. `exchangeRate` remains an unrounded `number` and is **not** a `Money` — with a description saying why.
5. `ProductInput.currency` and `ProductUpdateInput.currency` are listed in `required`.

### Examples

6. All 12 major-unit examples are minor-unit integers under the renamed keys, per the table above.
7. `grep -E ':\s*(49\.99|59\.99|10\.00)' openapi/` returns nothing.
8. At least one response example uses a three-decimal currency with `exponent: 3` and a matching `display`.
9. Every `Money` example is internally consistent: `display` equals `minor` scaled by `exponent`, with the currency code appended.

### Change-011 currency fields

10. `exchangeRateToUSD` appears nowhere in `api-docs` — not in the specs, not in `pin-request-examples.py`.
11. `CurrencyInput` and `CurrencyUpdateInput` accept `rateFromUsd` and `minorUnitExponent`; the `Currency` response also exposes `rateUpdatedAt`, `rateProviderUpdatedAt`, and `rateSource`.
12. `rateFromUsd` is documented as *units per 1 USD* with a `3.7545` SAR example, explicitly noting the inversion from the old field.

### Newly documented responses

13. `GET /reports/dashboard` has a `DashboardReport` schema; every money value is `Money` and every count is `integer`.
14. `POST /core/currencies/convert` has a typed response schema with `Money` amounts.
15. `GET /customers/{customerId}/payments` types `payments[].amount` as `Money`.

### Pinning script

16. `pin-request-examples.py` emits only minor-unit integers and renamed keys; all 13 hardcoded money/rate values are updated.
17. Running the script against the updated specs completes without a `replace_once` failure and produces **no diff** — proving script and specs agree.

### Validation and build

18. `npm run validate` lints both specs with Redocly CLI and exits 0.
19. `npm run build` runs validation first and fails the build on an invalid spec.
20. Redoc renders both specs at `/api/reference` and `/api/merchant` with the `Money` object expanded in request/response samples.

### Web SDK

21. `validateAmount`, `validateCurrency`, and `VALID_CURRENCIES` are deleted; `grep -ri "amount\|price\|currency" payup-web-sdk/src/` returns no money-handling code.
22. The SDK still sends exactly `{ products: [{ storeCode, quantity }], metadata, returnUrl }` — unchanged behaviour.
23. `npm run build` produces all three bundles (`local`, `dev`, `prod`) with no TypeScript errors.
24. `package.json` version and `Config.VERSION` both read `3.0.1`.

### Cross-check against the backend

25. Every documented request field name matches the live Zod schema in `payup-api-typescript`, verified route by route against `project/actions/backend/endpoints/`.
26. Every documented response `Money` matches the DTO the backend actually returns.

### Documentation

27. `project/actions/backend/endpoints/*.md` need **no** edits — change-012 already updated them. This criterion is a check, not a task: if a mismatch is found, the backend action doc is the source of truth and the spec is wrong.
28. `scripts/route-checklist.md` gains a change-013 row recording which routes were re-verified.

---

## Notes

### Position in the release train

```
change-011 ✓ → change-012 ✓ → change-013 → change-014 → change-015 → change-016
currency+FX    money minor     api-docs +   checkout     portal       admin
               units           web SDK      (this→next)
```

013 is the only downstream change with **no runtime risk** — nothing in production imports these specs. That makes it the right one to do first: writing the spec forces every renamed field and every `Money` shape to be stated precisely, and 014/015/016 then implement against a written contract rather than against a reading of the backend source.

### Why 37 and not 30

The original estimate in change-012 counted schema properties visible in a skim. The extra seven are the `variants[].price` entries nested inside `ProductInput` / `ProductUpdateInput`, the nullable `PaymentSessionProduct.sessionPrice`, and the inline (non-`components`) money in the refund request and session-stats response. Nested and inline money is exactly the kind that gets missed, which is why criterion 2 is phrased as a negative assertion — no `number` amount may survive — rather than a count.

### Risks

| Risk | Mitigation |
|------|------------|
| The script silently reverts the specs on its next run | Criterion 17 — the script must produce a zero diff against the finished specs |
| A property is missed and keeps `type: number` | Criterion 2 is a negative grep over both files, not a checklist |
| The rate-vs-money distinction gets lost and `exchangeRate` becomes a `Money` | Criterion 4 makes it an explicit assertion; RULE-023 is cited in the description |
| An integrator reads `rateFromUsd: 3.7545` as a typo for `0.27` | Criterion 12 requires the inversion to be spelled out in the field description |
| Documented shape diverges from the live API again | Criteria 25–26 cross-check against backend action docs; criterion 19 makes validation part of the build |
| Admin sync endpoints stay invisible to operators | Accepted — admin API is out of published-docs scope by existing policy; change-016 documents the UI in `actions/admin-panel/` |
