## Module: Subscriptions

### SVC-SUB · SubscriptionsService [internal, domain, Subscriptions]
Manages subscription plan catalog (admin), per-user subscription assignment/changes/cancellation (admin), and customer self-service subscribe and cancel.

**Methods:**
- `listPlans()` — public list of active plans
- `assignDefaultFreePlan(workspaceId)` — finds first active free plan (`priceMonthlyUsd = 0`, `isActive = true`); if found and workspace has no subscription, activates via `activateFromPayment`; no-op if no free plan or subscription already exists. Called from `WorkspaceService.createWorkspace` on signup and new-workspace creation *(change-056)*
- `listAllPlans()` — admin list of all plans (incl. inactive)
- `createPlan(dto: CreatePlanDto)` — creates plan (defaults isActive true)
- `updatePlan(id, dto: UpdatePlanDto)` — updates plan, 404 if missing
- `deletePlan(id)` — deletes plan, 404 if missing
- `getMySubscription(userId)` — caller's current subscription
- `selfSubscribe(userId, planId, ip?)` — free plan: enqueue activation job; paid plan: PayUp checkout via PaymentCheckoutService, returns { redirectUrl } (change-001/003/004)
- `selfCancel(userId, ip?)` — cancels calling user's own subscription, audits SUBSCRIPTION_CHANGE (change-001)
- `listAllSubscriptions(filters)` — admin paginated/filterable list of user subscriptions
- `getSubscriptionById(id)` — fetch one subscription, 404 if missing
- `createSubscription(dto: CreateSubscriptionDto, actorId?, ip?)` — validates user + plan, creates/updates subscription, audits SUBSCRIPTION_ASSIGN
- `updateSubscription(id, dto: UpdateSubscriptionDto, actorId?, ip?)` — updates plan/dates/status/notes, audits SUBSCRIPTION_CHANGE
- `assignSubscription(userId, planId, actorId?, ip?)` — upserts user's subscription to plan, audits SUBSCRIPTION_ASSIGN
- `changeSubscription(userId, planId, actorId?, ip?)` — switches user's plan, audits SUBSCRIPTION_CHANGE
- `cancelSubscription(userId, actorId?, ip?)` — cancels user's subscription, audits SUBSCRIPTION_CHANGE
- `activateFromPayment(userId, planId, paymentId?)` — internal: activates/upserts subscription; called by SubscriptionActivationProcessor (change-003)
- `activateSubscription(subscriptionId, actorId?, ip?)` — admin: sets status active, period dates, audits SUBSCRIPTION_ACTIVATE (change-004)
- `deactivateSubscription(subscriptionId, actorId?, ip?)` — admin: sets status inactive, audits SUBSCRIPTION_DEACTIVATE (change-004)

**Deps:** SubscriptionRepository · AuditLogService · PaymentCheckoutService · SubscriptionLimitService · subscription-activation queue (BullMQ) · UserRepository (from Auth module)
**Side effects:** audit writes · queue enqueue · PayUp checkout initiation
**Rules:** Plan and user existence validated before assignment/creation · assign/change upsert single subscription per user · Public plan listing returns only active plans · Activation sets currentPeriodStart/currentPeriodEnd (+1 month), resets monthly counters (change-004) · Resource lock (expired/inactive/cancelled): blocks dashboard create, file upload, data update/refresh (change-004)

---

### SVC-SUB-LIM · SubscriptionLimitService [internal, domain, Subscriptions]
Extensible subscription quota enforcement via a limit registry.

**Methods:**
- `check(userId, limitKey)` — returns { allowed, current, limit, message? }
- `assertAllowed(userId, limitKey)` — throws ForbiddenException if over limit or subscription not active
- `incrementUsage(userId, limitKey)` — atomically increments monthly counter after successful action
- `buildUsageEnvelope(userId)` — limits + current usage for GET /me
- `assertResourceUnlocked(userId)` — throws if subscription expired/inactive/cancelled (resource lock)

**Deps:** SubscriptionRepository · DashboardRepository
**Side effects:** $inc on usersubscriptions counters
**Rules:** Must be called from business services (Dashboards, Data) not controllers · Monthly limits use $inc on usersubscriptions counters · Each limit key (maxDashboards, maxDataUploadsPerMonth, maxDataUpdatesPerMonth) registers a handler in SubscriptionLimitRegistry

---

### SVC-SUB-LIMIT-SYNC — SubscriptionLimitService sync extensions *(change-029)*

**New limit keys added to `SubscriptionLimitKey`:**
- `MAX_SYNCED_ROWS_PER_MONTH` — total rows loaded across all syncs in the billing period (0 = unlimited)
- `MAX_SYNCS_PER_DAY` — number of manual+scheduled sync triggers per calendar day (0 = unlimited)

**New plan fields added to `SubscriptionPlan`:**
- `maxSyncedRowsPerMonth: number` (0 = unlimited, default 0)
- `maxSyncsPerDay: number` (0 = unlimited, default 0)

**New user-subscription counters added to `UserSubscription`:**
- `syncedRowsThisMonth: number` (reset on billing period rollover)
- `syncsToday: number` (reset daily)
- `syncsTodayResetAt: Date` (tracks when `syncsToday` was last reset)

**New methods on `SubscriptionLimitService`:**
- `incrementSyncedRows(userId, rowCount): Promise<void>` — $inc `syncedRowsThisMonth` after successful sync
- `incrementSyncsToday(userId): Promise<void>` — $inc `syncsToday`; resets counter if `syncsTodayResetAt` < today
- `checkSyncAllowed(userId): Promise<LimitCheckResult>` — checks both `MAX_SYNCED_ROWS_PER_MONTH` and `MAX_SYNCS_PER_DAY`; returns most restrictive result

**Enforcement points:**
- `SyncService.triggerSync()` calls `checkSyncAllowed()` before enqueuing; throws `ForbiddenException` with clear message if either limit exceeded
- `DataSyncProcessor.process()` calls `incrementSyncedRows()` and `incrementSyncsToday()` after `markDone()`

---

### SVC-SUB-ROLL · SubscriptionPeriodRolloverProcessor [internal, application, Subscriptions]
BullMQ processor that resets monthly usage counters and marks expired subscriptions.

**Methods:**
- `process()` — consumes subscription-period-rollover repeatable job; resets counters where currentPeriodEnd <= now; sets status=expired when period ends without renewal

**Deps:** SubscriptionRepository
**Side effects:** counter resets · status updates
**Rules:** Runs on repeatable schedule · Expires subscriptions past their period end without renewal
