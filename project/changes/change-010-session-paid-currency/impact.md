# Impact Analysis — Session Paid Currency (Additive)

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | partial | `payup-api-typescript/src/models/Payment.ts` | Conversion only in `metadata` when currencies differ. No first-class `currencyConversion`. Products have `price`/`currency`/`sessionPrice` but no `paidPrice`/`paidCurrency`. |
| Service(s) | partial | `PaymentSessionService`, `CurrencyService`, `TransactionSessionService`, `AdminPaymentService`, `whitelistPaymentFields` | Conversion is computed and stuffed into `metadata`. Create/get/detail/webhook mappers do not expose a first-class conversion object or paid line fields. |
| Endpoint(s) | complete | public checkout create + GET session; merchant session detail; admin payment detail | Responses exist; missing additive keys only. List routes already omit extra fields — leave them. |
| Docs | complete | `api-docs/openapi/payup-public.yml`, `payup-merchant.yml` | Schemas match today’s responses; no `currencyConversion` / `paidPrice` / `paidCurrency`. |
| Page(s) | complete | checkout + portal + admin read existing `amount`/`totalAmount`/`currency`/`products[].price` | Safe if additive-only. No UI change in this change. |

Feature state: **partial** (conversion logic exists; public contract and persistence are incomplete)

### Confirmed artifacts

| Surface | Implementation | Current behavior | Gap |
|---------|----------------|------------------|-----|
| Convert | `CurrencyService.convertCurrency` | USD→gateway default via `exchangeRateToUSD`; returns original/converted/rate | Reuse as-is |
| Persist | `PaymentSessionService.createPaymentSession` | Sets `amount`/`currency` to converted values; products keep original price/currency; writes `metadata.currencyConversion` **only if** currencies differ | Need first-class `currencyConversion` always (rate `1` when same); product `paidPrice`/`paidCurrency` |
| Create HTTP | `BaseSessionController.buildResponse` | Returns `message`, `sessionId`, `redirectUrl`, `expiresAt`, `status`, `amount`, `currency`, `customer` | Service already has `products` + metadata conversion; controller **drops** them. **Add** `currencyConversion` + `products` (new keys) |
| Checkout GET | `checkout.controller.ts` `GET /session/:token` | `totalAmount`/`currency` = charged; products = original price/currency; conversion only if present in `metadata` | **Add** root `currencyConversion` + product `paidPrice`/`paidCurrency` |
| Merchant detail | `TransactionSessionService.getSessionDetails` → EP-TR04 | Same: charged totals, original product prices | **Add** same keys. Lists (`listSessions` / paginated) unchanged |
| Admin detail | `AdminPaymentService.getPaymentBySessionId` → EP-AD25 | Same as merchant detail | **Add** same keys. Admin list unchanged |
| Webhooks | `whitelistPaymentFields` | `amount`/`currency` + products without paid fields; `metadata` may contain conversion | **Add** first-class `currencyConversion` + product paid fields; do not remove `metadata` |
| Charge path | `payments.process.controller.ts` | Pays `paymentSession.amount` + `paymentSession.currency` | Must stay charged values — no change |
| Checkout UI | `session.service.ts`, order summary, card/Apple Pay | Reads `totalAmount` + `currency` | Additive fields ignored — **do not touch** |
| Portal / admin UI | `payments.service.ts` TypeScript interfaces | Unknown keys ignored | **do not touch** this change |
| OpenAPI | `CreateSessionResponse`, `SessionProduct`, `CheckoutSessionDetails`, `PaymentSessionDetails`, `PaymentSessionProduct` | Matches current responses | Document new keys only; not `required` |

### Plan-vs-code drift
- `data-model.md` Payment `products[]` lists `storeCode, title, price, quantity, productId` — code also has `currency`, `sessionPrice`, `imageUrl`.
- Plan does not mention `metadata.currencyConversion` (already in code).
- `PaymentSessionService.getPaymentSession` exists in code but is not used by checkout GET (checkout reads `PaymentRepository` directly). Extend the used paths; keep `getPaymentSession` in sync if touched.
- Endpoint registry tables do not list response field names (I/O is in OpenAPI). Update notes + OpenAPI.

## Affected Modules
- Payments & Checkout — persist and return original vs paid amounts + rate
- Core Platform (Currency) — reuse `CurrencyService`; no rate-formula change
- Notifications — additive webhook payment fields
- Admin — additive payment detail fields
- api-docs — additive OpenAPI properties

## Plan Docs to Update
- [ ] `project/plan/data-model.md` — Payment: add `currencyConversion`; product snapshot: add `paidPrice`, `paidCurrency`; align existing product snapshot fields with code (`currency`, `sessionPrice`, `imageUrl`)
- [ ] `project/plan/modules.md` — Payments feature 1 (session creation): note first-class original vs paid + rate
- [ ] `project/actions/backend/services/payments.md` — SVC-P01 persist `currencyConversion` + paid line fields; SVC-P07 map them on detail
- [ ] `project/actions/backend/endpoints/public-checkout.md` — EP-PC01/02/03 return notes: additive `currencyConversion`, create `products`, product paid fields
- [ ] `project/actions/backend/endpoints/gateways.md` — EP-TR04 additive fields
- [ ] `project/actions/backend/endpoints/admin.md` — EP-AD25 additive fields
- [ ] `project/actions/backend/services/notifications.md` — webhook whitelist additive fields (if payload is documented there)
- [ ] `project/rules.md` — additive-only session money fields; `amount`/`currency` stay charged
- [ ] `project/description.md` — skip (behavior is a contract clarification, not a new product feature)
- [ ] pages / views — skip (no UI this change)

## Code files

### Modify
| File | Action |
|------|--------|
| `payup-api-typescript/src/models/Payment.ts` | Add optional `currencyConversion` on Payment; add optional `paidPrice`, `paidCurrency` on product snapshot. Keep all existing fields. |
| `payup-api-typescript/src/services/payment/payment-session-service.ts` | Always persist `currencyConversion` (rate `1` when same). Set product `paidPrice`/`paidCurrency`. Keep writing metadata copy for older readers. Extend `PaymentSessionResponse` **additively**. |
| `payup-api-typescript/src/routes/public-api/v1/checkout/session/base-session.controller.ts` | `buildResponse`: keep existing keys; **append** `currencyConversion` and `products` (with paid fields). |
| `payup-api-typescript/src/routes/public-api/v1/checkout/checkout/checkout.controller.ts` | GET session: keep existing JSON; **append** `currencyConversion` and product paid fields. |
| `payup-api-typescript/src/dto/payment-session-details.dto.ts` | Add optional `currencyConversion`. |
| `payup-api-typescript/src/dto/payment-session-list.dto.ts` | Add optional `paidPrice`, `paidCurrency` on product DTO (used by **detail** mapper; list endpoints must not start returning them unless they already embed the same DTO — verify and keep lists unchanged). |
| `payup-api-typescript/src/services/payment/transaction-session-service.ts` | `getSessionDetails` only: add conversion + paid product fields. |
| `payup-api-typescript/src/services/admin/admin-payment-service.ts` | `getPaymentBySessionId` only: same additive fields. |
| `payup-api-typescript/src/services/notifications/utils/payload-builder.ts` | Add `currencyConversion` + product paid fields; do not drop existing keys. |
| `api-docs/openapi/payup-public.yml` | Add properties on `CreateSessionResponse`, `SessionProduct`, `CheckoutSessionDetails`. Not required. |
| `api-docs/openapi/payup-merchant.yml` | Add properties on `PaymentSessionDetails`, `PaymentSessionProduct`. Not required. |

### Create
None.

### Do not touch
- `CurrencyService.convertCurrency` formula
- `payments.process.controller.ts` charge amount/currency
- Merchant/admin session **list** response shapes
- Checkout frontend, portal frontend, admin frontend
- Web/backend session **request** schemas
- Historical Payment documents (no backfill job)

## Ripple map
| Caller / callee | Action |
|-----------------|--------|
| `CurrencyService.convertCurrency` | **Reuse** — no change |
| `BaseSessionController.buildResponse` (web + backend) | **Modify** — additive keys |
| Checkout `GET /session/:token` | **Modify** — additive keys |
| Checkout Angular `SessionDetailsResponse` | **Safe** — ignores unknown keys |
| Portal/admin payments TypeScript | **Safe** — ignores unknown keys |
| `PaymentService.createPayment` / gateways | **Safe** — still charged `amount`/`currency` |
| `whitelistPaymentFields` → webhook `data` | **Modify** — additive keys |
| Notification email templates (`{{amount}} {{currency}}`) | **Safe** — still charged values |
| `metadata.currencyConversion` | **Keep** when conversion exists (backward compatible for anyone already reading metadata) |
| OpenAPI pin-examples script | **Safe** unless it snapshots create/session responses; update only if a pinned example would become wrong |

## Reuse
- Existing `CurrencyService.convertCurrency` result shape (`originalAmount`, `originalCurrency`, `convertedAmount`, `convertedCurrency`, `exchangeRate`)
- Existing product snapshot + session DTOs
- Existing checkout/merchant/admin GET handlers (extend mapping, do not add routes)

## Risk
- Complexity: **M** (several response mappers; must not reshape)
- Cross-module: **Y** (Payments + Notifications webhook + Admin detail + api-docs)
- Migration: **N** (optional new fields; old documents omit them → API returns `currencyConversion: null`)

## Recommendation
- **Complete in place**: session create persistence + `buildResponse`; checkout/merchant/admin detail mappers; webhook whitelist; OpenAPI schemas
- **Modify**: `Payment` schema (optional fields only)
- **Create**: none
- **Ripple (safe / no change)**: checkout UI, portal UI, charge path, list endpoints, FX formula
