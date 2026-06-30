# Roles & Authorization

## Auth Strategy

| Surface | Mechanism | Storage (FE) | TTL |
|---------|-----------|--------------|-----|
| Customer portal | JWT Bearer (`Authorization: Bearer`) | `localStorage.token` | 7d local / 1d prod |
| Admin panel | JWT Bearer (AdminUser) | `localStorage.token` | same JWT format; issued only via admin auth routes |
| Backend SDK | `pk_` + `sk_` → backend SDK JWT | server-side | JWT expiry |
| Frontend SDK | `tk_*` + Origin → frontend SDK JWT | session / memory | JWT expiry |
| Checkout | SDK JWT + pay verification token | query `sdk_token` / localStorage | session-scoped |
| Admin API | AdminUser JWT + `adminAuthMiddleware` on `/api/admin/v1/*` | same token storage | — |
| Gateway webhooks | HMAC signature headers | — | — |
| Metrics | Bearer `METRICS_TOKEN` | — | — |

**Framework note:** Express custom middleware — not NestJS guards. Deviates from `engine/conventions.md`.

---

## Identity Collections

| Collection | Purpose | Login surface |
|------------|---------|---------------|
| `User` | Personal identity for merchant workspace members | Customer portal |
| `AdminUser` | Platform administrator (isolated) | Admin panel |

These are **completely separate** — an AdminUser cannot log into the customer portal, and a User cannot log into the admin panel.

---

## Workspace Roles (within a Merchant)

| Role | Description | Can manage team | Can delete merchant |
|------|-------------|:---:|:---:|
| `owner` | Full control — creator of the merchant | Yes | Yes |
| `admin` | Manage all modules + invite/remove members | Yes | No |
| `member` | Operate modules (apps, payments, products) | No | No |
| `developer` | SDK integration — keys, tokens, webhooks, sandbox | No | No |

### Role → Module Access

| Module | Owner | Admin | Member | Developer |
|--------|:---:|:---:|:---:|:---:|
| Apps (CRUD) | ✓ | ✓ | ✓ | — |
| Products | ✓ | ✓ | ✓ | — |
| Payments (live) | ✓ | ✓ | ✓ | — |
| Payments (sandbox) | ✓ | ✓ | ✓ | ✓ |
| Gateways config | ✓ | ✓ | ✓ | — |
| Gateway Rules | ✓ | ✓ | ✓ | — |
| Gateway Requests | ✓ | ✓ | ✓ | — |
| Customers | ✓ | ✓ | ✓ | — |
| API Keys | ✓ | ✓ | — | ✓ |
| Tokens (tk_*) | ✓ | ✓ | — | ✓ |
| Webhooks | ✓ | ✓ | — | ✓ |
| Domain Verification | ✓ | ✓ | — | ✓ |
| Notifications | ✓ | ✓ | ✓ | — |
| Team management | ✓ | ✓ | — | — |
| Merchant settings | ✓ | ✓ | — | — |
| Delete merchant | ✓ | — | — | — |

---

## Merchant Context Resolution

### API Level

All `/api/merchant/v1/*` routes (except auth) require merchant context:

1. `authMiddleware` — validates JWT, attaches `req.user = { id: userId }`
2. `merchantContext` middleware — reads `X-Merchant-Id` header, validates:
   - Merchant exists and `status !== 'suspended'`
   - User is a member (`MerchantMember` lookup)
   - Attaches `req.merchant = { id, role, status }` to request
3. Role-specific middleware (optional per route) — e.g. `requireMerchantRole('owner', 'admin')` for team management routes

### Frontend Level

- `MerchantContextService` stores `selectedMerchantId` in `localStorage`
- Sidebar switcher allows changing active merchant
- `ApiService` injects `X-Merchant-Id` header on every request
- On merchant switch: reload app list, reset app context, refresh data

### No-Merchant State

If user has no `MerchantMember` records:
- Can access: profile, account settings
- Cannot access: any business module (apps, products, payments, etc.)
- UI shows: prompt to create or join a merchant

---

## Platform Admin (AdminUser)

| Route | Service | Notes |
|-------|---------|-------|
| `POST /auth/login` | `AdminAuthService.login` | Authenticates against `AdminUser` collection |
| `POST /auth/2fa/verify` | `AdminAuthService.verify2fa` | 2FA for admin accounts |
| `GET /auth/profile` | `AdminAuthService.getProfile` | Protected; returns admin profile |
| `POST /auth/refresh` | `AdminAuthService.refreshToken` | Token refresh |

**Protected admin modules** (`adminAuthMiddleware`):

| Module | Routes |
|--------|--------|
| Dashboard | `GET /dashboard` |
| Merchants | `GET /merchants`, `GET /merchants/:id`, `PATCH /merchants/:id/status` |
| Gateway onboarding | `GET /gateway-requests`, `GET /gateway-requests/:id`, `PATCH /gateway-requests/:id/status`, `POST .../corrections`, `POST .../forward` |
| Audit | `GET /audit-logs` |
| Currencies | `POST /currencies`, `PUT /currencies/:code` |
| Libraries | `POST /libraries`, `PUT /libraries/:id`, `DELETE /libraries/:id` |
| Payments overview | `GET /payments`, `GET /payments/:sessionId` |
| Notifications health | `GET /notifications/deliveries`, `GET /notifications/webhook-endpoints`, `POST /notifications/deliveries/:id/redeliver` |
| Available gateways | `GET /available-gateways`, `POST /available-gateways`, `PUT /available-gateways/:name` |

---

## Ownership & Scoping Rules

1. **Merchant ownership:** All business resources (Apps, Products, Gateways, etc.) scoped by `merchantId` — the merchant workspace owns them.
2. **Creator attribution:** Resources track `createdBy` (userId) for audit trail — does NOT affect access.
3. **App scoping:** Within a merchant, operations on sub-resources require `appId` context via `AppContextService`.
4. **API key scoping:** Keys tied to `appId` + `environment` (sandbox/live); carry `merchantId` for context.
5. **Token domain scoping:** `tk_*` tokens require Origin in allowlist + verified domain for tokenize.
6. **SDK scope permissions:** JWT carries scopes (`payment:create_session`, `product:link`, etc.).
7. **Payment session access:** Checkout session loaded by `sessionToken` + SDK JWT — no merchant login.
8. **Merchant suspension:** Admin sets `Merchant.status = 'suspended'` → ALL API access blocked for members (except login to see suspended state).
9. **Owner protection:** Owner cannot leave or be removed from merchant; must delete merchant instead.
10. **Invite registration:** New users register through invite link → auto-joined to merchant with specified role.
11. **Multi-membership:** A user can be a member of multiple merchants with different roles in each.

---

## Special Guards & Middleware

| Middleware | Purpose |
|------------|---------|
| `authMiddleware` | Validates merchant-user JWT, attaches `req.user = { id }` |
| `merchantContext` | Resolves `X-Merchant-Id` header → validates membership + status → attaches `req.merchant = { id, role, status }` |
| `requireMerchantRole(...roles)` | Checks `req.merchant.role` is in allowed list |
| `adminAuthMiddleware` | Validates AdminUser JWT, attaches `req.admin = { id }` |
| `authGuard` (FE) | Requires valid JWT in localStorage |
| `merchantGuard` (FE) | Requires active merchant context (redirects to onboarding/switcher if none) |
| `onboardingGuard` (FE) | Checks merchant `onboardingCompleted`; redirects to stepper if false |
| `merchantRoleGuard` (FE) | Checks user's role in current merchant for page access |
| `adminGuard` (FE) | Admin panel — requires AdminUser profile |
| `verifySdkToken(scopes?)` | Validates frontend/backend SDK JWT + optional scope check |
| `verifyPayToken` | Validates payment verification token for process/confirm |
| Rate limit tiers | MERCHANT_SENSITIVE, MERCHANT_GENERAL, CHECKOUT_STANDARD, CHECKOUT_HIGH_SENSITIVE |

---

## Token Flow Diagram

```
User Login → JWT { userId } → /api/merchant/v1/* (+ X-Merchant-Id header)

Admin Login → POST /api/admin/v1/auth/login → AdminUser JWT → /api/admin/v1/*

Web SDK: tk_* → POST /tokenize → SDK JWT → POST /checkout/web/session → redirect

Backend: pk_+sk_ → POST /v1/auth → backend SDK JWT → POST /checkout/backend/session

Checkout OTP: SDK JWT → verification → pay token → POST /payments/process
```

---

## Role → Page Access

| Role | App | Pages |
|------|-----|-------|
| Unauthenticated | customer-portal | `/auth/login`, `/auth/register`, `/auth/register?invite=TOKEN`, `/auth/access`, `/auth/error` |
| Unauthenticated | admin-panel | `/auth/login`, `/auth/access`, `/auth/error` |
| Unauthenticated | checkout | checkout flow |
| Authenticated (no merchant) | customer-portal | `/profile`, `/settings`, `/onboarding` — all others blocked |
| Authenticated (any merchant role) | customer-portal | Pages per role matrix above |
| Authenticated (User) | admin-panel | **Blocked** — `adminGuard` redirects to `/auth/access` |
| `AdminUser` | admin-panel | All admin routes |
