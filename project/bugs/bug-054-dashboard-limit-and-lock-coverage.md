# Bug #054 — Dashboard limit never freed on delete; duplicate bypasses limit and lock; widget writes unlocked

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: medium
- **Affected area**: backend/dashboards, subscriptions/limits
- **Triage path**: A — Change request (dashboards + subscriptions modules)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Deleting a dashboard does not free a slot until quota rollover; `duplicateDashboard` ignores both the dashboard limit and the subscription lock; widget mutations and retryGeneration skip the lock check.

## Expected Behavior
`maxDashboards` caps existing dashboards; all write paths respect the lock.

## Steps to Reproduce (if applicable)
1. Plan allows 3; create 3, delete 1 → create still blocked (`max(3,2)=3`).
2. At 3/3 or while locked, duplicate a dashboard repeatedly → succeeds.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts:98-105,134-139,271-275` uses `$max` (setMinimum) with stored `dashboardsUsed`; `dashboards.service.ts:252` delete doesn't decrement.
- `dashboards.service.ts:276-330` duplicate has no `assertAllowed`; `addWidget`, `updateWidget`, `retryGeneration` lack `assertResourceUnlocked`.

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/dashboards/services/dashboards.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts
