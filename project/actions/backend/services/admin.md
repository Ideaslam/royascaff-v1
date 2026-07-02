## Module: Admin

### SVC-ADMIN · AdminService [internal, application, Admin]
Computes the admin overview dashboard — parallel entity counts plus a 30-day AI cost summary.

**Methods:**
- `getOverviewStats()` — returns clients/projects/dashboards/subscriptions counts and 30-day AI cost summary (totals + per-day breakdown)

**Deps:** AiLogRepository · SubscriptionRepository · User/Project/Dashboard models (@InjectModel)
**Side effects:** none (read-only)
**Rules:** "This month" / cost window is trailing 30 days · All counts and cost summary gathered with Promise.all for latency
