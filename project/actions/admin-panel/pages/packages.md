## Module: Subscription Packages

### Packages Page
- Route: `/app/packages`
- Components: bilingual/RTL Package catalog table/cards; family/version lineage; draft/immutable/archived badges; tier rank; feature flags; included users; generalized dashboard/upload/update/synced-row/daily-sync limits; quota reset count/unit; linked Plan list; create/edit-draft, clone, and archive/delete dialogs with reason/idempotency.
- Service: `GET /subscriptions/packages`, `GET /subscriptions/packages/:id`, `POST /subscriptions/packages`, `PUT /subscriptions/packages/:id`, `POST /subscriptions/packages/:id/clone`, `DELETE /subscriptions/packages/:id`.
- Guard: authGuard + adminGuard.
- States: loading, empty, validation/conflict error, editable draft, immutable referenced version, clone success, archived, linked-Plan detail.
- Notes: a Package is not created per billing/reset period. Multiple Plans may reference it. Published/referenced identity is never edited; a limits/cadence change uses Clone Package. Reset cadence is independent of Plan billing interval and supports positive `day|month|year` count.
