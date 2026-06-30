# Services — Merchant & Team

Module: Merchant & Team · Location: `src/services/merchant/`

---

## MerchantService

- Type: domain service
- Location: `src/services/merchant/merchant-service.ts`
- Dependencies: MerchantRepository, MerchantMemberRepository

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `create(input, userId)` | `{ name, slug }` + creator userId | Merchant + MerchantMember(owner) | Validates slug uniqueness; creates member with role:owner |
| `checkSlugAvailability(slug)` | slug string | `{ available: boolean }` | Checks regex + uniqueness |
| `getCurrent(merchantId)` | merchantId | Merchant | — |
| `update(merchantId, input)` | merchantId + profile fields | Merchant | Only owner/admin (enforced by middleware) |
| `completeOnboarding(merchantId)` | merchantId | Merchant | Sets `onboardingCompleted: true` |
| `delete(merchantId)` | merchantId | void | Soft delete; only owner |
| `suspend(merchantId)` | merchantId | Merchant | Admin action: sets status=suspended |
| `activate(merchantId)` | merchantId | Merchant | Admin action: sets status=active |

---

## MerchantMemberService

- Type: domain service
- Location: `src/services/merchant/merchant-member-service.ts`
- Dependencies: MerchantMemberRepository, MerchantRepository

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `getUserMerchants(userId)` | userId | MerchantMember[] (populated with Merchant) | For switcher — all merchants user belongs to |
| `listMembers(merchantId)` | merchantId | MerchantMember[] (populated with User) | — |
| `addMember(merchantId, userId, role, invitedBy)` | IDs + role | MerchantMember | Called by invite accept |
| `updateRole(memberId, newRole, actorRole)` | member ID + new role + actor's role | MerchantMember | Validates: cannot change owner; admin cannot promote to owner |
| `removeMember(memberId, actorId, actorRole)` | member ID + actor context | void | Validates: cannot remove owner; admin cannot remove other admins |
| `leave(userId, merchantId)` | userId + merchantId | void | Owner cannot leave (throws 403) |
| `getMembership(userId, merchantId)` | userId + merchantId | MerchantMember or null | For middleware — validates membership |

---

## MerchantInviteService

- Type: domain service
- Location: `src/services/merchant/merchant-invite-service.ts`
- Dependencies: MerchantInviteRepository, MerchantMemberRepository, MerchantRepository, EmailService

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `create(merchantId, email, role, invitedBy)` | — | MerchantInvite | Validates: not already member; role !== owner; generates token; sends email |
| `listPending(merchantId)` | merchantId | MerchantInvite[] | Filters status=pending, not expired |
| `revoke(inviteId, merchantId)` | — | void | Sets status=revoked |
| `validate(token)` | invite token | `{ valid, merchantName, role, email }` | Public — checks expiry + status |
| `accept(token, userId)` | invite token + newly registered user | `{ merchant, membership }` | Creates MerchantMember; sets invite status=accepted |

---

## AdminUserService

- Type: domain service
- Location: `src/services/admin/admin-user-service.ts`
- Dependencies: AdminUserRepository

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `findByEmail(email)` | email | AdminUser or null | For login |
| `getProfile(adminId)` | adminId | AdminUser (sanitized) | For admin profile endpoint |
| `verifyPassword(adminUser, password)` | — | boolean | bcrypt compare |
| `generateToken(adminId)` | adminId | JWT string | Separate from User JWT; payload: `{ adminId }` |

---

## AdminAuthService (updated)

- Type: domain service
- Location: `src/services/admin/admin-auth-service.ts`
- Dependencies: AdminUserService (replaces direct User lookups)

| Method | Input | Output | Notes |
|--------|-------|--------|-------|
| `login(email, password)` | credentials | JWT or 2FA challenge | Authenticates against AdminUser collection |
| `verify2fa(challengeToken, code, method)` | — | JWT | 2FA for admin |
| `getProfile(adminId)` | adminId | profile DTO | — |
| `refreshToken(adminId)` | adminId | JWT | — |

---

## MerchantContextMiddleware (new middleware, not a service)

- Location: `src/middleware/merchant-context.ts`
- Purpose: Resolves `X-Merchant-Id` header → validates merchant exists + not suspended → validates user membership → attaches `req.merchant = { id, role, status }`
- Dependencies: MerchantMemberService, MerchantRepository

---

## Notes

- All existing services (AppService, ProductService, PaymentService, etc.) change their `userId` parameter to receive `merchantId` from `req.merchant.id` instead of `req.user.id`
- App ownership check changes from `app.userId.toString() !== userId` to `app.merchantId.toString() !== merchantId`
- Service methods that create resources now accept `createdBy` parameter alongside `merchantId`
