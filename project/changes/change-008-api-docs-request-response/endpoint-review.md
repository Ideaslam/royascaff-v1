# Endpoint review — Public + Merchant vs OpenAPI

Source of truth: Zod / controller `res.json` in `payup-api-typescript`.  
Specs: `api-docs/openapi/payup-public.yml`, `payup-merchant.yml`.

Verdicts after this change:

| Verdict | Meaning |
|---------|---------|
| match | Documented I/O matches live code |
| fixed | Was wrong (frontend-shaped or stale); corrected in this change |
| added | Mounted in code, missing from spec; added |
| excluded | Mounted stub or non-public surface; intentionally undocumented |
| remaining | Documented enough to call; some nested/list projections still generic |

---

## Public `/api/v1` — `payup-public.yml` (13 ops)

| Method | Path | Verdict | Notes |
|--------|------|---------|-------|
| POST | /auth | fixed | 200 is `{ success, token, expiresIn, environment }` — not the tokenize body with modules/permissions |
| POST | /tokenize | fixed | 200 includes `scopes` as well as modules/permissions |
| POST | /checkout/web/session | match | Linked products only; no customer |
| POST | /checkout/backend/session | match | Link + inline; optional `{ email, phone }` |
| GET | /checkout/session/{token} | match | Checkout page payload |
| GET | /checkout/sessions/currencies | match | `{ currencies: [{ code, name, symbol }] }` |
| GET | /checkout/sessions/gateways | match | `{ gateways: [...] }` |
| POST | /checkout/verification/request | match | `method`, `identifier`, `metadata?` |
| POST | /checkout/verification/verify | match | + `code` → `verificationToken` |
| GET | /checkout/verification/methods | match | `{ success, methods }` |
| POST | /payments/process | fixed | Dropped frontend-only `methodPayload.type` |
| POST | /payments/confirm | match | `{ sessionToken }` |
| GET | /payments/callback/{sessionToken} | match | `text/html`, not JSON |

### Public excluded

| Method | Path | Verdict |
|--------|------|---------|
| — | /payment-methods | excluded (empty router) |
| — | /checkout/ui | excluded (empty controller) |
| POST | /webhooks/stripe, /paypal, /moyasar, /myfatoorah | excluded (inbound gateway webhooks) |

---

## Merchant `/api/merchant/v1` — `payup-merchant.yml` (186 ops)

### Auth

| Method | Path | Verdict | Notes |
|--------|------|---------|-------|
| POST | /auth/register | fixed | 201 `{ verificationToken, email, message }` — not JWT AuthResponse |
| POST | /auth/verify-email | added | `{ verificationToken, code }` → `{ user, token }` |
| POST | /auth/resend-verification | added | `{ verificationToken }` → new token |
| POST | /auth/login | fixed | oneOf AuthResponse \| 2FA challenge |
| GET | /auth/profile | match | SafeUser (`id`, `companyName`, `photo`) |
| PUT | /auth/profile | fixed | Request field is `company`, not `companyName` |
| POST | /auth/refresh | match | `{ user, token }` |
| GET | /auth/profile/summary | fixed | Typed ProfileSummary |
| POST | /auth/2fa/* (6) | match | setup/enable/disable/verify/backup/status |
| POST/GET/DELETE | /auth/passkey/* (6) | match | WebAuthn + challengeKey |
| POST | /auth/password/* (3) | match | forgot/reset/validate-token |
| GET | /auth/oauth/{provider} | match | 302 |
| GET | /auth/oauth/{provider}/callback | match | 302 |
| GET/PUT/POST | /auth/settings* (8) | match | Groups match Zod |

### Profile + companies

| Method | Path | Verdict | Notes |
|--------|------|---------|-------|
| GET/PUT | /profile | match | Alias of /auth/profile |
| GET/POST/PUT/DELETE | /profile/companies* | fixed | Response `_id`, `merchantId`, `createdBy` — not `id`/`userId` |
| POST/DELETE | /profile/companies/{id}/documents* | match | multipart upload |

### Merchants / team / invites / refund

| Method | Path | Verdict |
|--------|------|---------|
| POST | /merchants | added |
| GET | /merchants/check-slug/{slug} | added |
| GET | /merchants/my | added |
| GET/PUT/DELETE | /merchants/current | added |
| PATCH | /merchants/current/onboarding | added |
| GET | /team/members | added |
| PATCH | /team/members/{memberId}/role | added |
| DELETE | /team/members/{memberId} | added |
| POST | /team/leave | added |
| GET/POST | /invites | added |
| DELETE | /invites/{inviteId} | added |
| GET | /invites/validate/{token} | added |
| POST | /invites/accept/{token} | added |
| POST | /payments/{paymentId}/refund | added |

### Apps, keys, products, customers, tokens

| Method | Path | Verdict | Notes |
|--------|------|---------|-------|
| POST | /apps | fixed | No `webhookUrl`; 201 includes `keyPairs` (secret once) |
| GET | /apps | fixed | App uses `_id`/`merchantId`/`createdBy` |
| GET | /apps/switcher | fixed | `{ _id, name, brandLogo, description }` |
| GET | /apps/list, /lite, /{appId} | match | list/lite pagination |
| PUT/DELETE | /apps/{appId} | match | |
| GET/PUT/POST | /apps/{appId}/settings* (10) | match | |
| GET/POST | /keys/{appId}/keys* | match | rotate shows secret once |
| POST | /products | fixed | Zod fields including publishing/productOrganization/themeTemplate |
| GET | /products/app/{appId}* | fixed | Product owner fields |
| PUT | /products/{productId} | fixed | ProductUpdateInput — no required `appId` |
| DELETE | /products/{productId} | match | `{ success: true }` |
| POST | /customers | fixed | Typed address/marketing; no owner fields on input |
| PUT | /customers/{customerId} | fixed | CustomerUpdateInput — no `appId` |
| GET/DELETE | /customers* | fixed | `_id`/`merchantId`/`createdBy` |
| POST | /tokens | fixed | `{ appId, libraryIds, name?, environment?, domains? }` |
| GET/PUT/DELETE | /tokens* | fixed | Token `_id`/`merchantId`/`createdBy` |
| POST | /tokens/{tokenId}/revoke, /domains | fixed | Returns Token |

### Gateways, rules, requests, reports

| Method | Path | Verdict | Notes |
|--------|------|---------|-------|
| GET | /gateways, /currencies, /lite | match | |
| GET/POST/PUT/DELETE | /gateways/apps/{appId}/gateways* | fixed | AppGateway `_id`/`merchantId`; secrets masked |
| GET/POST | /gateways/requests | remaining | Input fixed (website object). Full request document still `additionalProperties` |
| GET | /gateways/requests/list | added | |
| GET/PUT/POST/PATCH | /gateways/requests/{id}* | remaining | Same |
| GET/POST/PUT/DELETE/PATCH | /gateways/rules* | match | `{ success, data }` envelope as in code |
| POST | /gateways/request-webhooks/{provider} | match | |
| GET | /reports/dashboard, /tokens | match | |

### Notifications, audit, core

| Method | Path | Verdict | Notes |
|--------|------|---------|-------|
| GET | /notifications/event-types, /channels | match | |
| POST | /notifications/webhook-endpoints | fixed | `{ endpoint, secret }` once |
| GET/PUT/DELETE | /notifications/webhook-endpoints* | fixed | `_id`, encrypted secret fields |
| POST/GET/PUT/DELETE | /notifications/rules, templates | fixed | `_id` not `id` |
| GET/POST | /notifications/deliveries* | fixed | `payloadSnapshot`, masked `target` |
| GET/PATCH | /notifications/inbox* | fixed | `merchantId` not `userId` |
| GET | /audit-logs, /me | fixed | `_id`, `actorType` |
| GET/POST/PUT | /core/currencies* | fixed | `exchangeRateToUSD` |
| POST/GET | /core/domain-verification* | match | |
| GET/POST/PUT/DELETE | /core/libraries* | fixed | `_id` |
| POST/GET/DELETE | /core/media* | fixed | `_id`/`merchantId`/`createdBy`; `name` not `fileName` |

---

## Shared schema fixes (merchant)

| Schema | Before (wrong) | After |
|--------|----------------|-------|
| App / Product / Customer / Company | `id` + `userId` | `_id` + `merchantId` + `createdBy` |
| AppInput | `webhookUrl` (portal leftover) | removed |
| ProductInput | flattened / extraProperties bags | Zod nested publishing, inventory, shipping, variants, seo |
| Register | AuthResponse JWT | RegisterResponse OTP |
| Login | AuthResponse only | + LoginChallengeResponse |
| Media | `id`, `fileName` | `_id`, `name` |
| InboxNotification | `userId` | `merchantId` |

---

## Counts

| Surface | Mounted in-scope | Documented | Added this change |
|---------|------------------|------------|-------------------|
| Public JSON | 13 | 13 | 0 |
| Merchant | 186 documented | 186 | 19 routes + 1 list |
| Admin `/api/admin/v1` | out of scope | 0 | — |
| Public stubs / inbound webhooks | excluded | 0 | — |
