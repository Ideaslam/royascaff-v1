# change-082 API contract (responses wrapped in the existing ApiResponse `data`)

Common enrichment on every Package and Plan item below:
`activeSubscriberCount: number`, `pastDueSubscriberCount: number`, `createdBy: { _id: string; name: string | null; email: string | null } | null`.

## GET /subscriptions/packages  (existing, extended)
Query: `page`, `limit`, `familyKey`, `isArchived` (existing) + `search` (name/nameAr/familyKey, case-insensitive), `stage` = `draft|live|archived`, `latestOnly=true` (highest version per familyKey).
Returns `{ items: Package[] (+ linkedPlanCount + enrichment), total, page, limit, stats: { draft, live, archived } }` — stats ignore `stage`/`page` but respect `search`/`latestOnly`.
Sort: `familyKey asc, version desc`.

## GET /subscriptions/packages/:id  (existing, extended)
Returns the package (+ enrichment) + `plans: Plan[]` (each + `activeSubscriberCount`, `pastDueSubscriberCount`) + `lineage: { previous: Package | null, next: Package[] }`. Package counts = sum over its plans.

## GET /subscriptions/plans/catalog  (new)
Query: `search` (displayName/displayNameAr/name/nameAr/familyKey), `stage` = `draft|live|hidden|retiring|retired`, `packageId`, `familyKey`, `planType` (`free|paid`), `latestOnly=true`, `page`, `limit` (default 20, max 100).
Returns `{ items: Plan[] (packageId populated + enrichment), total, page, limit, stats: { draft, live, hidden, retiring, retired } }`. Sort `familyKey asc, version desc`.

## GET /subscriptions/plans/:id  (new)
Returns Plan (packageId populated + enrichment) + `lineage: { previous: Plan | null, next: Plan[] }` (via `replacesPlanId`). 404 `{ code: 'SUBSCRIPTION_PLAN_NOT_FOUND' }` for unknown/invalid id.

## Stage rules (backend filter == UI tag)
- Package: archived ← `isArchived`; live ← `immutableAt` set; else draft.
- Plan: retired ← `retiredAt` set OR `isActive=false`; retiring ← `retireAt` set; live ← `isPublished`; hidden ← `immutableAt` set; else draft.

## Unchanged
`GET /subscriptions/plans/all` (plain array) — still used by the Plans page's Package filter? No: use `GET /subscriptions/packages?limit=100` for the Package filter.
