# Verification — Money Minor Units Foundation

## Plan Consistency
- [x] Endpoints exist in specs (EP-PC01–PC03, EP-PP01, EP-PW01–04, EP-TR01–04, EP-CO05, EP-GW17, EP-DB01, EP-PR01–06, EP-AP09–11, EP-PY01, EP-CU07, EP-AD05, EP-AD24–25)
- [x] Services exist in specs (SVC-M01 money module, SVC-P01/P02/P07, SVC-G09 adapters, SVC-PR01, SVC-CR01, SVC-DB01, SVC-AU01, SVC-N08, SVC-AP02, SVC-AD02, SVC-AD09)
- [x] Data model updated (`amountMinor` / `*Minor`, snapshotted `currencyExponent`, `taxAmountMinor`, GatewayRule `amountMinor` / `productPriceMinor`)
- [x] Routes match (request keys renamed; responses wrap `Money`)
- [x] Auth declared (unchanged)
- [x] RULE-022 rewritten to integer minor units; RULE-023 left intact
- [x] Recon findings reflected (inventory.price fallback removed; convert Zod; two exponent artifacts only)

## Code Verification
- [x] Endpoints implemented: checkout/session, process, refund, convert, products, settings, dashboard, admin payments, webhooks
- [x] Services implemented: `src/services/money/` + re-signed `convertCurrency` + convert-once allocation in `PaymentSessionService`
- [x] Pages/views — N/A (backend-only; frontends are change-014/015/016)
- [x] Layering: controller → service → money module / `ICurrencyService` → repository; gateway adapters convert only at their boundary
- [x] Frontend isolation — N/A
- [x] Auth guards unchanged
- [x] `npm run type-check` in `payup-api-typescript` — PASS
- [x] `npm test` — PASS (106 tests: money unit/golden/contract/invariant + currency unit/provider/sync + sdk)
- [x] `npx ts-node src/scripts/verify-money-e2e.ts` — PASS (`1000` USD identical across process/status/outbound; display `10.00 USD`)
- [x] Payment session path does not import or call the FX provider
- [x] `currency-constants.ts` holds only the enum; bug-008 re-exports deleted
- [x] `tests/gateway-amount-scaling.test.ts` deleted (absorbed into golden suite)

## Acceptance Criteria
1. Exponents resolve through `ICurrencyService.getCurrencyExponent`; two artifacts only (DB + `iso-currency-exponents.ts`); DB overrides ISO fallback — PASS (`resolveExponent` test)
2. Single conversion path: `convertCurrency` minor in/out delegates to `money/convert.ts`; inversion guard `10000` USD → `37545` SAR — PASS
3. Mongo money fields are integer `*Minor` — PASS (models + `verify-money-data.ts` scanner)
4. No `* 100` / `.toFixed` / `Math.round` on money outside `src/services/money/` and gateway adapters — PASS (`averageMinor` lives in the money module; remaining `Math.round` hits are percentages/timestamps)
5. `Σ (paidPriceMinor × quantity) === amountMinor` (charged = allocated line sum) — PASS (allocate + 10k invariant)
6. `1.00 KWD` → `1000` to Moyasar and Stripe — PASS
7. `2.500 KWD` → MyFatoorah `"2.500"` — PASS
8. `10.00 USD` → `1000` Stripe/Moyasar and `"10.00"` PayPal — PASS
9. `npm run type-check` zero errors — PASS
10. Response money is `{ minor, currency, exponent, display }` — PASS (`toMoney` / `toApiConversion` / webhook whitelist)
11. Decimal on `*Minor` request fields → 400 naming minor units — PASS (`zMoneyMinor` / `MONEY_MINOR_ERROR`)
12. Old key names (`price`, `amount`) fail required Zod fields — PASS
13. Convert endpoint uses Zod `amountMinor`, no `parseFloat` — PASS
14. Webhook payloads emit `Money`; `Pagination.total` stays a count — PASS
15. `product.created` audit with `Money` — PASS
16. `payment.refund.issued` with refunded + original `Money` — PASS
17. Bare number in audit money metadata fails `assertAuditMoneyMetadata` — PASS
18. Change-011 `currency.rates.synced` / `currency.exponent.updated` untouched — PASS
19. Unit suite `tests/money/money.test.ts` — PASS
20. Golden suite `tests/money/golden-cases.test.ts` (9 currencies × 5 gateways, including AC 6–8) — PASS
21. Contract suite `tests/money/gateway-contract.test.ts` (mocked HTTP, exact outbound body) — PASS
22. Invariant suite `tests/money/invariant.test.ts` (10,000 seeded cases) — PASS
23. `scripts/verify-money-e2e.ts` — PASS
24. `scripts/verify-money-data.ts` present; scans Payment/Product for legacy keys and non-integer minors (operator-run against a live DB)
25. Currency suites still pass after re-sign — PASS
26. `npm test` runs 19–22 + 25 — PASS (106 tests)
27. RULE-022 rewritten; RULE-023 intact — PASS
28. Plan docs updated in place (`data-model.md`, `modules.md`, services, endpoints) — PASS

## Result: PASS

**Overall: PASS**
