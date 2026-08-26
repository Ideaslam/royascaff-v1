## Module: Subscriptions

### Subscriptions Page
- Route: `/app/subscriptions`
- Components: workspace subscription table; status/Plan/Package/grace/retirement/scheduled-change filters; exact Plan and Package family/version; separate billing/access and quota periods; usage/cadence detail; retirement/replacement state; lifecycle history; change/activate/deactivate/reconcile actions.
- Service: `listSubscriptions` → `GET /subscriptions`; `getSubscription` → `GET /subscriptions/:id`; recovery-only `create` → `POST /subscriptions`; notes-only `update` → `PUT /subscriptions/:id`; `change` → `POST /subscriptions/:id/change`; `activate`/`deactivate` → dedicated endpoints.
- Guard: authGuard + adminGuard.
- Notes: every mutation requires reason/idempotency. Higher Package tier may upgrade after settlement; lower tier and same-tier Plan version schedule for billing end. Current quota is never reset by a billing-only change. No direct date/counter/catalog identity edits.
