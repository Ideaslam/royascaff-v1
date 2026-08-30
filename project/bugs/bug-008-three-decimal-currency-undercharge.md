# Bug #008 — Three-decimal currencies (KWD/BHD/OMR) charged at 1/10th via Stripe and Moyasar

## Status
**DONE**
**Confirmed**: 2026-08-30

## Reported
- **Date**: 2026-08-30
- **Severity**: critical
- **Affected area**: backend / payments — `services/gateway/gateways/stripe-gateway.ts`, `services/gateway/gateways/moyasar-gateway.ts`

## Description

Both the Stripe and Moyasar adapters convert the payment amount to the provider's minor unit with a **hardcoded `× 100`**. That multiplier is only correct for two-decimal currencies.

`constants/currency-constants.ts` declares nine supported currencies, and three of them are **three-decimal** (1000 minor units per major unit): **KWD** (fils), **BHD** (fils), **OMR** (baisa).

For those three currencies the platform sends one tenth of the intended amount, and the customer is charged one tenth of what they agreed to pay. The merchant absorbs the loss. The same factor error runs in reverse on status sync, so the recorded amount also comes back 10× too large relative to what was actually charged.

| Intended | Sent to provider | Actually charged | Error |
|----------|------------------|------------------|-------|
| 1.000 KWD | `100` | 0.100 KWD | 10× undercharge |
| 18.600 KWD | `1860` | 1.860 KWD | 10× undercharge |
| 25.000 BHD | `2500` | 2.500 BHD | 10× undercharge |
| 50.000 OMR | `5000` | 5.000 OMR | 10× undercharge |
| 37.50 SAR | `3750` | 37.50 SAR | correct |

This is a well-known class of failure — WooCommerce's official Stripe gateway shipped the identical bug ([woocommerce-gateway-stripe#2720](https://github.com/woocommerce/woocommerce-gateway-stripe/issues/2720)), where a 18.60 KWD order was charged as 1.860 KWD.

## Expected Behavior

The amount sent to a payment provider must be scaled by that currency's **minor-unit exponent**, not by a constant:

- exponent 2 (USD, EUR, GBP, SAR, AED, QAR) → `× 100`
- exponent 3 (**KWD, BHD, OMR**) → `× 1000`
- exponent 0 (JPY, KRW — not currently supported, but the table should be correct) → `× 1`

Provider-documented behaviour to honour:

| Provider | Rule |
|----------|------|
| Moyasar | Integer minor units. Their docs state explicitly: `1.00 SAR = 100`, **`1.00 KWD = 1000`**. |
| Stripe | Integer minor units. Three-decimal set is `BHD, JOD, KWD, OMR, TND`, and those amounts must additionally be **evenly divisible by 10**. |

## Steps to Reproduce

1. Configure a merchant app with a Moyasar (or Stripe) gateway whose currency is `KWD`.
2. Create a payment session for **1.000 KWD**.
3. Process the payment.
4. Inspect the outbound request body: `amount: 100`.
5. Provider dashboard shows a **0.100 KWD** charge instead of 1.000 KWD.

## Root Cause

A constant `100` is used where a per-currency exponent is required. Five call sites across two adapters.

**Stripe — outbound charge** (currency *is* in scope on `payment.currency`, but unused for scaling):

```39:41:payup-api-typescript/src/services/gateway/gateways/stripe-gateway.ts
                currency: payment.currency.toLowerCase(),
                product_data: { name: payment.description },
                unit_amount: Math.round(payment.amount * 100),
```

**Stripe — outbound refund** (`RefundRequest` carries no currency, but the retrieved `session` does):

```99:101:payup-api-typescript/src/services/gateway/gateways/stripe-gateway.ts
          charge: chargeId,
          amount: refund.amount ? Math.round(refund.amount * 100) : undefined,
          reason: refund.reason as any,
```

**Stripe — inbound status** (`session.currency` is read on the next line, but not used for the division):

```156:157:payup-api-typescript/src/services/gateway/gateways/stripe-gateway.ts
          amount: session.amount_total ? session.amount_total / 100 : 0,
          currency: (session.currency || DEFAULT_CURRENCY.toLowerCase()).toUpperCase(),
```

**Moyasar — outbound charge**:

```181:182:payup-api-typescript/src/services/gateway/gateways/moyasar-gateway.ts
            amount: Math.round((payment.amount || 0) * 100),
            currency: (payment.currency || DEFAULT_CURRENCY).toUpperCase(),
```

**Moyasar — inbound status**:

```273:274:payup-api-typescript/src/services/gateway/gateways/moyasar-gateway.ts
            amount: Number((data?.amount || 0) / 100),
            currency: (data?.currency || DEFAULT_CURRENCY).toUpperCase(),
```

In every one of the five cases the currency code is already available in scope — it is simply not consulted.

**Not affected**: MyFatoorah sends `InvoiceValue` as a decimal major amount (correct for its API), PayPal sends a decimal string, and the test gateway sends no amount. Moyasar's `refundPayment` is unimplemented.

## Fix Applied

Minimal and isolated: a currency exponent table was added to the existing currency constants, and consulted at all five call sites. No schema change, no migration, no endpoint change.

**1. `src/constants/currency-constants.ts`** — ISO 4217 exponent table plus three pure helpers:

```ts
export const CURRENCY_MINOR_UNIT_EXPONENT: Record<string, number> = {
  USD: 2, EUR: 2, GBP: 2, SAR: 2, AED: 2, QAR: 2,
  KWD: 3, BHD: 3, OMR: 3
};
export const DEFAULT_MINOR_UNIT_EXPONENT = 2;

getCurrencyExponent(currency?)  // uppercases, falls back to 2, never throws
toMinorUnits(amount?, currency?)   // 18.6 KWD  → 18600
fromMinorUnits(minor?, currency?)  // 18600 KWD → 18.6
```

`toMinorUnits` shifts the decimal point via string exponent notation (`Number(\`${value}e${exponent}\`)`) rather than multiplying, because binary float drift makes `Math.round(1.005 * 100)` return `100` instead of `101`. It falls back to plain multiplication if the shifted value is not finite.

**2. `src/services/gateway/gateways/stripe-gateway.ts`** — three call sites, plus an exported module-level helper:

```ts
const STRIPE_THREE_DECIMAL_CURRENCIES = new Set(['BHD', 'JOD', 'KWD', 'OMR', 'TND']);

export function toStripeMinorUnits(amount?, currency?): number {
  const minor = toMinorUnits(amount, currency);
  return STRIPE_THREE_DECIMAL_CURRENCIES.has(currency.toUpperCase())
    ? Math.round(minor / 10) * 10   // Stripe requires divisibility by 10
    : minor;
}
```

| Line | Was | Now |
|------|-----|-----|
| `:55` `processPayment` | `Math.round(payment.amount * 100)` | `toStripeMinorUnits(payment.amount, payment.currency)` |
| `:114` `refundPayment` | `Math.round(refund.amount * 100)` | `toStripeMinorUnits(refund.amount, session.currency)` — currency taken from the checkout session already retrieved on the line above |
| `:170` `getPaymentStatus` | `session.amount_total / 100` | `fromMinorUnits(session.amount_total, session.currency)` |

**3. `src/services/gateway/gateways/moyasar-gateway.ts`** — two call sites:

| Line | Was | Now |
|------|-----|-----|
| `:181` `processPayment` | `Math.round((payment.amount \|\| 0) * 100)` | `toMinorUnits(payment.amount, payment.currency \|\| DEFAULT_CURRENCY)` |
| `:275` `getPaymentStatus` | `Number((data?.amount \|\| 0) / 100)` | `fromMinorUnits(data?.amount, providerCurrency)` — currency resolved into `providerCurrency` before the amount, then reused for the `currency` field |

**4. `tests/gateway-amount-scaling.test.ts`** *(new, 34 tests)* — golden-case table pinning the exact scaled integer per currency: `1.000 KWD → 1000`, `18.600 KWD → 18600`, `25.000 BHD → 25000`, `50.000 OMR → 50000`, `37.50 SAR → 3750`, `10.00 USD → 1000`. Also covers the exponent table, case-insensitivity, the unknown-currency fallback, half-up rounding without float drift, integer-output invariance, `fromMinorUnits` round-tripping, and Stripe's divisible-by-10 rule (`5.124 KWD → 5120`).

### Deliberately out of scope

- Adding `minorUnitExponent` to the `Currency` model — that is **change-011**. **Change-012** then supersedes these helpers with the `src/services/money/` module. This hotfix intentionally avoids a schema change so it can ship immediately.
- PayPal's `toFixed(2)`, which truncates precision on three-decimal currencies. PayPal does not support KWD/BHD/OMR, so there is no live loss; corrected properly in change-011.
- The line-item vs total rounding mismatch — a separate defect, also addressed in change-011.

## Verification
- [x] Fix implemented in code — all five call sites now consult the currency exponent
- [x] `npm run type-check` passes (0 errors)
- [x] `tests/gateway-amount-scaling.test.ts` passes (34/34)
- [x] Two-decimal currencies (SAR/USD) scale identically to before — no regression
- [x] No regressions introduced — full suite `npm test` passes (37/37, 2 suites)
- [x] No hardcoded money multiplier remains in `src/services/gateway/` — the only surviving `* 1000` are Unix timestamp conversions
- [x] User confirmed fix resolves the issue

## Related Files
- `payup-api-typescript/src/constants/currency-constants.ts`
- `payup-api-typescript/src/services/gateway/gateways/stripe-gateway.ts`
- `payup-api-typescript/src/services/gateway/gateways/moyasar-gateway.ts`
- `payup-api-typescript/tests/gateway-amount-scaling.test.ts` *(new)*
