## Module: Subscription Packages

### Packages Page
- Route: `/app/packages`
- List *(change-082)*: lean table — Name (EN/AR + family), Version, Tier, Plans, Subscribers, Stage, actions; **grouped by family** (latest version first) with a **Latest versions only** toggle; search, Stage filter, sortable columns (server-side; grouping off while sorted), pagination, stats pills (Live/Draft/Archived); scrolls horizontally instead of clipping; row click → detail page.
- Components: bilingual/RTL Package catalog table/cards; family/version lineage; **lifecycle stage column** (`Draft` · `Live` · `Archived`); tier rank; feature flags; included users; generalized dashboard/upload/update/synced-row/daily-sync limits, each with an **Unlimited** toggle (stores `-1`; `0` blocks the feature; `>0` caps) *(change-080)*; quota reset count/unit; linked Plan list; create/edit-draft, new-version, and archive/delete dialogs with reason/idempotency.
- Service: `GET /subscriptions/packages`, `GET /subscriptions/packages/:id`, `POST /subscriptions/packages`, `PUT /subscriptions/packages/:id`, `POST /subscriptions/packages/:id/clone`, `POST /subscriptions/packages/:id/new-version`, `DELETE /subscriptions/packages/:id`.
- Guard: authGuard + adminGuard.
- States: loading, empty, validation/conflict error, editable draft, immutable referenced version, new-version success, archived, linked-Plan detail.
- Notes: a Package is not created per billing/reset period. Multiple Plans may reference it. Published/referenced identity is never edited; a limits/cadence change uses **Create new version**. Reset cadence is independent of Plan billing interval and supports positive `day|month|year` count. Archive is rejected for a Package holding the default Free Plan *(change-080)*.

### Package Detail Page *(change-082)*
- Route: `/app/packages/:id` · Guard: authGuard + adminGuard · Service: `GET /subscriptions/packages/:id`.
- Header: Back link, name, version, stage tag, primary action + overflow menu (same lifecycle actions as the list; inapplicable actions hidden, disabled ones explain why in a tooltip).
- Sections: **Overview** (name + description EN/AR side by side, AR right-to-left; family key; tier) · **Entitlements** (all 5 limits labelled, `-1` Unlimited, `0` Not included; included users; quota reset) · **Features** (✓/✗ list with readable names) · **Linked plans** (table with links to Plan detail, price, stage, subscribers) · **Versions** (previous/next links) · **Subscribers** (active, past due) · **Lifecycle** (created by/at, made immutable, archived, last updated).
- States: loading skeleton, not found, error with retry.
- Draft edit dialog edits features with toggles (payload shape unchanged).

### Action design *(change-077)*
- Every row action is a **text-labelled button**, never icon-only. One primary action per row; the rest live in a single `p-menu` overflow so the intended next step is unambiguous.
- Task-oriented vocabulary replaces lifecycle jargon: **Edit draft** · **Create new version** · **Duplicate** · **Archive** · **Delete draft**.
- A blocked action is rendered **disabled with the reason shown inline** (e.g. "Live packages can't be edited — create a new version instead") rather than hidden or silently failing. The same applies inside the dialog: a disabled Save states the first unmet requirement.
- Create/edit dialogs are grouped into labelled sections — *Identity* · *Tier* · *Limits* · *Quota reset* — each field carrying a plain-language helper line. The free-tier cadence hint states the exact `30 day` requirement.
- **Create new version** clones the Package **and its linked Plans** into one editable draft set and says so in the confirmation dialog: current subscribers stay on their existing version and nothing goes live until the new Plan is published.
- Uniqueness conflicts (`SUBSCRIPTION_PACKAGE_NAME_TAKEN`, `SUBSCRIPTION_PACKAGE_TIER_TAKEN`) are surfaced as localized field-level errors, not toasts.
