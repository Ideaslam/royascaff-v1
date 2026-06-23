# Change Log

Append-only index of every change completed through Phase 5. The AI appends **one row** per change in
Step 5.6. Full detail for each change — the filled `change-request.md` and both verification reports
(`verify-plan.md`, `verify-code.md`) — lives in its change folder.

| #   | Date       | Type | Target app | Scope | Outcome | Folder |
|-----|------------|------|-----------|-------|---------|--------|
| 001 | 2026-06-22 | new-feature | customer-portal | Subscriptions — self-service subscribe + cancel | PASS | [change-001-subscription-self-service](change-001-subscription-self-service/) |
| 002 | 2026-06-22 | modify-page | admin-panel | Admin Subscriptions Page — plan-vs-code sync (no code change) | PASS | [change-002-admin-subscriptions-plan-sync](change-002-admin-subscriptions-plan-sync/) |
| 003 | 2026-06-23 | new-feature | customer-portal (+ admin-panel) | PayUp payment provider — backend integration, payment log, event-driven activation | PASS | [change-003-payup-payment-provider](change-003-payup-payment-provider/) |
| 004 | 2026-06-23 | general | all-apps | Subscription status, usage limits, free plan — account/subscription enforcement | PASS | [change-004-subscription-status-usage-free-plan](change-004-subscription-status-usage-free-plan/) |
| 005 | 2026-06-23 | general | all-apps | Subscription billing upgrade/downgrade, admin paid flag, pending invoices | PASS | [change-005-subscription-billing-upgrade-downgrade](change-005-subscription-billing-upgrade-downgrade/) |
