## Module: Overview

### Overview Page
- Route: `/app/overview`
- Components: OverviewPage (stat cards for clients/projects/dashboards/subscriptions/30-day AI cost, AI cost chart)
- Service: AdminService.getOverviewStats() → `GET /api/v1/admin/overview/stats`
- Guard: authGuard + adminGuard
