## Module: Subscription Packages

### Packages Page
- Route: `/app/packages`
- Components: bilingual/RTL Package catalog table/cards; family/version lineage; **lifecycle stage column** (`Draft` · `Live` · `Archived`) plus a **Next step** hint; tier rank; feature flags; included users; generalized dashboard/upload/update/synced-row/daily-sync limits; quota reset count/unit; linked Plan list; create/edit-draft, new-version, and archive/delete dialogs with reason/idempotency.
- Service: `GET /subscriptions/packages`, `GET /subscriptions/packages/:id`, `POST /subscriptions/packages`, `PUT /subscriptions/packages/:id`, `POST /subscriptions/packages/:id/clone`, `POST /subscriptions/packages/:id/new-version`, `DELETE /subscriptions/packages/:id`.
- Guard: authGuard + adminGuard.
- States: loading, empty, validation/conflict error, editable draft, immutable referenced version, new-version success, archived, linked-Plan detail.
- Notes: a Package is not created per billing/reset period. Multiple Plans may reference it. Published/referenced identity is never edited; a limits/cadence change uses **Create new version**. Reset cadence is independent of Plan billing interval and supports positive `day|month|year` count.

### Action design *(change-077)*
- Every row action is a **text-labelled button**, never icon-only. One primary action per row; the rest live in a single `p-menu` overflow so the intended next step is unambiguous.
- Task-oriented vocabulary replaces lifecycle jargon: **Edit draft** · **Create new version** · **Duplicate** · **Archive** · **Delete draft**.
- A blocked action is rendered **disabled with the reason shown inline** (e.g. "Live packages can't be edited — create a new version instead") rather than hidden or silently failing. The same applies inside the dialog: a disabled Save states the first unmet requirement.
- Create/edit dialogs are grouped into labelled sections — *Identity* · *Tier* · *Limits* · *Quota reset* — each field carrying a plain-language helper line. The free-tier cadence hint states the exact `30 day` requirement.
- **Create new version** clones the Package **and its linked Plans** into one editable draft set and says so in the confirmation dialog: current subscribers stay on their existing version and nothing goes live until the new Plan is published.
- Uniqueness conflicts (`SUBSCRIPTION_PACKAGE_NAME_TAKEN`, `SUBSCRIPTION_PACKAGE_TIER_TAKEN`) are surfaced as localized field-level errors, not toasts.
