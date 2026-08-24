# Bug #005 — B2B session inline product missing createdBy

## Status
**DONE** — Confirmed: 2026-08-24

## Reported
- **Date**: 2026-08-24
- **Severity**: high
- **Affected area**: payup-api-typescript public checkout session create (backend + shared web handler)

## Description
Backend-to-backend session create with an inline product (`name` + `price` + `quantity`) failed because the Product document requires `createdBy`, but the session handler never stamped it. Callers may assume they must send `createdBy` on the OpenAPI payload. That field must stay off the public body.

## Expected Behavior
- `POST /backend/session` body stays `{ products, customer?, metadata?, returnUrl?, cancelUrl?, gateway? }`.
- Inline products do **not** accept or require `createdBy` / `merchantId`.
- The API stamps both from the App and passes them into `findOrCreateAdHocProduct`.
- Linking an existing product by `storeCode` is unchanged.

## Steps to Reproduce (if applicable)
1. Exchange `pk_` / `sk_` for a backend SDK token via `/api/v1/auth`.
2. `POST /api/v1/checkout/backend/session` with an inline product, e.g. `{ "products": [{ "name": "Test", "price": 10, "quantity": 1 }] }`.
3. Before the fix: Product persist failed with Mongoose `Path 'createdBy' is required`.

## Root Cause
Change-004 made `Product.createdBy` required. Change-005 stamped `createdBy` from `App` when creating the **Payment** session, but the **inline product** path was missed.

`BaseSessionController.resolveProducts` called `findOrCreateAdHocProduct(input, appId, authData.userId)` with only three arguments. The service accepted optional `createdBy` and wrote `undefined`.

`createSessionSchema` / OpenAPI `InlineProduct` never included `createdBy`. Extra keys on the payload are stripped by Zod.

### Frontend / web session
`POST /checkout/web/session` uses the same `BaseSessionController.handle` / `resolveProducts`. The same missing `createdBy` would fire if an inline product reached resolution.

It does **not** fail for current web clients:
- `WebSessionController` rejects inline products (403).
- `payup-web-sdk` only sends `{ storeCode, quantity }` — no `createdBy`.

### Merchant portal product create
`POST /api/merchant/v1/products` already stamps `req.merchant!.id` + `req.user!.id`. OpenAPI `ProductInput` and the customer-portal form do **not** send `createdBy`. No change needed.

## Fix Applied
- Load `App` before product resolution in `BaseSessionController.handle` (shared by backend and web).
- Pass `app.merchantId` and `app.createdBy` into `resolveProducts` / `findOrCreateAdHocProduct`.
- `findOrCreateAdHocProduct` requires `createdBy` from code (not the request).
- OpenAPI `InlineProduct` remains `name` / `price` / `quantity` only; description notes `merchantId` / `createdBy` are stamped from the App.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `payup-api-typescript/src/routes/public-api/v1/checkout/session/base-session.controller.ts`
- `payup-api-typescript/src/services/core/product-service.ts`
- `payup-api-typescript/src/routes/public-api/v1/checkout/session/web-session.controller.ts` (shares base; no unique change)
- `api-docs/openapi/payup-public.yml`

## Notes
Path B — leftover attribution write from change-004/005. No new entity, endpoint, or migration.
