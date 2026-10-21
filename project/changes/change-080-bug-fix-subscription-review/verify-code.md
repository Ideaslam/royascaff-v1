# Verification Report — change-080 Subscription review bug-fix bundle

- **Date**: 2026-10-21
- **Scope**: bugs 051–054, 056–059 (Path A) — backend, customer portal, admin panel
- **Overall**: **PASS** (with documented residual gaps below; user acceptance testing pending)

## Automated checks
| Check | Result |
|-------|--------|
| API `tsc --noEmit` | PASS — only the 2 pre-existing errors (`common/guards/workspace-role.guard.spec.ts`, `database/migrations/003-catalog-package-backfill.spec.ts`) |
| API unit (`npx jest`) | PASS — 28 suites / 170 tests |
| API integration, Mongo (`test/subscription-due-transitions.e2e-spec.ts`, Docker `mongo:7` 127.0.0.1:27018) | PASS — 17/17 (7 new change-080 cases) |
| API integration, Redis (`test/billing-invoice-delivery.e2e-spec.ts`, Docker `redis:7-alpine` 127.0.0.1:6390) | PASS — 1/1 |
| Customer portal `ng build --configuration development` | PASS |
| Admin panel `ng build --configuration development` | PASS |
| Frontend unit (`ng test`) | NOT RUN meaningfully — only the starter `app.spec.ts` exists in each app and fails on unrelated setup (`localStorage` undefined / "Hello" title) |

## Structural checks
1. **Endpoints in code** — `POST /subscriptions/renew` (OWNER, throttled) in `subscriptions.controller.ts`; `GET /payments/review` (ADMIN) in `payments.controller.ts`; changed DTOs: `UpdateSubscriptionDto` notes-only, `AdminPlanChangeDto` without `effective`, `CreateSubscriptionDto` without dates/status, manual settlement `reason` `@IsNotEmpty`. PASS
2. **Pages in code** — customer `pages/subscriptions/subscriptions.page.ts` (renew/pay CTAs, member message, processing banner, successor CTA, Unlimited/Not included); admin `subscriptions`, `packages`, `payments` pages. PASS
3. **Code layering** — controllers delegate to services; new DB access in repositories (`findLiveSuccessor`, `listRenewingBefore`, `adminActivate/Deactivate`, `packageHoldsDefaultFree`, `listReview`, `voidOpenByIdempotencyKey`, usage `setCounter`/`release`). PASS
4. **Frontend isolation** — new calls via `SubscriptionsService.renew`, admin `PaymentsService` review; `apiUrl` from environment; no hardcoded external URLs. PASS
5. **Auth** — renew: JWT + `WorkspaceRoleGuard` OWNER; review list: `@Roles(ADMIN)`; pay rejects INACTIVE subscriptions. PASS
6. **Error contract** — `GlobalExceptionFilter` now passes `code` through (it previously dropped it, so no client could read `SUBSCRIPTION_*` codes). PASS

## Acceptance criteria
| # | Criterion | Evidence | Status |
|---|-----------|----------|--------|
| 1 | Late settle when attempt started before expiry | `markPaidIfOpen(…, attemptStartedAt)`; payment unit specs | PASS (unit) |
| 2 | Poller settles PENDING paid sessions ≤10 min | `reverifyPendingAttempts` + repeatable job `payment-attempt-reverify` (10 min) | PASS (unit) |
| 3 | Same checkout reused; duplicate flagged | `startAttempt` reuse; `duplicate_payment` | PASS (unit) |
| 4 | Key reuse → 409 | `PAYMENT_IDEMPOTENCY_KEY_REUSED` | PASS (unit) |
| 5 | Manual settlement validates first; reason required | `payments.service.spec.ts` | PASS (unit) |
| 6 | Renew in lead/grace/≤7d; original billing date; closed window error | e2e "Renew now after lapse keeps billing date", "refused once 7-day window closed", "before period end…" | PASS (integration) |
| 7 | Re-enabling auto-renew in lead window creates invoice | `setAutoRenew` → `renewalContext` → `ensureRenewalInvoice` | PASS (code review) |
| 8 | Customer CTAs/banners/locked errors EN/AR | customer page + interceptor + csv-connect; build | PASS (build; UI not screenshot-reviewed) |
| 9 | Failed operations keep counters unchanged | data/sync/dashboards specs | PASS (unit) |
| 10 | Scheduled syncs don't change `syncsToday` | `checkSyncAllowed({scheduled})` spec | PASS (unit) |
| 11 | Failed chunk releases rows; limit errors not retried | load/streaming/processor specs | PASS (unit) |
| 12 | Delete frees slot; duplicate at cap rejected; locked widget writes rejected | dashboards spec | PASS (unit) |
| 13 | Successor renewal at successor price + notice; else `plan_retired` | e2e "retiring plan renews onto successor…", "without a successor…plan_retired"; `processSuccessorNotices` | PASS (integration; notice email by code review) |
| 14 | Cancel retirement restores publishing; default-Free package archive rejected | e2e repo test; catalog guard | PASS (integration / code review) |
| 15 | Migration 0→-1, admin can set 0, Unlimited toggle | migration 005 spec; catalog validation now allows -1 for limits; admin packages page | PASS (unit / build) |
| 16 | Missing usage period → distinct code | limit service spec | PASS (unit) |
| 17 | Deactivate blocks pay; activate restores prior status, only for inactive | e2e repo test (`adminDeactivate`/`adminActivate`); `startAttempt` spec; admin page | PASS |
| 18 | `PUT /subscriptions/:id` rejects plan/paid/status/date fields | DTO whitelist (`forbidNonWhitelisted`) | PASS (code review) |
| 19 | Voided renewal replaced next tick | e2e "voided renewal invoice is replaced" | PASS (integration) |
| 20 | Refund/chargeback keeps access, auto-renew off, review flag | billing-invoice spec | PASS (unit) |
| 21 | Revoke voids extra-user invoice; mail failure non-blocking | invitation spec; lifecycle try/catch | PASS (unit / code review) |
| 22 | Suites and builds pass | table above | PASS |

## Residual gaps (documented, not blocking)
- **Dashboard cap race**: `maxDashboards` now sets the counter to the live count before reserving; two simultaneous creates can exceed the cap by one (previous `$max` approach didn't have this window).
- **Resumable sync retry**: rows already inserted for the failed page are charged again when that page re-runs; the final failed attempt keeps its charge.
- **Webhook-triggered syncs** (Salla/Shopify/Zid) still count toward `maxSyncsPerDay`; only cron-scheduled syncs pass `scheduled: true`. Needs a product decision.
- **Extra-user invoice paid after its invitation was revoked** is not auto-flagged `refund_required` (apply throws; visible as paid-not-applied in the admin review list).
- **Payment review list** has no "resolve" action; flagged attempts stay listed.
- **Migration numbering**: `005-limit-unlimited-sentinel` registered after 003; the changelog-referenced `004-subscription-period-backfill` is absent from this checkout.
- **UI screenshots**: skipped (none submitted).
