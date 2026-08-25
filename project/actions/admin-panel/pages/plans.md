## Module: Subscription Plans

### Plans Page
- Route: `/app/plans`
- Components: bilingual/RTL plan catalog table and create/edit dialog for free/paid type, tier rank, price/currency, paid interval, limits, included users, extra-user price, and active/archive state.
- Service: `listAllPlans` → `GET /subscriptions/plans/all`; `createPlan` → `POST /subscriptions/plans`; `updatePlan` → `PUT /subscriptions/plans/:id`; `archivePlan` → `DELETE /subscriptions/plans/:id`.
- Guard: authGuard + adminGuard.
- Notes: free is fixed to 30 days and zero price; paid interval is configurable. Used plan identity fields are read-only. Archive removes a plan from new choices without deleting historical snapshots. UI prevents multiple active free plans and explains validation errors in EN/AR.

