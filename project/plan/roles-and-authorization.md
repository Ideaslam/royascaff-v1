# Roles & Authorization

## Auth Strategy

| Surface | Mechanism | Storage (FE) | TTL |
|---------|-----------|--------------|-----|
| Merchant portal | JWT Bearer (`Authorization: Bearer`) | `localStorage.token` | 7d local / 1d prod |
| Backend SDK | `pk_` + `sk_` → backend SDK JWT | server-side | JWT expiry |
| Frontend SDK | `tk_*` + Origin → frontend SDK JWT | session / memory | JWT expiry |
| Checkout | SDK JWT + pay verification token | query `sdk_token` / localStorage | session-scoped |
| Admin endpoints | JWT + `requireAdmin` middleware | same as merchant | — |
| Gateway webhooks | HMAC signature headers | — | — |
| Metrics | Bearer `METRICS_TOKEN` | — | — |

**Framework note:** Express custom middleware — not NestJS guards. Deviates from `engine/conventions.md`.

---

## Roles

| Role | Description | Default |
|------|-------------|---------|
| `user` | Standard merchant — owns apps, products, payments | yes |
| `admin` | Platform admin — currency/library CRUD, audit all, gateway request admin actions | no |

No workspace/tenant roles beyond app ownership (`userId` on resources).

---

## Role → Endpoint Access

### `user` (authenticated merchant)

All `/api/merchant/v1/*` endpoints except those marked admin-only:
- Full CRUD on own Apps, Products, Tokens, Customers, Gateways, Gateway Rules
- Own Gateway Requests (create, submit, view)
- Notifications, Profile, Transactions, Dashboard
- **Cannot:** admin audit logs (all), currency/library admin CRUD, gateway request status/corrections/forward

### `admin`

Everything `user` can plus:
- `requireAdmin`: GET `/audit-logs`, POST/PUT `/core/currencies`, CRUD `/core/libraries`
- Gateway requests: PATCH status, POST corrections, POST forward
- EP-GW24–26

### Public (no auth)

- `/api/health`
- `/api/v1/auth` (with API keys)
- `/api/v1/tokenize` (with client token + Origin)
- `/api/v1/checkout/sessions/currencies`, `/sessions/gateways`
- `/api/v1/payments/callback/:token`
- `/api/merchant/v1/auth/register`, `/login`, password reset, 2FA verify, passkey login, OAuth
- Some currency endpoints (GET list, convert)

---

## Role → Page Access

| Role | Pages |
|------|-------|
| Unauthenticated | `/auth/login`, `/auth/register`, `/auth/access`, `/auth/error`, checkout flow |
| Authenticated (`user`) | All portal pages under `authGuard` including `/gateway-requests/admin` |
| `admin` | Same as user — **no frontend AdminGuard**; admin enforcement is API-only |

**Gap:** `/gateway-requests/admin` reachable by any authenticated user in UI; API enforces admin on mutating endpoints.

---

## Ownership & Scoping Rules

1. **User ownership:** Resources scoped by `userId` — Apps, Products, Gateways, etc. belong to creating merchant.
2. **App scoping:** Most operations require `appId`; portal uses `AppContextService.selectedAppId`.
3. **API key scoping:** Keys tied to `appId` + `environment` (sandbox/live).
4. **Token domain scoping:** `tk_*` tokens require Origin in allowlist + verified domain for tokenize.
5. **SDK scope permissions:** JWT carries scopes (`payment:create_session`, `product:link`, `payment:send_otp`, etc.).
6. **Payment session access:** Checkout session loaded by `sessionToken` + SDK JWT — no merchant login.

---

## Special Guards & Middleware

| Middleware | Purpose |
|------------|---------|
| `authMiddleware` | Validates merchant JWT, attaches `userId` |
| `requireAdmin` | Loads User.role, rejects non-admin |
| `verifySdkToken(scopes?)` | Validates frontend/backend SDK JWT + optional scope check |
| `verifyPayToken` | Validates payment verification token for process/confirm |
| `verifyBackendToken` | Backend SDK JWT for server-side session creation |
| Rate limit tiers | MERCHANT_SENSITIVE, MERCHANT_GENERAL, CHECKOUT_STANDARD, CHECKOUT_HIGH_SENSITIVE |

---

## Token Flow Diagram

```
Merchant Portal Login → JWT → /api/merchant/v1/*

Web SDK: tk_* → POST /tokenize → SDK JWT → POST /checkout/web/session → redirect

Backend: pk_+sk_ → POST /v1/auth → backend SDK JWT → POST /checkout/backend/session

Checkout OTP: SDK JWT → verification → pay token → POST /payments/process
```
