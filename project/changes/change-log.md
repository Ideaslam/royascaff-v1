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
| 006 | 2026-06-23 | general | all-apps | Workspace multi-tenancy + Onboarding wizard — workspace schemas/repos/services/controllers, dynamic MongoDB collection prefixing (ws_{slug}_*), JWT workspace context, workspace roles, onboarding progress, color templates, branding, member management, email invitations, frontend onboarding wizard, workspace settings, admin workspaces panel | PASS | [change-006-workspace-onboarding](change-006-workspace-onboarding/) |
| 007 | 2026-06-24 | modify-feature | customer-portal | Resend button for pending workspace invitations | PASS | [change-007-resend-workspace-invitation](change-007-resend-workspace-invitation/) |
| 008 | 2026-06-24 | new-feature | all-apps | Workspace switcher, default workspace preference, workspace settings list & creation limit | PASS | [change-008-workspace-management-and-switching](change-008-workspace-management-and-switching/) |
| 009 | 2026-06-24 | general | all-apps | Subscription Plan Limit Per User — calculate limits per user, check workspace free users quota, generate PayUp invoice for extra users, payment activation, admin plan config | PASS | [change-009-subscription-per-user-limit](change-009-subscription-per-user-limit/) |

