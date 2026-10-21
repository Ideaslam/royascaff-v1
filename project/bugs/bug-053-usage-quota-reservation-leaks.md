# Bug #053 — Usage quota reserved before validation and never released (sync, uploads, refresh, synced rows)

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: high
- **Affected area**: backend/data, dashboards, pipelines, subscriptions/limits
- **Triage path**: A — Change request (touches data, dashboards, pipelines and subscriptions modules)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
`assertAllowed` reserves quota atomically, but no caller ever calls `SubscriptionUsagePeriodRepository.release()`. Failed operations permanently consume quota; any member can drain the workspace's monthly updates; one hourly dataset with a disabled connection burns the whole daily sync quota.

## Expected Behavior
Quota is only consumed by operations that succeed; validation happens before reservation.

## Steps to Reproduce (if applicable)
1. HOURLY dataset with a DISABLED connection → `scheduled-sync.service.ts:56` calls `triggerSync` hourly → reserves then throws → daily quota (Free: 2) exhausted.
2. `POST /dashboards/<random id>/refresh` in a loop → 404 each time, `updatesUsed` increments.
3. Non-resumable sync fails at 80% → BullMQ retries 3× → rows charged up to 3×.

## Root Cause
- `data/services/sync.service.ts:69` reserves before validation (75-108).
- `dashboards/services/dashboards.service.ts:436` refresh reserves before `findById`/`enforceAccess` (441-443); `:107` create reserves before name check/create.
- `data/services/data.service.ts:66,150` reserve before 50MB check/R2 upload; `:234` before NotFound/owner check.
- `pipelines/steps/load.step.ts:171`, `pipelines/streaming/streaming-sync.coordinator.ts:72` reserve rows before `insertRows`; `data-sync.processor.ts:265` rethrows with `attempts: 3`; limit errors retried.
- Scheduled syncs share the user's daily quota (product decision).

## Fix Applied
_Escalated to Path A and applied 2026-10-21 in [change-080-bug-fix-subscription-review](../changes/change-080-bug-fix-subscription-review/)._ Behaviour, files and evidence: see that folder's `change-request.md` (sections A–G), `impact.md` and `verify-code.md` (acceptance criteria + residual gaps).

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/data/services/sync.service.ts
- roya-ai-dynamo-api/src/modules/data/services/data.service.ts
- roya-ai-dynamo-api/src/modules/dashboards/services/dashboards.service.ts
- roya-ai-dynamo-api/src/modules/pipelines/steps/load.step.ts
- roya-ai-dynamo-api/src/modules/pipelines/streaming/streaming-sync.coordinator.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts
