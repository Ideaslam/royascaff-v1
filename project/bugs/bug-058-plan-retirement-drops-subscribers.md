# Bug #058 — Retired/versioned plans silently drop paid subscribers to Free; cancel-retirement leaves plan hidden

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: medium
- **Affected area**: backend/subscriptions (catalog, lifecycle), frontend
- **Triage path**: A — Change request (successor-migration policy is a product decision)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
When a plan is retired or replaced by a new version, paid subscribers fall to Free at period end as "nonpayment", with no invoice or email. Cancelling a retirement keeps the plan unpublished. The default Free plan can still disappear via package archive or a non-transactional switch.

## Expected Behavior
Subscribers renew onto the successor version (or are clearly notified); catalog invariants hold.

## Steps to Reproduce (if applicable)
1. Publish v2 of a paid plan and retire v1.
2. v1 subscriber's period ends → Free, source NONPAYMENT_FALLBACK, no email.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts:609-611,640-672`; `subscription-catalog.service.ts:153-180` records `replacesPlanId` but nothing reads it.
- `subscription.repository.ts:257-276` scheduling retirement unpublishes immediately; `:278-290` cancel doesn't republish.
- `subscription-catalog.service.ts:182-202` can archive default Free's package; `repo:138-191` switchDefaultFree fallback non-atomic; seeder `:88-97` doesn't repair.
- Customer retirement banner (`subscriptions.page.ts:48-59`) has no CTA.

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-catalog.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts
- roya-ai-dynamo-frontend/src/app/pages/subscriptions/subscriptions.page.ts
