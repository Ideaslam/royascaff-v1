# Change Request

## Metadata
- **date**: 2026-08-24
- **change-type**: bug-fix
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): Payments, Core (Company, Media, Customer), Notifications, Gateways, Admin
- Feature(s): Merchant ownership queries/writes still using leftover `userId` after change-004
- Endpoint(s): `POST /api/v1/checkout/web/session` (reproduced), merchant lists (payments, companies, inbox, media, customers), admin payment list
- Page(s)/View(s): none (backend-only)
- Service(s): PaymentSessionService, TransactionSessionService, AdminPaymentService, CompanyRepository, NotificationRepository, WebhookEndpointRepository, MediaRepository, CustomerRepository, GatewayRuleRepository

## Description
After change-004, business documents store ownership on `merchantId` (+ `createdBy`). Several repositories and services still **write or query `userId`**. Mongo ignores the unknown field, so creates fail validation (`merchantId` required) and lists return empty.

**Reproduced:** SDK checkout `POST /api/v1/checkout/web/session` → `Payment validation failed: merchantId: Path merchantId is required.` Session create wrote `userId` instead of `merchantId`.

**Desired behavior:** All merchant-owned reads/writes use `merchantId`. JWT `userId` stays the logged-in **User**. SDK tokens may still put merchant id in the JWT `userId` claim; persist it as `merchantId` on documents.

**Out of scope:** Renaming JWT/auth `userId`, MerchantMember.userId, Passkey, Verification, GatewayRequest status-history actor `userId`.

## Acceptance Criteria
1. Creating a payment session persists `merchantId` (and `createdBy`) and does not throw `merchantId is required`.
2. Merchant payment session list/stats query `Payment.merchantId`, not `userId`.
3. Admin payment list filter/projection uses `merchantId`.
4. Company, Notification, WebhookEndpoint, Media, Customer, GatewayRule repository filters use `merchantId`.
5. No new entity/field; no frontend change required for this fix.
6. Auth-personal `userId` usages listed as keep remain unchanged.

## Notes
Inventory only in this step — **no remaining code fixes until the user confirms**. Session-create write was patched during debug; remaining sites are listed in `impact.md`.
