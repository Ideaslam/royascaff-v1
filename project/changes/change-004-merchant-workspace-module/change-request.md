# Change Request

## Metadata
- **date**: 2026-06-30
- **change-type**: new-module
- **target-app**: all-apps
- **affected-repos**: all
- **priority**: high

## Scope
- Module(s): NEW — Merchant & Team (workspace module); modifies Auth, Apps & Multi-Tenancy, Admin Panel, and ALL existing modules (ownership migration)
- Feature(s):
  - Merchant CRUD + onboarding stepper
  - Team membership (MerchantMember)
  - Invite system (MerchantInvite)
  - Merchant context switching (multi-membership)
  - Workspace roles (Owner, Admin, Member, Developer)
  - Platform admin: separate AdminUser collection
  - Admin: merchant suspend/activate
- Endpoint(s): New `/api/merchant/v1/merchants/*`, `/api/merchant/v1/team/*`, `/api/merchant/v1/invites/*`, `/api/admin/v1/merchants/*`
- Page(s)/View(s):
  - customer-portal: onboarding stepper, merchant settings → members page, merchant switcher (sidebar)
  - admin-panel: merchant list + detail (replaces current user-based merchants page)
- Service(s): MerchantService, MerchantMemberService, MerchantInviteService, AdminUserService (new); modified: all services that currently use `userId` for scoping

## Description

### Problem
All entities (Apps, Products, Payments, Gateways, etc.) are owned by a single `userId`. Only one person can manage a merchant account. No way to invite team members, separate business from personal, or delegate responsibilities.

### Desired Behavior

**Merchant Entity** — A workspace/organization representing a business:
- Fields (full profile): name, slug (unique handle, URL-safe, check availability), logo, status, website, description, industry, address, phone, timezone + business fields from current GatewayRequest (customer info section). Onboarding uses only minimal fields (name + slug).
- One merchant can have MANY companies (Company entity moves from `userId` to `merchantId`)
- All current `userId`-scoped entities shift to `merchantId`
- Track `createdBy` (userId) on resources for audit/attribution

**Membership Model**:
- Separate `MerchantMember` collection: `{ userId, merchantId, role, joinedAt, invitedBy }`
- Roles within merchant: `owner`, `admin`, `member`, `developer`
- A user can belong to MULTIPLE merchants and switch between them
- `MerchantInvite` collection: `{ merchantId, email, role, token, expiresAt, invitedBy, status }`
- Invite expiry: 3 days. Email-only: recipient must register a new account through the invite link.

**Role Permissions** (within a merchant):
| Role | Scope |
|------|-------|
| Owner | Full control + manage members + delete merchant (cannot leave) |
| Admin | Manage all modules + invite/remove members (can't delete merchant) |
| Member | Operate modules (apps, payments, products) but can't manage team |
| Developer | API keys, tokens, webhooks, SDK config, domain verification + sandbox payments (no live, no business data) |

**Platform Admin (AdminUser)**:
- Completely separate `AdminUser` collection — isolated from merchant users
- Can suspend/activate any merchant (sets `merchant.status = suspended`)
- When suspended: ALL API access blocked for that merchant's members (they can still log in but see a "suspended" state)

**Context Switching**:
- API: `X-Merchant-Id` request header (middleware resolves + validates membership)
- Frontend: localStorage + sidebar merchant switcher
- If user has no merchant: limited access (profile only, prompted to create/join)

**Onboarding Flow** (full-page stepper after registration):
1. Create Merchant (name + slug — mandatory) — random name suggestion, check availability
2. Branding (logo, colors — optional, can skip)
3. Invite Users (email invites — optional, can skip)
- Each step is a separate component, injectable anywhere in the system
- Easy to add new steps in the future

**Registration Changes**:
- User registers → lands on onboarding stepper → creates merchant → becomes Owner
- Registration no longer auto-creates anything; user must complete at least step 1

### Who is affected
- All existing merchants (fresh start — data reset acceptable)
- All portal features (shift from userId to merchantId)
- Admin panel (AdminUser collection, merchant management)
- SDK/checkout flow (merchantId propagation through tokens)

### Out of Scope
- Owner transfer (V1: owner is permanent)
- Billing/subscription per merchant
- Custom permission builder
- Merchant-to-merchant communication

## Acceptance Criteria

1. New `Merchant` collection exists with slug (unique), name, profile fields, status
2. New `MerchantMember` collection links users to merchants with roles (owner/admin/member/developer)
3. New `MerchantInvite` collection supports email-only invites with 3-day expiry
4. New `AdminUser` collection fully isolates platform admins from merchant users
5. All existing entities (`App`, `Product`, `Payment`, `Gateway`, `Token`, `Customer`, `GatewayRule`, `Company`, etc.) reference `merchantId` instead of `userId`, plus `createdBy` for attribution
6. Middleware validates `X-Merchant-Id` header + checks membership + enforces role
7. Developer role can only access: API keys, tokens, webhooks, SDK config, domain verification, sandbox payments
8. Member role can operate modules but cannot invite/remove team members
9. Owner cannot leave or be removed from merchant
10. Platform admin (AdminUser) can suspend/activate merchants; suspended merchants block all API access for members
11. Customer portal shows onboarding stepper (3 steps) after registration
12. Customer portal has sidebar merchant switcher for multi-membership users
13. Customer portal has Merchant Settings → Members page (invite, remove, change role)
14. Admin panel uses AdminUser for login (separate from merchant auth)
15. Admin panel merchants page shows merchant list + detail with suspend/activate actions
16. User with no merchant sees limited access state (profile only)
17. Slug availability check endpoint exists
18. Each onboarding step is a standalone component, reusable/injectable elsewhere

## Notes
- **Fresh start**: No data migration needed — pre-production data can be reset
- **Breaking change**: Every `userId`-scoped query shifts to `merchantId` — touches virtually all services/endpoints
- **Phased approach recommended**: May split into sub-changes (data model → auth/middleware → frontend)
- Current `Company` entity becomes merchant-owned (one merchant → many companies for gateway KYC)
- Existing `role: admin` field on User removed; platform admins move to AdminUser
