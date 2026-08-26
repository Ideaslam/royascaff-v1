# Bug #007 — Gateway rules fail to load (missing merchant header)

## Status
**DONE**
**Confirmed**: 2026-08-26

## Reported
- **Date**: 2026-08-26
- **Severity**: high
- **Affected area**: customer portal `/gateway-rules` (`payup-frontend-customer-control`)

## Description
Opening Gateway Selection Rules shows an error toast ("Failed to load rules"). The list request returns **400** because the merchant context header is missing. Create / edit / seed / test on the same page fail the same way.

## Expected Behavior
With an app selected, `/gateway-rules` should load the paginated rule list (or the empty state) the same way Products, Tokens, and Gateways do.

## Steps to Reproduce (if applicable)
1. Sign in to the customer portal (`localhost:4301`)
2. Select an app
3. Open **Gateway Rules**
4. Toast: Failed to load rules; Network: `GET /api/merchant/v1/gateways/rules/list` → 400 `X-Merchant-Id header is missing`

## Root Cause
`GatewayRulesService` is the only feature service that still calls `HttpClient` directly. It sends `Authorization` only.

Every other merchant service goes through `ApiService`, which also sends `X-Merchant-Id` from `localStorage.selectedMerchantId`.

Merchant routes run `merchantContext`, which rejects the request when that header is absent:

```17:19:payup-api-typescript/src/middleware/merchant-context.ts
    if (!merchantId) {
      res.status(400).json({ error: 'Merchant context required', message: 'X-Merchant-Id header is missing' });
```

```60:65:payup-frontend-customer-control/src/core/services/gateway-rules.service.ts
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
```

Related leftover (not the load failure): `createSeedRules` never sets `createdBy`, which the schema requires. After the header is fixed, **Load Seed Rules** would still 500.

## Fix Applied
1. Routed customer-portal `GatewayRulesService` through `ApiService` so list/create/update/delete/toggle/seed/test send `X-Merchant-Id`.
2. Seed inserts now stamp `createdBy` from `req.user!.id`. CLI seed script passes the same id for both merchant and actor.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (portal rebuild succeeded; API restarted)
- [x] User confirmed fix resolves the issue

## Related Files
- `payup-frontend-customer-control/src/core/services/gateway-rules.service.ts`
- `payup-api-typescript/src/services/gateway/gateway-rule-service.ts`
- `payup-api-typescript/src/routes/merchant-panel/v1/gateways/gateway-rules.controller.ts`
- `payup-api-typescript/src/scripts/seed-gateway-rules.ts`
