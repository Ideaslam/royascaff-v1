# Bug #056 — limit 0 means unlimited; missing usage period yields misleading "limit reached"

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: medium
- **Affected area**: backend/subscriptions (limits, DTOs, catalog data)
- **Triage path**: A — Change request (DTO + schema semantics + data migration)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
`limit <= 0` is treated as unlimited, so admins can't disable a feature with 0 and missing/legacy fields become unlimited; the envelope shows 0 for both. An ACTIVE subscription without a usage period gets "limit reached… upgrade" on everything while the UI implies unlimited.

## Expected Behavior
Explicit unlimited sentinel; 0 blocks; missing usage period self-heals or returns a distinct code.

## Steps to Reproduce (if applicable)
1. Admin sets `maxSyncsPerDay: 0` on Free → unlimited syncs.
2. Subscription with no `currentUsagePeriodId` → every action `SUBSCRIPTION_LIMIT_EXCEEDED` with `limit: 0`.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts:80,245-252,97,231-232,131-169`; `subscription-usage-period.repository.ts:207`; `dto/subscription.dto.ts:72-94` `@Min(0)`; migrations default missing to 0 (`database/migrations/lib/catalog-shape.ts:33-43`).

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/dto/subscription.dto.ts
- roya-ai-dynamo-api/src/database/migrations/
