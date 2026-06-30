# Roles & Authorization

## Auth Strategy

| Surface | Mechanism | Storage (FE) | TTL |
|---------|-----------|--------------|-----|
| Merchant portal | JWT Bearer (`Authorization: Bearer`) | `localStorage.token` | 7d local / 1d prod |
| Admin panel | JWT Bearer + `role: admin` | `localStorage.token` | same JWT format as merchant; issued only via admin auth routes |
| Backend SDK | `pk_` + `sk_` → backend SDK JWT | server-side | JWT expiry |
| Frontend SDK | `tk_*` + Origin → frontend SDK JWT | session / memory | JWT expiry |
| Checkout | SDK JWT + pay verification token | query `sdk_token` / localStorage | session-scoped |
| Admin API | JWT + `requireAdmin` on `/api/admin/v1/*` (except public auth routes) | same token storage | — |
| Gateway webhooks | HMAC signature headers | — | — |
| Metrics | Bearer `METRICS_TOKEN` | — | — |

**Framework note:** Express custom middleware — not NestJS guards. Deviates from `engine/conventions.md`.

---

## Roles

| Role | Description | Default |
|------|-------------|---------|
| `user` | Standard merchant — owns apps, products, payments | yes |
| `admin` | Platform admin — full admin panel access, merchant management, platform config | no |

No workspace/tenant roles beyond app ownership (`userId` on resources).

---

## Role → Endpoint Access

### `user` (authenticated merchant)

All `/api/merchant/v1/*` endpoints except those marked admin-only:
- Full CRUD on own Apps, Products, Tokens, Customers, Gateways, Gateway Rules
- Own Gateway Requests (create, submit, view own)
- Notifications, Profile, Transactions, Dashboard
- **Cannot:** admin API, platform audit logs, currency/library admin CRUD, gateway request admin actions, cross-merchant queries

### `admin`

Everything `user` can plus all `/api/admin/v1/*` endpoints.

**Public admin auth routes** (no JWT required):

| Route | Service | Notes |
|-------|---------|-------|
| `POST /auth/login` | `AdminAuthService.login` | Wraps `AuthService.login`; rejects non-admin / inactive |
| `POST /auth/2fa/verify` | `AdminAuthService.verify2fa` | Wraps merchant 2FA verify; rejects non-admin |
| `POST /auth/passkey/login/options` | `AdminAuthService` + `PasskeyService` | Optional V1 — passwordless admin login |
| `POST /auth/passkey/login/verify` | same | Optional V1 |

**Authenticated admin routes** (`authMiddleware` + `requireAdmin`):

| Route | Purpose |
|-------|---------|
| `GET /auth/profile` | Admin profile for topbar / `adminGuard` |
| `POST /auth/refresh` | Token refresh |

**Protected admin modules** (`authMiddleware` + `requireAdmin`):

| Module | Routes (planned) |
|--------|------------------|
| Dashboard | `GET /dashboard` |
| Merchants | `GET /merchants`, `GET /merchants/:id`, `PATCH /merchants/:id/status`, `PATCH /merchants/:id/role` |
| Gateway onboarding | `GET /gateway-requests`, `GET /gateway-requests/:id`, `PATCH /gateway-requests/:id/status`, `POST .../corrections`, `POST .../forward` |
| Audit | `GET /audit-logs` |
| Currencies | `POST /currencies`, `PUT /currencies/:code` (+ public GET stays on merchant/core) |
| Libraries | `POST /libraries`, `PUT /libraries/:id`, `DELETE /libraries/:id` |
| Payments overview | `GET /payments`, `GET /payments/:sessionId` |
| Notifications health | `GET /notifications/deliveries`, `GET /notifications/webhook-endpoints`, `POST /notifications/deliveries/:id/redeliver` |
| Available gateways | `GET /available-gateways`, `POST /available-gateways`, `PUT /available-gateways/:name` |

**Migration note:** Admin-only routes currently on `/api/merchant/v1/*` (audit, currencies POST/PUT, libraries CRUD, gateway request admin actions) move to `/api/admin/v1/*`.

### Public (no auth)

- `/api/health`
- `/api/v1/auth` (with API keys)
- `/api/v1/tokenize` (with client token + Origin)
- `/api/v1/checkout/sessions/currencies`, `/sessions/gateways`
- `/api/v1/payments/callback/:token`
- `/api/merchant/v1/auth/register`, `/login`, password reset, 2FA verify, passkey login, OAuth
- `/api/admin/v1/auth/login`, `/auth/2fa/verify` (admin-only; rejects merchant `user` role)
- Some currency endpoints (GET list, convert)

---

## Role → Page Access

| Role | App | Pages |
|------|-----|-------|
| Unauthenticated | customer-portal | `/auth/login`, `/auth/register`, `/auth/access`, `/auth/error` |
| Unauthenticated | admin-panel | `/auth/login`, `/auth/access`, `/auth/error` |
| Unauthenticated | checkout | checkout flow |
| Authenticated (`user`) | customer-portal | All portal pages under `authGuard` — **no admin routes** |
| Authenticated (`user`) | admin-panel | **Blocked** — `adminGuard` redirects to `/auth/access` |
| `admin` | admin-panel | All admin routes under `authGuard` + `adminGuard` |
| `admin` | customer-portal | May use merchant portal separately via `POST /api/merchant/v1/auth/login` — admin board route **removed** |

---

## Ownership & Scoping Rules

1. **User ownership:** Resources scoped by `userId` — Apps, Products, Gateways, etc. belong to creating merchant.
2. **App scoping:** Merchant portal operations require `appId`; admin panel is **platform-scoped** (cross-merchant).
3. **API key scoping:** Keys tied to `appId` + `environment` (sandbox/live).
4. **Token domain scoping:** `tk_*` tokens require Origin in allowlist + verified domain for tokenize.
5. **SDK scope permissions:** JWT carries scopes (`payment:create_session`, `product:link`, `payment:send_otp`, etc.).
6. **Payment session access:** Checkout session loaded by `sessionToken` + SDK JWT — no merchant login.
7. **Admin login isolation:** Merchants cannot obtain a session via `/api/admin/v1/auth/login` even with valid credentials; admins cannot use merchant login for admin panel (separate routes, same JWT format).
8. **Admin merchant actions:** Suspending a merchant sets `User.isActive = false`; login rejected on admin and merchant routes. Role changes audited.

---

## Special Guards & Middleware

| Middleware | Purpose |
|------------|---------|
| `authMiddleware` | Validates merchant JWT, attaches `userId` |
| `requireAdmin` | Loads User.role, rejects non-admin — **required on protected `/api/admin/v1/*` routes** (not on public `/auth/login`, `/auth/2fa/verify`) |
| `adminGuard` (FE) | Admin panel route guard; requires profile `role === 'admin'` |
| `authGuard` (FE) | Requires valid JWT |
| `verifySdkToken(scopes?)` | Validates frontend/backend SDK JWT + optional scope check |
| `verifyPayToken` | Validates payment verification token for process/confirm |
| `verifyBackendToken` | Backend SDK JWT for server-side session creation |
| Rate limit tiers | MERCHANT_SENSITIVE, MERCHANT_GENERAL, CHECKOUT_STANDARD, CHECKOUT_HIGH_SENSITIVE |

---

## Token Flow Diagram

```
Merchant Portal Login → JWT → /api/merchant/v1/*

Admin Panel Login → POST /api/admin/v1/auth/login → JWT (admin only) → /api/admin/v1/*

Web SDK: tk_* → POST /tokenize → SDK JWT → POST /checkout/web/session → redirect

Backend: pk_+sk_ → POST /v1/auth → backend SDK JWT → POST /checkout/backend/session

Checkout OTP: SDK JWT → verification → pay token → POST /payments/process
```
