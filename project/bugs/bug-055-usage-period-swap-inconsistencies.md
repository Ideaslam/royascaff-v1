# Bug #055 — Usage counters wrong across package swaps/rollovers (sync carry-over, lost usage, downgrade keeps old quota)

## Status
**PENDING** — Fix applied 2026-10-21, awaiting user verification

## Reported
- **Date**: 2026-10-21
- **Severity**: medium
- **Affected area**: backend/subscriptions (usage periods, billing calc)
- **Triage path**: B — Direct fix (subscriptions module only)
- **Source**: Full subscription/payments module code review (read-only). Findings come from reading the code; not reproduced against a running system.

## Description
Several usage-period transitions produce wrong counters: yesterday's sync count carried into today after an upgrade; usage consumed during a swap is lost; renewing into a scheduled downgrade keeps the old package's limits; Free access and quota periods drift apart.

## Expected Behavior
Counters reflect actual usage under the correct package at all times.

## Steps to Reproduce (if applicable)
1. Use 2/2 syncs yesterday, upgrade this morning → blocked today.
2. Scheduled downgrade at renewal → higher limits kept for a full cycle.

## Root Cause
- `roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription-usage-period.repository.ts:182-188,130`: `replacePreservingUsage` copies `syncsToday` with `syncsTodayResetAt = now`; QUOTA_ROLLOVER sets `resetAt = usage.endsAt` (mid-day).
- `:165-189`, `:137-161`: counters copied from an earlier read; consumes on the old period between read and close are lost; `context()` (`subscription-limit.service.ts:231`) doesn't check `usage.endsAt`.
- `subscription-lifecycle.service.ts:478-540,711-715`: RENEWAL apply never swaps usage package.
- Free access uses `addInterval` (30 days) vs quota `addQuotaInterval` (`billing-calculation.service.ts:25-27`, lifecycle :93-94).

## Fix Applied
_Applied 2026-10-21:_
- `subscription-usage-period.repository.ts`:
  - new `carryDailySyncs(current, now)`: `syncsToday` is carried only if `syncsTodayResetAt` is the same UTC day; its reset timestamp is carried too (previously yesterday's count was copied with `resetAt = now` and never reset).
  - `append` accepts optional `syncsTodayResetAt`.
  - `replacePreservingUsage`: after the swap, re-reads the closed source period and `$inc`s any usage consumed between the read and the close into the new period.
- `subscription-lifecycle.service.ts`:
  - QUOTA_ROLLOVER carries syncs already used on the boundary's UTC day.
  - RENEWAL apply: if the current usage period's package differs from the invoice target package (scheduled downgrade/replacement), the usage period is replaced onto the target package (`PACKAGE_CHANGE`, tagged with the invoice id so a retry resumes).
  - `appendAtBoundary`: Free access periods use the Free package quota interval so access and quota roll together.

**Verification:**
- Unit (`subscription-usage-period.repository.spec.ts`): same-day counter carried; stale-day counter not carried; usage consumed during the swap carried as `$inc` delta. Suites subscriptions+payments 53/53 pass.
- Integration `bug-055: renewing into a scheduled plan on another package moves the quota window` passes; control run without the RENEWAL usage swap fails.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription-usage-period.repository.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-lifecycle.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/services/subscription-limit.service.ts
- roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription-usage-period.repository.spec.ts
- roya-ai-dynamo-api/test/subscription-due-transitions.e2e-spec.ts
