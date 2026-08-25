## Module: Subscriptions

### Subscriptions & Billing Page
- Route: `/app/subscriptions`
- Components: current-plan card; exact period/grace countdown; atomic usage bars; auto-renew control; scheduled-downgrade banner with effective time and cancel action; bilingual/RTL plan cards; server preview dialog; immutable invoice history; Pay Now action; payment-result toast.
- Service: `getPlans` → `GET /subscriptions/plans`; `getMySubscription` → `GET /subscriptions/me`; `previewChange` → `POST /subscriptions/change/preview`; `upgrade` → `POST /subscriptions/upgrade`; `scheduleDowngrade` → `POST /subscriptions/downgrade`; `cancelDowngrade` → `DELETE /subscriptions/downgrade`; `setAutoRenew` → `PATCH /subscriptions/auto-renew`; `getInvoices` → `GET /subscriptions/me/invoices`; `payInvoice` → `POST /subscriptions/invoices/:invoiceId/pay`.
- Guard: authGuard + onboardingGuard; mutation controls visible only to workspace owner, with backend authorization authoritative.
- Notes: no Subscribe Free or Cancel Subscription action. Paid cancel is “Turn off auto-renew” with period-end/grace explanation. Upgrade dialog displays server-calculated proration and activates after verified payment. Downgrade shows current plan plus “changes to X at TIME” and remains cancellable. Over-limit downgrade explains that data remains accessible while new limited actions are blocked. Never render provider session tokens/raw gateway data.

