# Impact Analysis — Merchant Workspace Module

## Code Reconnaissance

### New Entities (Create from scratch)

| Layer | State | Location | Notes |
|-------|:-----:|----------|-------|
| Merchant schema | **none** | — | New collection: name, slug, logo, status, profile fields |
| MerchantMember schema | **none** | — | New collection: userId, merchantId, role, joinedAt, invitedBy |
| MerchantInvite schema | **none** | — | New collection: merchantId, email, role, token, expiresAt, status |
| AdminUser schema | **none** | — | New collection: replaces `User.role === 'admin'` |
| MerchantService | **none** | — | CRUD, slug check, onboarding |
| MerchantMemberService | **none** | — | Membership CRUD, role management |
| MerchantInviteService | **none** | — | Email invite, accept, expire |
| AdminUserService | **none** | — | Replaces AdminAuthService's User-based admin check |
| Merchant middleware | **none** | — | `X-Merchant-Id` header resolution + membership + role enforcement |
| Onboarding stepper (FE) | **none** | — | 3-step stepper component |
| Merchant switcher (FE) | **none** | — | Sidebar switcher (mirrors AppContextService pattern) |
| Members page (FE) | **none** | — | Merchant Settings → Members |
| Invite registration (FE) | **none** | — | `/auth/register?invite=TOKEN` flow |

### Existing Code to Modify

| Layer | State | Location | Impact |
|-------|:-----:|----------|--------|
| User schema | complete | `src/models/User.ts` | Remove `role` field; remove `company` field (moves to Merchant) |
| authMiddleware | complete | `src/middleware/auth.ts` | Keep as-is (still validates JWT → userId). Add merchant context middleware after it. |
| requireAdmin | complete | `src/middleware/require-admin.ts` | Replace: check AdminUser collection instead of User.role |
| Auth service (JWT) | complete | `src/services/auth/auth-service.ts` | JWT stays `{ userId }`. Post-login response adds merchant list. |
| AdminAuthService | complete | `src/services/admin/admin-auth-service.ts` | Rewrite: authenticate against AdminUser, not User |
| App schema | complete | `src/models/App.ts` | `userId` → `merchantId` + add `createdBy` |
| Product schema | complete | `src/models/Product.ts` | `userId` → `merchantId` + add `createdBy` |
| Payment schema | complete | `src/models/Payment.ts` | `userId` → `merchantId` + add `createdBy` |
| Gateway schema | complete | `src/models/Gateway.ts` | `userId` → `merchantId` + add `createdBy` |
| GatewayRule schema | complete | `src/models/GatewayRule.ts` | `userId` → `merchantId` + add `createdBy` |
| Customer schema | complete | `src/models/Customer.ts` | `userId` → `merchantId` + add `createdBy` |
| Token schema | complete | `src/models/Token.ts` | `userId` → `merchantId` + add `createdBy` |
| ApiKey schema | complete | `src/models/ApiKey.ts` | `userId` → `merchantId` + add `createdBy` |
| Media schema | complete | `src/models/Media.ts` | `userId` → `merchantId` + add `createdBy` |
| WebhookEndpoint schema | complete | `src/models/WebhookEndpoint.ts` | `userId` → `merchantId` + add `createdBy` |
| Notification schema | complete | `src/models/Notification.ts` | `userId` → `merchantId` |
| Company schema | complete | `src/models/Company.ts` | `userId` → `merchantId` + add `createdBy` |
| DomainVerification schema | complete | `src/models/DomainVerification.ts` | `userId` → `merchantId` + add `createdBy` |
| EncryptionKey schema | complete | `src/models/EncryptionKey.ts` | `userId` → `merchantId` (optional field) |
| GatewayRequest schema | complete | `src/models/GatewayRequest.ts` | `clientId` → `merchantId` |
| PasskeyCredential schema | complete | `src/models/PasskeyCredential.ts` | **Keep `userId`** — tied to personal auth, not merchant |
| Verification/VerificationOTP | complete | `src/models/Verification.ts` | Keep `userId` (String) — checkout identity, not ownership |
| AuditLog schema | complete | `src/models/AuditLog.ts` | Keep `actorId` — audit actor is a user, not a merchant |
| AppService | complete | `src/services/core/app-service.ts` | Replace all `userId` → use `merchantId` from context |
| ProductService | complete | `src/services/core/product-service.ts` | Replace all `userId` → `merchantId` |
| PaymentService | complete | `src/services/payment/payment-service.ts` | Replace all `userId` → `merchantId` |
| GatewayService | complete | `src/services/gateway/gateway-service.ts` | Replace all `userId` → `merchantId` |
| GatewayRuleService | complete | `src/services/gateway/gateway-rule-service.ts` | Replace all `userId` → `merchantId` |
| CustomerService | complete | `src/services/core/customer-service.ts` | Replace all `userId` → `merchantId` |
| TokenService | complete | `src/services/core/token-service.ts` | Replace all `userId` → `merchantId` |
| ApiKeyService | complete | `src/services/core/api-key-service.ts` | Replace all `userId` → `merchantId` |
| MediaService | complete | `src/services/storage/media-service.ts` | Replace all `userId` → `merchantId` |
| WebhookService | complete | `src/services/notifications/webhook-service.ts` | Replace all `userId` → `merchantId` |
| NotificationService | complete | `src/services/notifications/notification-service.ts` | Replace all `userId` → `merchantId` |
| CompanyService | complete | `src/services/core/company-service.ts` | Replace all `userId` → `merchantId` |
| DomainVerificationService | complete | `src/services/core/domain-verification-service.ts` | Replace all `userId` → `merchantId` |
| GatewayRequestService | complete | `src/services/gateway/gateway-request-service.ts` | `clientId` → `merchantId` |
| AdminMerchantService | complete | `src/services/admin/admin-merchant-service.ts` | Rewrite: operate on Merchant entity, not User |
| AdminPaymentService | complete | `src/services/admin/admin-payment-service.ts` | `merchantId` filter already aliased to `userId` → point to real `merchantId` |
| All merchant controllers | complete | `src/routes/merchant-panel/v1/**/*.controller.ts` | Pass `req.merchant.id` instead of `req.user!.id` |
| Admin routes | complete | `src/routes/company-admin/v1/admin-v1.routes.ts` | Admin auth → AdminUser; merchant management → Merchant entity |
| API key middleware | complete | `src/middleware/api-key.ts` | `req.appContext.userId` → `req.appContext.merchantId` |
| Rate limit middleware | complete | `src/middleware/rate-limit.ts` | `merchantId` key already uses `req.user.id` → use `req.merchant.id` |
| AppContextService (FE) | complete | `customer-portal/src/core/services/app-context.service.ts` | Add MerchantContextService above it |
| ApiService (FE) | complete | `customer-portal/src/core/services/api.service.ts` | Add `X-Merchant-Id` header |
| Sidebar (FE portal) | complete | `customer-portal/src/core/layout/component/app.sidebar.ts` | Add merchant switcher |
| App menu (FE portal) | complete | `customer-portal/src/core/layout/component/app.menu.ts` | Add role-based filtering |
| Auth guard (FE portal) | complete | `customer-portal/src/core/guards/auth.guard.ts` | Add merchant/onboarding guards |
| Register page (FE portal) | complete | `customer-portal/src/core/pages/auth/register.ts` | Redirect to onboarding, support invite token |
| Login page (FE portal) | complete | `customer-portal/src/core/pages/auth/login.ts` | Post-login: load merchants, redirect if needed |
| Routes (FE portal) | complete | `customer-portal/src/app/app.routes.ts` | Add onboarding, members routes + new guards |
| Admin auth service (FE) | complete | `admin/src/core/services/auth.service.ts` | Authenticate against AdminUser |
| Admin guard (FE) | complete | `admin/src/core/guards/admin.guard.ts` | Check AdminUser profile instead of User.role |
| Admin merchants service (FE) | complete | `admin/src/core/services/admin-merchants.service.ts` | Operate on Merchant entity |
| Admin merchants list (FE) | complete | `admin/src/core/pages/admin/merchants-list/` | List Merchant entities, not Users |
| Admin merchant detail (FE) | complete | `admin/src/core/pages/admin/merchant-detail/` | Merchant detail with members, suspend/activate |
| Admin routes (FE) | complete | `admin/src/app/app.routes.ts` | `:userId` → `:merchantId` |

### Entities Unchanged

| Entity | Reason |
|--------|--------|
| PasskeyCredential | Personal auth credential — stays on userId |
| Verification / VerificationOTP | Checkout identity — tied to session, not ownership |
| AuditLog | Actor tracking — `actorId` is a user (person who did something) |
| AvailableGateway | Global platform catalog — no tenant field |
| Currency | Global reference data |
| EventType | Global notification catalog |
| Library | Global SDK packages |
| EncryptionConfig | Global system config |
| Delivery | App-scoped only (`appId`) — inherits from App.merchantId |
| NotificationRule | App-scoped only (`appId`) — inherits from App.merchantId |
| NotificationTemplate | App-scoped (optional) — inherits from App.merchantId |

## Affected Modules

| Module | Changes |
|--------|---------|
| **NEW: Merchant & Team** | New module: Merchant CRUD, MerchantMember, MerchantInvite, onboarding, switcher |
| **Auth** | User schema loses `role`; JWT unchanged; post-login adds merchant context; invite registration flow; AdminUser replaces admin login |
| **Apps & Multi-Tenancy** | App.userId → App.merchantId; AppService scopes by merchantId; AppContextService gets parent MerchantContextService |
| **Products** | Product.userId → Product.merchantId; ProductService scopes by merchantId |
| **Payments & Checkout** | Payment.userId → Payment.merchantId; PaymentService scopes by merchantId; SDK token carries merchantId |
| **Gateways** | Gateway/GatewayRule/GatewayRequest all shift to merchantId |
| **Customers** | Customer.userId → Customer.merchantId |
| **Tokens & SDK** | Token/ApiKey shift to merchantId; SDK JWT needs merchantId for session creation |
| **Notifications** | WebhookEndpoint/Notification shift to merchantId; app-only entities inherit |
| **Core Platform** | Media/DomainVerification/EncryptionKey shift to merchantId; Company.userId → Company.merchantId |
| **Profile & Companies** | Company becomes merchant-owned; user profile remains personal |
| **Admin Panel** | AdminUser collection; merchant management on Merchant entity; admin auth isolated |
| **Infrastructure** | Rate limiting key already uses merchantId alias — point to real value |

## Plan Docs to Update

- [x] `project/plan/modules.md` — Add Merchant & Team module; update all modules for merchantId scoping
- [x] `project/plan/data-model.md` — Add Merchant, MerchantMember, MerchantInvite, AdminUser; update 15+ existing entities
- [x] `project/plan/roles-and-authorization.md` — Add workspace roles; AdminUser; X-Merchant-Id context
- [x] `project/actions/backend/endpoints/` — New merchant/team/invite endpoints; modify all existing to use merchantId
- [x] `project/actions/backend/services/` — New services; modify all existing
- [x] `project/actions/customer-portal/pages/` — Onboarding, members, merchant switcher, invite registration
- [x] `project/actions/admin-panel/pages/` — AdminUser auth, Merchant entity management
- [x] `project/description.md` — Add merchant workspace to product description
- [x] `project/profile.md` — No new repos; update auth model description
- [x] `project/rules.md` — Add merchant ownership rules, role enforcement rules

## Risk Assessment

| Dimension | Level | Notes |
|-----------|-------|-------|
| Complexity | **HIGH** | Touches every service, every model, every controller, both frontends |
| Cross-module | **YES** | ALL modules affected — ownership model is foundational |
| Migration | **NO** | Fresh start — data reset acceptable |
| Breaking changes | **YES** | Every API contract changes (userId → merchantId in responses) |
| Security surface | **HIGH** | New role-based access + merchant isolation must be correct |

## Recommendation

### Phased Implementation (Recommended)

Given the extreme scope, implement in **3 sub-phases** within this change:

**Phase A — Foundation (Backend)**
- **Create**: Merchant, MerchantMember, MerchantInvite, AdminUser schemas
- **Create**: MerchantService, MerchantMemberService, MerchantInviteService, AdminUserService
- **Create**: `merchantContext` middleware (X-Merchant-Id resolution + membership + role)
- **Modify**: authMiddleware chain (add merchant context after JWT validation)
- **Modify**: requireAdmin → check AdminUser
- **Modify**: All 15+ schemas (userId → merchantId + createdBy)
- **Modify**: All services (userId param → merchantId from context)
- **Modify**: All controllers (pass merchantId instead of userId)

**Phase B — Frontend Portal**
- **Create**: MerchantContextService + merchant switcher (sidebar)
- **Create**: Onboarding stepper (3 steps — reusable components)
- **Create**: Members page (Merchant Settings → Members)
- **Create**: Invite registration flow
- **Modify**: ApiService (add X-Merchant-Id header)
- **Modify**: Routes (add guards, onboarding route)
- **Modify**: Auth flow (post-login merchant bootstrap)
- **Modify**: All pages (consume merchant context instead of relying on user-owned apps)

**Phase C — Admin Panel**
- **Create**: AdminUser auth flow (login, profile)
- **Modify**: Admin auth service + guard → AdminUser
- **Modify**: Merchants page → list/detail Merchant entities (not Users)
- **Modify**: Dashboard → aggregate by Merchant entity
