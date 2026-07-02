# Bug #001 — Mongoose `new` option deprecated warning

## Status
**DONE** — Fix confirmed by user

## Reported
- **Date**: 2026-06-23
- **Confirmed**: 2026-06-23
- **Severity**: low
- **Affected area**: backend/repositories (roya-ai-dynamo-api)

## Description
Node.js logs a Mongoose deprecation warning at runtime:
`(node:13724) [MONGOOSE] Warning: mongoose: the 'new' option for findOneAndUpdate() and findOneAndReplace() is deprecated. Use returnDocument: 'after' instead.`

## Expected Behavior
No deprecation warnings from Mongoose when repositories perform find-and-update operations.

## Steps to Reproduce (if applicable)
1. Start the API server
2. Trigger any code path that calls `findOneAndUpdate` or `findByIdAndUpdate` with `{ new: true }`

## Root Cause
Multiple repository files pass the deprecated `{ new: true }` option to Mongoose `findOneAndUpdate()` and `findByIdAndUpdate()` calls. Newer Mongoose versions require `returnDocument: 'after'` instead.

## Fix Applied
Replace all `{ new: true }` (and combined options like `{ upsert: true, new: true }`) with `{ returnDocument: 'after' }` across affected repository files.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-api/src/modules/payments/repositories/payment.repository.ts`
- `roya-ai-dynamo-api/src/modules/subscriptions/repositories/subscription.repository.ts`
- `roya-ai-dynamo-api/src/modules/settings/repositories/settings.repository.ts`
- `roya-ai-dynamo-api/src/modules/projects/repositories/project.repository.ts`
- `roya-ai-dynamo-api/src/modules/data/repositories/csv-file.repository.ts`
- `roya-ai-dynamo-api/src/modules/dashboards/repositories/widget-definition.repository.ts`
- `roya-ai-dynamo-api/src/modules/dashboards/repositories/dashboard.repository.ts`
- `roya-ai-dynamo-api/src/modules/dashboards/repositories/chart-widget.repository.ts`
- `roya-ai-dynamo-api/src/modules/auth/repositories/user.repository.ts`
