# Bug #013 — Subscription page shows plan UI before DB data is ready

## Status
**DONE** — Fix confirmed by user

## Reported
- **Date**: 2026-07-06
- **Confirmed**: 2026-07-06
- **Severity**: medium
- **Affected area**: customer-portal / `pages/subscriptions/subscriptions.page.ts`

## Description
On the subscription page, plan UI renders before `/subscriptions/me` finishes loading. While `mySub` is still `null`, `planAction()` treats the user as unsubscribed and marks every plan with a Subscribe action — including the user's actual current plan. A non-active subscription (cancelled/expired) also renders a full "Previous Plan" card from the stale subscription record instead of only showing the available plans from the DB.

## Expected Behavior
- Do not render plan cards or plan actions until subscription data (`GET /subscriptions/me`) and plans list (`GET /subscriptions/plans`) have both loaded from the DB.
- Show the current-plan summary card only for an **active** subscription.
- For cancelled/expired subscriptions, show the renewal alert only — no previous-plan card with usage stats.

## Steps to Reproduce
1. Log in with an active subscription.
2. Navigate to `/app/subscriptions`.
3. Observe a brief flash where all plans show "Subscribe" before the correct "Current Plan" badge appears.
4. (Optional) Cancel a subscription and revisit the page — a "Previous Plan" card still appears above Available Plans.

## Root Cause
1. `ngOnInit()` fires three independent requests with no loading coordination (`loadMySub`, `getPlans`, `loadPending`).
2. The plans grid renders as soon as `plans()` is populated, even when `mySub()` is still `null`. In `planAction()`, `const sub = this.mySub()?.subscription` is undefined, so the early return `if (!sub || ...) return 'subscribe'` marks every plan as subscribable.
3. The template uses `@if (data.subscription)` without restricting to `status === 'active'`, so cancelled/expired records still render the full plan summary card.

## Fix Applied
- Split loading into two phases: `subReady` (after `GET /subscriptions/me`) then `plansReady` (after `GET /subscriptions/plans`).
- Subscription section renders as soon as `/me` returns; Available Plans render only after `/plans` returns (with inline spinner in between).
- Subscription card shows the DB record for any status (plan name + status tag); usage bars and cancel button only for `active`.
- Cancelled/expired show renewal alert above the DB subscription card.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts`
