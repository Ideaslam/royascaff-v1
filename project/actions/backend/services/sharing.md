## Module: Sharing

### SVC-SHARE · SharingService [internal, domain, Sharing]
Creates and manages tokenized public share links and resolves shared dashboards for unauthenticated viewers.

**Methods:**
- `createShareLink(dashboardId, dto: CreateShareLinkDto, userId, ip?)` — owner-only; stores SHA-256 token hash, returns raw share URL once, audits SHARELINK_CREATE
- `listShareLinks(dashboardId, userId)` — owner-only list of dashboard's links
- `revokeShareLink(dashboardId, shareLinkId, userId, ip?)` — owner-only revoke, audits SHARELINK_REVOKE
- `resolveSharedDashboard(token: string)` — public; validates token/expiry/revocation, increments access count, returns dashboard + widgets with cached data

**Deps:** ShareLinkRepository · DashboardRepository · ChartWidgetRepository · ChartDataCacheRepository · AuditLogService · ConfigService
**Side effects:** SHA-256 hashing · access-count increment · audit writes
**Rules:** Only dashboard owner can create/list/revoke links · Raw token returned once at creation; only SHA-256 hash persisted · Revoked links return 410 Gone; expired return 401 Unauthorized · Shared views read cached chart data only (no live aggregation)
