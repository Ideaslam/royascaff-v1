# Endpoints — Merchant & Team

Prefix: **`/api/merchant/v1`** · Mount: `src/routes/merchant-panel/v1/merchant/`

**Auth default:** `authMiddleware` + `merchantContext` unless marked otherwise.

Rate limit: `MERCHANT_GENERAL` on all routes.

---

## Module: Merchants — `/merchants`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-MT01 | POST | / | auth only (no merchant context) | `{ name, slug }` | 201 merchant | `MerchantService.create` | Creates merchant + MerchantMember(owner); used during onboarding |
| EP-MT02 | GET | /check-slug/:slug | auth only | — | 200 `{ available: boolean }` | `MerchantService.checkSlugAvailability` | URL-safe slug validation |
| EP-MT03 | GET | /my | auth only | — | 200 `{ merchants: [] }` | `MerchantMemberService.getUserMerchants` | List all merchants user belongs to (for switcher) |
| EP-MT04 | GET | /current | auth + merchant context | — | 200 merchant detail | `MerchantService.getCurrent` | Returns current merchant profile |
| EP-MT05 | PUT | /current | auth + merchant context + role: owner/admin | body: profile fields | 200 merchant | `MerchantService.update` | Update merchant profile (name, logo, website, etc.) |
| EP-MT06 | PATCH | /current/onboarding | auth + merchant context + role: owner | `{ completed: true }` | 200 merchant | `MerchantService.completeOnboarding` | Mark onboarding as done |
| EP-MT07 | DELETE | /current | auth + merchant context + role: owner | — | 204 | `MerchantService.delete` | Soft delete merchant |

---

## Module: Team — `/team`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-MT10 | GET | /members | auth + merchant context | — | 200 `{ members: [] }` | `MerchantMemberService.listMembers` | All roles can view |
| EP-MT11 | PATCH | /members/:memberId/role | auth + merchant + role: owner/admin | `{ role }` | 200 member | `MerchantMemberService.updateRole` | Cannot change owner; admin cannot promote to owner |
| EP-MT12 | DELETE | /members/:memberId | auth + merchant + role: owner/admin | — | 204 | `MerchantMemberService.removeMember` | Cannot remove owner; admin cannot remove other admins |
| EP-MT13 | POST | /leave | auth + merchant context | — | 204 | `MerchantMemberService.leave` | Owner cannot leave (403) |

---

## Module: Invites — `/invites`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-MT20 | POST | / | auth + merchant + role: owner/admin | `{ email, role }` | 201 invite | `MerchantInviteService.create` | Sends email; rejects if already member; role cannot be owner |
| EP-MT21 | GET | / | auth + merchant + role: owner/admin | — | 200 `{ invites: [] }` | `MerchantInviteService.listPending` | Pending invites for current merchant |
| EP-MT22 | DELETE | /:inviteId | auth + merchant + role: owner/admin | — | 204 | `MerchantInviteService.revoke` | Revoke pending invite |
| EP-MT23 | GET | /validate/:token | **public** | — | 200 `{ valid, merchantName, role, email }` | `MerchantInviteService.validate` | Frontend calls to show invite info on register page |
| EP-MT24 | POST | /accept/:token | auth only (newly registered) | — | 200 `{ merchant, membership }` | `MerchantInviteService.accept` | Creates MerchantMember; marks invite accepted |

---

## Notes

- EP-MT01/02/03 do NOT require `X-Merchant-Id` header (user may have no merchant yet)
- EP-MT23 is public (invite validation for registration page)
- EP-MT24 requires auth but no merchant context (user just registered via invite link)
- All other endpoints require both auth + merchant context
- Role enforcement via `requireMerchantRole()` middleware per route
