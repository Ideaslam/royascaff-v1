## Module: Subscription Plans

### Plans Page
- Route: `/app/plans`
- Components: bilingual/RTL commercial-offer table/cards; Package/version picker; **client-facing display name/description inputs (EN + AR)**; price/currency, billing and extra-user pricing intervals; Plan family/version/replaces link; **lifecycle stage column** (`Draft` · `Live` · `Hidden` · `Retiring` · `Retired`) plus a **Next step** hint; default-Free badge; immutable read-only state; clone, publish, unpublish, archive-draft, and schedule/reschedule/cancel-retirement dialogs with reason.
- Service: existing Plan list/create/draft-update/archive endpoints plus `POST /plans/:id/clone|publish|unpublish`, `POST|PUT|DELETE /plans/:id/retirement`.
- Guard: authGuard + adminGuard.
- Notes: Plan never edits Package limits. Referenced/published commercial identity is read-only; price changes use Clone Plan. `isPublished` controls new selection, `isActive` controls future period starts, and current access is snapshot-based. Retirement requires ≥30 days and immediately unpublishes. UI protects the single active published default Free invariant and localizes stable errors.

### Client-facing labels *(change-077)*
- A Plan owns four admin-editable label fields — `displayName`, `displayNameAr`, `displayDescription`, `displayDescriptionAr` — which are what the customer portal shows. They are **never** overwritten by the Package compatibility mirror.
- Leaving them empty is valid and preserves today's behaviour: the resolved label falls back to the Package name. The form states this next to the field instead of requiring a value.
- Two Plans that share a Package can therefore carry distinct customer-visible names (e.g. *Pro Monthly* / *Pro Annual*), which is the fix for the duplicate-name confusion.
- The resolved label must be unique among **active + published** Plans; a collision returns `SUBSCRIPTION_PLAN_DISPLAY_NAME_TAKEN` and is shown as a localized field-level error. Retired/archived labels are reusable.

### Action design *(change-077)*
- Text-labelled actions only, one primary per row, remainder in a `p-menu` overflow: **Edit draft** · **Publish** · **Make default free plan** · **Hide from customers** (was "Unpublish") · **Create new version** · **Schedule retirement** · **Delete draft**.
- Blocked actions are disabled with the reason inline (e.g. "This plan has subscribers — create a new version to change pricing").
- **Make default free plan** (`EP-SUB-34`) is the handover step for the free tier: after publishing a new Free version, this moves the default-Free role onto it so the old version can then be hidden or retired. It is offered on any live free plan that does not already hold the role, and the "Hide from customers" / "Schedule retirement" blocked reasons on the current holder point at it ("make another free plan the default first"). Without it the outgoing Free plan is a dead end — see `RULE-SUB-008`.
- Create/edit dialogs are grouped into labelled sections — *Package* · *Customer-facing labels* · *Pricing* · *Billing cycle* · *Extra users* — with plain-language helper text per field.
- `planType` and `priceAmount` are cross-validated in the form so the API's paid-price rule can no longer be violated from the UI: `free` forces price `0` and disables the price input; `paid` requires ≥ 0.01 and a currency. `currency` must match exactly 3 letters and is upper-cased on submit.
- A disabled Save always states the first unmet requirement below the form, so the button is never a dead end.
