# Bug #003 — Cancelled subscription still shown as current plan

## Status
**DONE** — Fix confirmed by user

## Reported
- **Date**: 2026-06-23
- **Confirmed**: 2026-06-23
- **Severity**: medium
- **Affected area**: customer-portal/subscriptions

## Description
When a subscription is cancelled (final state), the plan page still marks the old plan as "Current Plan" with no Subscribe button. All plans should be available to subscribe again.

## Expected Behavior
Cancelled/expired subscriptions are treated as no active plan. Every plan in Available Plans shows Subscribe — no Current badge, no Upgrade/Downgrade.

## Root Cause
`planAction()` checks plan ID match and returns `'current'` before checking if status is cancelled/expired.

## Fix Applied
Reorder `planAction()` to treat cancelled/expired as subscribe-only. Only mark a plan as current when subscription status is `active`. Update header label to "Previous Plan" for cancelled/expired.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts`
