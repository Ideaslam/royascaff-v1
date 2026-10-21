# Change Request

## Metadata
- **date**: 2026-10-21
- **change-type**: bug-fix
- **target-app**: all-apps
- **affected-repos**: all (backend + frontend + admin)
- **priority**: high
- **source bugs**: [051](../../bugs/bug-051-captured-payments-not-honoured.md), [052](../../bugs/bug-052-no-manual-renew-and-pay-ux.md), [053](../../bugs/bug-053-usage-quota-reservation-leaks.md), [054](../../bugs/bug-054-dashboard-limit-and-lock-coverage.md), [056](../../bugs/bug-056-limit-zero-means-unlimited.md), [057](../../bugs/bug-057-admin-subscription-actions-inconsistent.md), [058](../../bugs/bug-058-plan-retirement-drops-subscribers.md), [059](../../bugs/bug-059-void-refund-extra-user-invoice-gaps.md) — escalated from Phase 6 (Path A) after the 2026-10-21 subscription module review.

## Scope
- Module(s): Subscriptions, Payments, Data (sync/upload), Dashboards, Pipelines, Workspace (invitations)
- Endpoint(s):
  - **new** `POST /subscriptions/renew` (workspace OWNER)
  - modified `POST /subscriptions/invoices/:invoiceId/pay`, `PATCH /subscriptions/auto-renew`, `POST /subscriptions/:id/activate|deactivate`, `PUT /subscriptions/:id`, `POST /subscriptions` (admin), `POST payments/invoices/:id/refund|chargeback|void`, `POST payments/manual-settlement`, plan retirement cancel
  - dashboards: create / duplicate / refresh / widget mutations / retry-generation; data: upload / complete-upload; sync: trigger
- Page(s)/View(s): customer-portal: subscriptions page, CSV connect error handling, global 403 handling; admin-portal: subscriptions, plans/packages (limits "Unlimited" toggle), payments review list
- Service(s): SubscriptionLifecycleService, SubscriptionLimitService, SubscriptionCatalogService, SubscriptionsService, BillingInvoiceService, PaymentCheckoutService, PaymentsService, SyncService, DataService, DashboardsService, load/streaming pipeline steps, WorkspaceInvitationService

## Description
The subscription review (bugs 051–059) found defects whose fixes need new endpoints, new jobs, data-model semantics or product policy, so they are delivered together as one bug-fix change. Product decisions confirmed by the owner on 2026-10-21 are marked **[decided]**.

### A. Payments are never lost (bug-051)
- A payment confirmed after its invoice expired is still honoured when the payment attempt was **started before** the invoice expired (EXPIRED → PAID). Payments on SUPERSEDED/VOID invoices, or started after expiry, are marked `refund_required`, audited, and listed for admins.
- A repeatable job (every 10 min) re-verifies PENDING payment attempts younger than 3 days with the provider (`getCheckoutSession`) and settles them through the same path as the browser redirect. PayUp webhooks stay out of scope (provider interface marks them "reserved").
- Starting a payment reuses the open PENDING attempt for the same invoice instead of opening a second checkout; a second captured payment for an already-PAID invoice is flagged `duplicate_payment` for refund.
- Re-using an Idempotency-Key whose attempt was cancelled/failed returns 409 with a "retry with a new key" code (not 500).
- Manual settlement validates the invoice before recording a payment and requires a `reason`.
- The legacy `confirm?ref=<Payment>` path checks amount and currency like the invoice path.

### B. Renewal the customer can act on (bug-052)
- **[decided]** New `POST /subscriptions/renew` (OWNER) returns the payable RENEWAL invoice for the current plan (or its live successor, see D):
  - within the 24 h lead window, during grace, or **up to 7 days after a paid period fell back to Free because auto-renew was off**; the renewed period keeps the **original billing date** (starts at the old period end);
  - after 7 days the customer re-subscribes via Upgrade (new billing date from payment).
- Turning auto-renew back on inside the lead window or grace creates the renewal invoice immediately.
- An email is sent when a paid period ends without renewal (auto-renew off).
- Customer subscriptions page: "Renew / Pay now" in the PAST_DUE banner and near period end; non-owners see "Ask the workspace owner to renew"; a "Renewal processing" banner when the period has ended but the job has not yet rolled it; "Pay now" hidden for invoices past `expiresAt`; `SUBSCRIPTION_LOCKED` / `SUBSCRIPTION_ADMIN_LOCKED` errors shown as translated messages with a link to Subscriptions (CSV connect + global interceptor).

### C. Quota is only spent on work that happens (bugs 053, 054)
- All protected operations validate first (not found, access, size, connection disabled, name taken) and reserve quota last; if the operation then fails, the reservation is released.
- Synced rows: a chunk's reservation is released if its insert fails; limit-exceeded errors are not retried; a non-resumable retry releases the failed run's rows.
- **[decided]** Scheduled (automatic) syncs do **not** count toward `maxSyncsPerDay`; they still consume synced rows and still respect the lock.
- `maxDashboards` caps the dashboards that currently exist: deleting one frees a slot; the usage envelope shows the real count.
- Duplicating a dashboard respects the dashboard limit and the lock; widget add/update and retry-generation respect the lock.

### D. Plan retirement and versions (bug-058)
- **[decided]** At renewal, a subscriber on a retired/replaced paid plan renews onto the **newest live version of the same plan family at that version's price**; an email is sent 7 days before the boundary naming the new plan and price. Only when no live successor exists does the subscription fall back to Free, recorded as `PLAN_RETIRED` (not "nonpayment") with an email.
- Cancelling a scheduled retirement restores the plan's previous published state.
- A package that holds the default Free plan cannot be archived; the lifecycle job logs an error once per run when no default Free plan exists.
- The customer retirement banner links to the successor plan.

### E. Limits: 0 means zero (bug-056)
- `-1` = unlimited, `0` = blocked, `>0` = cap, for every package limit. A data migration converts existing `0` values to `-1` so current behaviour is preserved. Admin package form gets an "Unlimited" toggle per limit. The usage envelope exposes `unlimited: true` per limit.
- A subscription with no usage period gets a distinct `SUBSCRIPTION_USAGE_PERIOD_MISSING` error (not "limit reached, upgrade").

### F. Admin actions (bug-057)
- Deactivate stores the previous status, bumps the lifecycle version and supersedes open renewal invoices; paying any invoice of an INACTIVE subscription is rejected with `SUBSCRIPTION_ADMIN_LOCKED`.
- Activate is allowed only from INACTIVE and restores the stored previous status; the admin UI shows Activate only for inactive subscriptions.
- `PUT /subscriptions/:id` accepts notes only (planId/paid/status/dates removed); plan changes go through `/:id/change`. Unused `effective` on admin plan change and ignored fields on admin create are removed from DTOs and the admin form.

### G. Void / refund / chargeback and extra-user invoices (bug-059)
- Voiding/refunding a renewal invoice does not block renewal: the next tick issues a replacement invoice (new key suffix).
- **[decided]** Refund or chargeback of an applied invoice keeps access until the current period ends, turns auto-renew off, and flags the subscription for admin review (audit + admin list).
- Revoking an invitation voids its open extra-user invoice; an invite-email failure no longer fails invoice application.

### Out of scope
- PayUp webhooks; month-end anchor-day field (bug-062 item 2); price/consent policy beyond D; changes to the shared `WorkspaceRoleGuard`.

## Acceptance Criteria
1. A payment attempt started before invoice expiry and confirmed after expiry results in a PAID, applied invoice.
2. A PENDING attempt whose provider session is paid is settled by the poller within 10 minutes without a browser redirect.
3. Two `pay` calls on the same invoice return the same checkout; a captured duplicate is flagged `duplicate_payment` and listed for admins.
4. Re-using a cancelled attempt's Idempotency-Key returns 409 (not 500).
5. Manual settlement on a non-payable invoice records no payment attempt; `reason` is required.
6. `POST /subscriptions/renew` returns a payable RENEWAL invoice in the lead window, in grace, and ≤ 7 days after an auto-renew-off fallback; paying it restores the plan from the original billing date; after 7 days it returns a clear error pointing to Upgrade.
7. Re-enabling auto-renew in the lead window creates the renewal invoice immediately.
8. The customer page shows Renew/Pay in the PAST_DUE banner, a member message for non-owners, a renewal-processing banner, and hides Pay for expired invoices; locked errors are translated with a link (EN/AR).
9. Failed sync trigger / upload / refresh / dashboard create leave usage counters unchanged; a refresh of a non-existent dashboard does not consume updates.
10. Scheduled syncs do not change `syncsToday`; manual syncs do.
11. A sync chunk that fails to insert does not keep its row reservation; limit errors are not retried.
12. Deleting a dashboard allows creating a new one at the cap; duplicating at the cap is rejected; widget mutations on a locked workspace are rejected.
13. A subscriber on a retired plan with a live successor renews onto the successor at the successor's price and receives a notice email beforehand; without a successor they fall to Free with source `PLAN_RETIRED`.
14. Cancelling a retirement restores the plan's published state; archiving the default Free plan's package is rejected.
15. After migration every former `0` limit is `-1`, behaviour is unchanged, an admin can set a limit to 0 to block the feature, and the admin form shows an Unlimited toggle.
16. Missing usage period yields `SUBSCRIPTION_USAGE_PERIOD_MISSING`.
17. After admin deactivate, paying an open invoice is rejected with `SUBSCRIPTION_ADMIN_LOCKED`; Activate restores the prior status and is shown only for inactive subscriptions.
18. `PUT /subscriptions/:id` with planId/paid/status/date fields is rejected by validation.
19. A voided renewal invoice is replaced by a payable one on the next tick.
20. Refund/chargeback of an applied invoice keeps access to period end, sets auto-renew off and flags admin review.
21. Revoking an invitation voids its extra-user invoice; a mail failure during extra-user apply still marks the invoice applied.
22. API unit suites, API integration tests, frontend and admin builds pass.

## Notes
- Plan-doc updates required (Step 5.3): `plan/data-model.md` (limit sentinel, payment attempt failure codes, subscription `previousStatus`/review flag), `actions/backend/endpoints/` (renew, changed DTOs/codes), `actions/backend/services/` (subscriptions, payments, data, dashboards), `actions/<frontend>/pages` and `actions/admin-panel/pages` (subscriptions, packages, payments), `rules.md` (sync quota rule, retirement successor rule, refund rule).
- Migration delivered through the existing `schema_migrations` ledger (change-077 runbook).
- Fixes from bugs 046–050, 055, 060–062 are already applied (Path B) and are prerequisites.
