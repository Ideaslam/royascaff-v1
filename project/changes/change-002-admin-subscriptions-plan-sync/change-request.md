# Change Request

## Metadata

- **date**: 2026-06-22
- **change-type**: modify-page
- **target-app**: admin-panel
- **affected-repos**: admin
- **priority**: medium

---

## Scope

- Module(s): Admin — Subscriptions & Plans
- Feature(s): Manage Subscription Plans, Manage User Subscriptions
- Endpoint(s): GET /api/v1/subscriptions, POST /api/v1/subscriptions, PUT /api/v1/subscriptions/:id, GET /api/v1/subscriptions/plans/all, POST /api/v1/subscriptions/plans, PUT /api/v1/subscriptions/plans/:id, DELETE /api/v1/subscriptions/plans/:id, POST /api/v1/subscriptions/change, PATCH /api/v1/subscriptions/:userId/cancel
- Page(s): Admin Subscriptions Page (Page 16 in pages.md)
- Service(s): SubscriptionsAdminService

---

## Description

The Admin Subscriptions Page in the Admin Panel is **already fully implemented** in code
(`roya-ai-dynamo-frontend-admin/src/app/pages/admin/subscriptions/subscriptions.page.ts`)
but the planning doc (pages.md Page 16) severely under-describes it. The spec only lists
2 backend endpoints and describes a simple assign-only workflow, while the actual page is a
comprehensive two-tab interface covering:

1. **User Subscriptions tab** — paginated, filterable subscription list with create, edit,
   change-plan, and cancel actions
2. **Plans tab** — full CRUD for subscription plans (create, edit, delete, toggle active)

This change synchronizes pages.md Page 16 with the real implementation so the blueprint
accurately reflects what is built. No code changes are required.

---

## Acceptance Criteria

1. pages.md Page 16 lists all 10 backend endpoints used by the admin subscriptions page.
2. pages.md Page 16 correctly describes the two-tab layout (User Subscriptions + Plans).
3. pages.md Page 16 documents the inline dialogs (Create/Edit Subscription, Change Plan, Plan CRUD).
4. pages.md Page 16 names the correct component (`SubscriptionsPage`, single file) and service (`SubscriptionsAdminService`).
5. No code changes are made — the admin panel is already complete.

---

## Notes

- This change complements change-001 (subscription self-service for the customer portal).
- The plan-code drift in Page 16 was discovered during the recon for this change.
- `features.md` does not need to change — Admin — Subscriptions & Plans features are already
  marked as fully implemented.
