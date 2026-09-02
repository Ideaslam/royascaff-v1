# Verification — OpenAPI Specs + Web SDK to Minor Units

**Status: PASS** (automated + static). Live Redoc page render not opened in a browser this session.

Repos: `api-docs`, `payup-web-sdk`

## Plan Consistency
- [x] Endpoints exist in specs — see `verify-plan.md`, all 6 checks PASS
- [x] Services exist in specs
- [x] Data model consistent (`Money`, `Currency` change-011 fields)
- [x] Auth declared (unchanged)
- [x] RULE-022 / RULE-023 honoured
- [x] No planning doc required by this change

## Code Verification
- [x] `Money` schema present in both `payup-public.yml` (line 620) and `payup-merchant.yml` (line 4156). One definition each after restoring a pin-replay duplication.
- [x] Money properties converted. Residual `type: number` values are rates (`exchangeRate`, `rateFromUsd`) or non-money (`weight`, `refundWindow`). No `amount` / `price` / `totalRevenue` remains a bare number.
- [x] `CurrencyConversion` is `{ original, converted, exchangeRate }` in both specs. Flat `originalAmount` / `convertedAmount` gone.
- [x] Change-011 fields present; `grep exchangeRateToUSD api-docs` is empty.
- [x] `DashboardReport`, `ConvertCurrencyResponse`, `CustomerPaymentListItem` added on merchant.
- [x] `pin-request-examples.py` uses minor-unit literals. Re-run with the Money-schema guard: `specs already carry the Money contract; nothing to pin` (exit 0, no write). Unguarded replay is **not** idempotent (insert-style patches duplicate schemas) — the guard is the intended no-diff path.
- [x] `npx redocly lint` exit 0 (warnings only; `struct: warn` in `redocly.yaml` for pre-existing nullable+$ref).
- [x] `package.json` `"build": "npm run validate && docusaurus build"`; `"validate": "redocly lint"`. Duplicate leftover `"build": "docusaurus build"` removed.
- [x] Redoc routes wired in `docusaurus.config.js` (`/api/reference`, `/api/merchant`) to the updated YAML. Live expansion not opened in a browser.
- [x] SDK: `validateAmount`, `validateCurrency`, `VALID_CURRENCIES` deleted from `src/utils.ts`. No money code remains.
- [x] SDK `npm run build` produced `payup-sdk.local.js`, `payup-sdk.dev.js`, `payup-sdk.js`. Version `3.0.1` in `package.json`, `src/config.ts`, `src/index.ts`.
- [x] Layering — N/A
- [x] Frontend isolation — N/A
- [x] Auth guards — N/A
- [x] Documented routes still present in `scripts/route-checklist.md`

## Acceptance Criteria

### Schema
- [x] 1 · `Money` in both specs; `required: [minor, currency, exponent, display]`
- [x] 2 · Request money is `*Minor` integer; response money is `$ref: Money`. 31 `$ref` sites (11 public + 20 merchant).
- [x] 3 · `CurrencyConversion` is `{ original, converted, exchangeRate }`
- [x] 4 · `exchangeRate` is `type: number`, documented as not a Money
- [x] 5 · `ProductInput.required` includes `currency` (matches `createProductSchema`). `ProductUpdateInput.currency` stays optional — matches live `updateProductSchema` (`z.string().optional()`), not a PATCH-required field.

### Examples
- [x] 6 · Path and schema examples use `priceMinor` / `amountMinor` integers
- [x] 7 · `grep -E ':\s*(49\.99|59\.99|10\.00)' openapi/` — no matches
- [x] 8 · `CheckoutSessionDetails` example is KWD `minor: 37500`, `exponent: 3`, `display: "37.500 KWD"`
- [x] 9 · That KWD example is internally consistent (`37500 / 10^3 = 37.500`). Schema-level Money example `3750` / exponent `2` / `"37.50 SAR"` matches.

### Change-011 currency fields
- [x] 10 · `exchangeRateToUSD` nowhere in `api-docs`
- [x] 11 · `CurrencyInput` / `CurrencyUpdateInput` take `rateFromUsd` + `minorUnitExponent`; `Currency` exposes provenance
- [x] 12 · Descriptions state *units per 1 USD* and call out the inversion

### Newly documented responses
- [x] 13 · `DashboardReport` — revenue / chart amounts are Money; counts are integer
- [x] 14 · Convert response typed as Money + float rate. Keys are `original` / `converted` (aligned with `CurrencyConversion` and the live DTO), not the older `originalAmount` names in the change-request draft.
- [x] 15 · `CustomerPaymentListItem.amount` is Money

### Pinning script
- [x] 16 · Script literals use `priceMinor: 4999/5999`, `amountMinor: 10000`, `rateFromUsd: 3.7545`
- [x] 17 · Guarded re-run: exit 0, no file write. This is the supported idempotent path.

### Validation and build
- [x] 18 · `npm run validate` / `npx redocly lint` exit 0
- [x] 19 · `build` runs `validate` first
- [x] 20 · Routes configured. **Deferred:** opening `/api/reference` and `/api/merchant` in a browser to confirm Redoc expands `Money`.

### Web SDK
- [x] 21 · Dead validators deleted
- [x] 22 · `PaymentSessionManager` still posts `{ products, metadata, returnUrl }`. `toJSON()` comment records that the SDK never sends money.
- [x] 23 · Three webpack bundles, no TS errors
- [x] 24 · Version `3.0.1`

### Cross-check against the backend
- [x] 25 · Re-checked against Zod/DTOs in `scripts/route-checklist.md` change-013 section. Request `*Minor` + required create `currency` match `products.controller.ts`.
- [x] 26 · Response `Money` four-field shape matches SVC-M01 / change-012 DTOs.

### Documentation
- [x] 27 · Backend action docs not edited
- [x] 28 · `scripts/route-checklist.md` has a change-013 section

## Result: PASS

**Overall: PASS** — published specs and SDK match the post-012 contract. Remaining item is a live Redoc click-through, not a contract gap.

**Note:** `rateFromUsd` uses OAS 3.0 `minimum: 0` + `exclusiveMinimum: true` (a rate may be `< 1`). Integer money fields use `minimum: 1` (or `0` for settings floors).
