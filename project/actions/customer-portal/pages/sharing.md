## Module: Sharing (public)

### Shared Dashboard Viewer
- Route: `/shared/:token`
- Components: SharedViewerPage (dashboard title, widget grid read-only, loading skeleton, token error state)
- Service: Direct HttpClient call → `GET /api/v1/shared/:token`
- Guard: none (public, token-gated)
- Notes: No app shell or auth. Honors link permission and expiry; increments access count server-side.
