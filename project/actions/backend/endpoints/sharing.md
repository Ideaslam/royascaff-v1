## Module: Sharing

`@Controller()` (root) — routes declared with full paths

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-SHARE-01 | POST | /api/v1/dashboards/:id/share | JWT | `:id` · `CreateShareLinkDto` { permission (view ǀ edit), viewerCanRefresh?, expiresAt? } | 201 `ShareLinkCreatedResponse` | SVC-SHARE.createShareLink() | Raw token returned once |
| EP-SHARE-02 | GET | /api/v1/dashboards/:id/share | JWT | `:id` param | 200 `ShareLinkDto[]` | SVC-SHARE.listShareLinks() | Includes active + revoked |
| EP-SHARE-03 | DELETE | /api/v1/dashboards/:id/share/:shareLinkId | JWT | `:id`, `:shareLinkId` params | 204 | SVC-SHARE.revokeShareLink() | |
| EP-SHARE-04 | GET | /api/v1/shared/:token | public (token) | `:token` param | 200 `SharedDashboardDto` | SVC-SHARE.resolveSharedDashboard() | |

**Notes:**
- [EP-SHARE-01] Response includes `shareLinkId`, `shareUrl` (raw token returned once), `permission`, `expiresAt`.
- [EP-SHARE-04] Validates share token, enforces permissions/expiry, returns public dashboard with cached chart data. No JWT required.
