# Verification — Fix API-docs request/response contracts

## Plan Consistency (pre-build)
- [x] Endpoints exist in specs — Public 13 + Merchant 186 in OpenAPI; verify-email / resend added to `endpoints/auth.md`
- [x] Services exist in specs — unchanged (docs only)
- [x] Data model updated — N/A (no model change)
- [x] Routes match — inventory in `endpoint-review.md` vs routers
- [x] Auth declared — existing schemes; register no longer claimed as JWT issuer
- [x] Recon findings reflected — frontend leftovers (`webhookUrl`, `userId`, register AuthResponse, web payload on backend) removed

## Code Verification (post-build)
- [x] Endpoints implemented (method, route, guard) — N/A runtime; OpenAPI operations exist for every in-scope mounted route
- [x] Services implemented — N/A
- [x] Pages/views at correct routes — Redoc generated from YAML (`/api/reference`, `/api/merchant`)
- [x] Layering: controller → service → repo — N/A (no API code)
- [x] No direct external URLs in frontend — N/A
- [x] Auth guards applied — documented as implemented
- [x] Acceptance criteria met — see below
- [x] No regressions — YAML parses; no backend/frontend edits

## Acceptance criteria

1. **Full review written** — `endpoint-review.md` lists every Public + Merchant mounted route with a verdict.
2. **Public schemas match Zod / res.json** — session split, auth vs tokenize bodies, process payload without frontend `type`.
3. **Merchant schemas match Zod / controllers** — Product/Customer/App/Company/Token/Media use `_id` + `merchantId` + `createdBy`.
4. **Request schemas omit server-stamped / frontend-only fields** — no required `merchantId`/`createdBy`/`userId`/`storeCode`; `AppInput.webhookUrl` removed.
5. **Web vs backend session** — web = linked products only; backend = link + inline + optional customer. Backend request sample is an inline `{ name, price, quantity }` product (not the web `storeCode` body). Every Public + Merchant write `requestBody` has an explicit `example` so Redoc cannot invent a frontend/response-shaped sample.
6. **Error envelopes unchanged** — shared Unauthorized / Validation / PaymentError.
7. **No new backend endpoints; admin undocumented.**

YAML parse: `payup-public.yml` 13 ops; `payup-merchant.yml` 186 ops.

## Result: PASS

## Overall: PASS
