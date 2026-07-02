## Module: Subscriptions

### Subscriptions Page
- Route: `/app/subscriptions`
- Components: SubscriptionsPage (account status banner, current plan + usage bars for dashboards/uploads/updates vs limits, plan cards with Subscribe/Upgrade/Downgrade, pending invoices with Pay Now, cancel action)
- Service: SubscriptionsService.getPlans() → `GET /api/v1/subscriptions/plans`; SubscriptionsService.getMySubscription() → `GET /api/v1/subscriptions/me`; SubscriptionsService.subscribe() → `POST /api/v1/subscriptions/subscribe`; SubscriptionsService.upgrade() → `POST /api/v1/subscriptions/upgrade`; SubscriptionsService.downgrade() → `POST /api/v1/subscriptions/downgrade`; SubscriptionsService.getPendingPayments() → `GET /api/v1/subscriptions/me/pending-payments`; SubscriptionsService.pay() → `POST /api/v1/subscriptions/payments/:paymentId/pay`; SubscriptionsService.cancel() → `POST /api/v1/subscriptions/cancel`
- Guard: authGuard + onboardingGuard
- Notes: Free subscribe returns no redirect; paid subscribe returns redirectUrl to PayUp. Admin-deactivated (`inactive`) users see lock message, plan actions hidden. Global 403 handler on upload/create/refresh routes user here with upgrade message. PayUp return query params (`payment=success|failed|cancelled`) shown as toast. Usage at-limit shows warning.
