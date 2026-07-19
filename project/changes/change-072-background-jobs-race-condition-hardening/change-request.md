# Change Request

## Metadata
- **date**: 2026-07-15
- **change-type**: general
- **target-app**: backend
- **affected-repos**: backend
- **priority**: high

## Scope
- Module(s): background-jobs, data, dashboards, ai-processing, subscriptions, integrations/ai
- Feature(s): Distributed locking, atomic status transitions, stale job recovery, cron dedup, AI retry, consistent retry strategy
- Endpoint(s): None new — hardening of existing background processing
- Page(s)/View(s): None
- Service(s): SyncService, DatasetService, ScheduledSyncService, DashboardsService, AnthropicProvider, new DistributedLockService, new StaleJobRecoveryService

## Description

**Problem**: The system uses non-atomic check-then-act patterns for all background job guards (sync, schema discovery, dashboard generation). In a multi-instance production deployment, two pods can simultaneously pass the status check and enqueue duplicate jobs — causing data redundancy in OLAP, wasted AI API costs, and inconsistent state. Additionally:

- If a process crashes mid-job, MongoDB status fields (syncStatus=syncing, schemaDiscoveryStatus=running, etc.) get permanently stuck, blocking future operations with no recovery mechanism.
- `@Cron` decorators in `ScheduledSyncService` fire on EVERY instance — N pods means N× the intended sync triggers.
- Schema discovery and CSV analysis have zero BullMQ-level retries — transient AI failures become permanent.
- The AI provider (`AnthropicProvider`) has no internal retry for transient HTTP errors (429, 500, timeouts).
- Data sync retries via BullMQ but doesn't reset the MongoDB `syncStatus` on retry attempts.
- Subscription activation is not fully idempotent — duplicate jobs could create duplicate audit logs.

**Desired behavior**: Every background operation must be safe under concurrent multi-instance execution — no duplicate work, no stuck states, graceful recovery from crashes, and consistent retry strategies across all job types.

**Who is affected**: All users (data integrity) + operations (stuck jobs require manual intervention today).

**User story**: As a platform operator running 3+ API pods, I expect that scheduled syncs fire exactly once per interval per dataset, manual sync triggers reject duplicates atomically, crashed jobs recover automatically, and AI transient failures retry before giving up.

## Acceptance Criteria
1. Two concurrent sync triggers for the same dataset → only one succeeds, other gets 409 Conflict (verified by atomic MongoDB transition)
2. Two concurrent schema discovery requests for the same dataset → only one enqueued, other gets 409 Conflict
3. Two concurrent dashboard generation requests → only one proceeds, other gets 400
4. System crash mid-sync → stale job recovery resets stuck status within 5 minutes of restart
5. System crash mid-schema-discovery → same recovery
6. Scheduled sync cron with N instances → each dataset synced exactly once per interval (Bull repeatable job with fixed jobId)
7. AI provider returns 429/500/timeout → retried automatically up to 3 times with exponential backoff
8. Schema discovery AI failure (transient) → retried by Bull up to 2 times before final failure
9. CSV analysis AI failure → retried by Bull up to 2 times
10. Dashboard generation failure → retried by Bull up to 2 times
11. Data sync Bull retry → MongoDB syncStatus properly reset to SYNCING at job start
12. Duplicate subscription activation job → processes idempotently, no duplicate audit logs
13. All status transitions verified to be atomic (no check-then-act patterns remain)
14. BullMQ workers configured with appropriate lockDuration/stalledInterval per job type

## Notes
- Out of scope: `pdf-export` and `cache-recalculation` processor implementations (separate change)
- Out of scope: WebSocket/SSE migration for progress tracking
- Out of scope: Frontend changes
- Locking strategy: MongoDB atomic `findOneAndUpdate` for status transitions + Redis `SET NX` for critical section locks
- No new dependencies needed — `ioredis` already available
