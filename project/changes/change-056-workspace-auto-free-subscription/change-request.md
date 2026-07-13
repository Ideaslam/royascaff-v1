# Change Request

## Metadata

- **date**: 2026-07-13
- **change-type**: modify-feature
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

---

## Scope

- Module(s): Workspace, Subscriptions
- Feature(s): Create Workspace, Free Plan Subscribe
- Endpoint(s): none (modify existing `WorkspaceService.createWorkspace` behavior; triggered by `POST /workspaces` and `AuthService.register()`)
- Page(s) / View(s): none
- Service(s): `WorkspaceService`, `SubscriptionsService`, `SubscriptionRepository`

---

## Description

**Problem:** When a new workspace is created (on user registration or via `POST /workspaces`), no subscription is assigned. The workspace has no active plan, so subscription resource locks and usage limits block normal usage until the owner manually subscribes to a free plan.

**Desired behavior:** On every new workspace creation — **signup** (`AuthService.register`) and **create new workspace** (`POST /workspaces`) — automatically assign an **active free plan** (`priceMonthlyUsd = 0`, `isActive = true`). Both paths call `WorkspaceService.createWorkspace()`, where the auto-assign hook lives.

**Who is affected:** All users creating workspaces (registration auto-create and manual `POST /workspaces`).

**Edge cases:**
- If no active free plan exists in the catalog → workspace is still created; subscription assignment is skipped (no error thrown).
- If workspace already has a subscription → N/A on create (new workspace never has one).

**Out of scope:** Frontend changes, new endpoints, admin UI, changing paid-plan flows, retroactive backfill of existing workspaces without subscriptions.

---

## Acceptance Criteria

1. `WorkspaceService.createWorkspace()` calls subscription auto-assignment after workspace + membership + branding + onboarding are created.
2. Auto-assignment finds an active free plan (`priceMonthlyUsd = 0` AND `isActive = true`) and activates it for the new `workspaceId`.
3. The resulting `UserSubscription` has `status = active` with valid `currentPeriodStart` / `currentPeriodEnd` and zeroed monthly counters.
4. Registration flow (`AuthService.register()` → `createWorkspace`) and manual workspace creation (`POST /workspaces`) both receive the auto-assigned free subscription.
5. If no active free plan exists, workspace creation succeeds without a subscription (no 500 error).
6. An audit log entry is written for the auto-assignment (`SUBSCRIPTION_ASSIGN`, `source: free-plan`).

---

## Notes

- Subscriptions are workspace-scoped (`UserSubscription.workspaceId` unique).
- Reuses existing `SubscriptionsService.activateFromPayment()` — no new activation pipeline.
- Planning docs: update `modules.md` Create Workspace feature + `workspace.md` / `subscriptions.md` service specs.
