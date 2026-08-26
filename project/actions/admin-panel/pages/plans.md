## Module: Subscription Plans

### Plans Page
- Route: `/app/plans`
- Components: bilingual/RTL commercial-offer table/cards; Package/version picker; price/currency, billing and extra-user pricing intervals; Plan family/version/replaces link; published/active/default-Free/retiring badges; immutable read-only state; clone, publish, unpublish, archive-draft, and schedule/reschedule/cancel-retirement dialogs with reason.
- Service: existing Plan list/create/draft-update/archive endpoints plus `POST /plans/:id/clone|publish|unpublish`, `POST|PUT|DELETE /plans/:id/retirement`.
- Guard: authGuard + adminGuard.
- Notes: Plan never edits Package limits. Referenced/published commercial identity is read-only; price changes use Clone Plan. `isPublished` controls new selection, `isActive` controls future period starts, and current access is snapshot-based. Retirement requires ≥30 days and immediately unpublishes. UI protects the single active published default Free invariant and localizes stable errors.
