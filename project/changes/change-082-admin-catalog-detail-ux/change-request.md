# Change Request

## Metadata
- **date**: 2026-10-21
- **change-type**: modify-feature
- **target-app**: admin-panel
- **affected-repos**: backend+admin
- **priority**: high

## Scope
- Module(s): Subscriptions (catalog: Packages, Plans) · Admin panel shell
- Endpoint(s): **new** `GET /api/v1/subscriptions/plans/:id`, **new** `GET /api/v1/subscriptions/plans/catalog` (paginated, filtered admin list); modified `GET /subscriptions/packages` (search, stage, counts, creator), `GET /subscriptions/packages/:id` (counts, creator). `GET /subscriptions/plans/all` unchanged (still a plain array; used by `admin-pages.service.ts` and dropdowns).
- Page(s)/View(s): admin-panel: Packages (list), **new** Package detail (`/app/packages/:id`), Plans (list), **new** Plan detail (`/app/plans/:id`), app shell (navigation)
- Service(s): SubscriptionCatalogService, SubscriptionRepository, SubscriptionPackageRepository; admin `SubscriptionsAdminService`

## Description
**Problem.** Admins cannot see the full data of a Package or Plan. The API already returns every field, but the admin pages only show a dense table; most fields (descriptions EN/AR, features, 2 of 5 limits, included users, extra-user billing interval, plan limit mirrors, lifecycle dates, version lineage, linked plans) appear only in the edit dialog, which opens **only for drafts**. Live, hidden, retiring, retired and archived items are therefore a dead end. Tables with 9 columns are clipped instead of scrolling, limits are unlabeled ("3 / 10 / 10"), features are shown/edited as raw JSON, there is no search/filter/sort/pagination, and every version of a family is a flat row.

**Desired behaviour (owner decisions 2026-10-21):**
1. **Full detail pages** — clicking a Package or Plan row (or its "View" action) opens `/app/packages/:id` or `/app/plans/:id` with a Back link and sections:
   - *Overview* — name/label and description, EN and AR side by side (AR right-to-left), family key, version, stage, tier/type, default-Free tag.
   - *Entitlements* — all 5 limits with labels (`-1` → "Unlimited", `0` → "Not included"), included users / free users, quota reset interval. For a Plan, read from its Package.
   - *Features* — ✓/✗ grid with readable names (not JSON).
   - *Pricing* (Plan) — price, currency, billing interval, extra-user price and interval.
   - *Linked* — Package page: table of linked Plans (links). Plan page: its Package (link).
   - *Versions* — lineage: previous / next version (links), family.
   - *Subscribers* — active subscriber count (and past-due count).
   - *Lifecycle* — created (by whom), published, made immutable, retire at, retired, archived, last updated.
   - *Actions* — the same lifecycle actions as today (edit draft, publish, unpublish, clone/new version, retire/cancel retirement, default Free, archive), shown only when applicable, with the reason as a tooltip when disabled.
2. **Lean, grouped lists** — Packages: Name (+family), Version, Tier, Plans, Subscribers, Stage, actions. Plans: Customer label, Package (link), Price/interval, Type, Stage (+Default Free), Subscribers, actions. Rows **grouped by family** (latest version first, older versions underneath) with a "Latest versions only" toggle. Search, Stage filter, Package filter (plans), sortable columns, pagination. Tables scroll horizontally instead of clipping. Stats pills (Live / Draft / Retiring / Archived).
3. **Draft editing** stays in the existing dialog; the features JSON textarea becomes a toggle list.
4. **Backend additions:**
   - `GET /subscriptions/plans/:id` (admin) → plan + populated package + lineage `{ previous, next }` + subscriber counts + creator.
   - `activeSubscriberCount` / `pastDueSubscriberCount` on every plan (list + detail) and package (list + detail; summed over its plans).
   - `createdBy: { _id, name, email } | null` on package and plan list + detail.
   - New `GET /subscriptions/plans/catalog` (admin) accepts `search`, `stage` (`draft|live|hidden|retiring|retired`), `packageId`, `familyKey`, `planType`, `latestOnly`, `page`, `limit` and returns the standard paginated shape `{ items, total, page, limit }` plus `stats` (count per stage). `plans/all` stays exactly as today for existing callers. Packages list accepts `search`, `stage` (`draft|live|archived`) and `latestOnly` in addition to existing filters and also returns `stats`.
5. **Admin shell** — navigation grouped under headers (Customers, Billing, Platform, Monitoring); tables across the panel scroll horizontally instead of clipping; RTL fixes (drawer/toast side, collapse chevrons, locale-aware currency/date on the catalog pages); untranslated strings in clients/workspaces/ai-logs translated.

**Who is affected.** Admin users only (role `admin`). No customer-facing change.

**Out of scope.** Redesigning Subscriptions, Payments, Workspaces, Clients pages beyond the shell-level fixes; changing lifecycle rules; editing non-draft items.

## Acceptance Criteria
1. Every Package and Plan row (any stage) opens a detail page showing all fields listed in Description §1; nothing returned by the API for that item is hidden.
2. Limits show labels and "Unlimited"/"Not included"; features show as a ✓/✗ list; EN and AR texts both visible.
3. Package detail lists its linked Plans with links; Plan detail links to its Package; both show previous/next versions with links.
4. Subscriber counts (active, past-due) appear in both lists and both detail pages and match the database.
5. Creator name/email appears on both detail pages (or "—" when unknown/system).
6. `GET /subscriptions/plans/:id` returns 404 for an unknown id and is admin-only; `GET /subscriptions/plans/catalog` filters/paginates; `plans/all` response is unchanged.
7. Lists are grouped by family with a working "Latest versions only" toggle, search, filters, sorting and pagination; wide tables scroll horizontally.
8. Lifecycle actions on the detail pages behave exactly as on today's list (same endpoints/confirmations); inapplicable actions are hidden or disabled with a reason tooltip.
9. Draft edit dialog edits features via toggles; saved payload unchanged in shape.
10. Navigation is grouped; untranslated strings in clients/workspaces/ai-logs are translated; Arabic layout is correct on the new pages.
11. API unit tests and admin build pass.

## Notes
- Package detail endpoint `GET /subscriptions/packages/:id` already exists (returns `plans[]` + `lineage`) but is unused by the admin panel.
- Follow existing global styles in `src/styles.css` (`page-header`, `table-card`, `filters-bar`, `stat-pill`, `empty-state`) and PrimeNG components already used.
