## Module: Subscriptions

### Subscriptions Page
- Route: `/app/subscriptions`
- Components: workspace subscription table; status/plan/grace/scheduled-change filters; current-period and usage detail drawer; lifecycle history; lifecycle-aware change dialog; activate/deactivate controls; reconciliation action.
- Service: `listSubscriptions` → `GET /subscriptions`; `getSubscription` → `GET /subscriptions/:id`; recovery-only `create` → `POST /subscriptions`; notes-only `update` → `PUT /subscriptions/:id`; `change` → `POST /subscriptions/:id/change`; `activate`/`deactivate` → dedicated endpoints.
- Guard: authGuard + adminGuard.
- Notes: every lifecycle mutation requires reason and idempotency key. Admin chooses immediate/scheduled only where lifecycle rules allow; manual paid settlement references an invoice rather than a “Mark as paid” boolean. No customer-style cancel/re-subscribe and no direct date/counter edits.

