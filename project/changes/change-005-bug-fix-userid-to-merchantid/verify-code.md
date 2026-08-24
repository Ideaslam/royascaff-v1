# Verification — Leftover userId on merchant-owned documents

## Plan Consistency
- [x] No new endpoints or entities — query/write field alignment only
- [x] Auth/JWT/member/passkey `userId` left unchanged

## Code Verification
- [x] Session create persists `merchantId` + `createdBy`
- [x] Merchant/admin session lists query `merchantId`
- [x] Company, notification, webhook, media, customer, gateway-rule repos query `merchantId`
- [x] Layering unchanged (controller → service → repo)
- [x] Acceptance criteria met (runtime: session saved `merchantId` `6a8c106907d40b6945a01677`, checkout `localhost:5600`)
- [x] No regressions (sandbox pay completed under `NODE_ENV=production`)

## Result: PASS
