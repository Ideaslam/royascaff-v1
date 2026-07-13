# Pages — Customer Portal — Routing Registry

| Module | File | Pages | Routes |
|--------|------|-------|--------|
| Auth | auth.md | Login, Register, Forgot Password, Reset Password, Check Email, Verify Email | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/check-email`, `/auth/verify-email` |
| Sharing (public) | sharing.md | Shared Dashboard Viewer | `/shared/:token` |
| Projects | projects.md | Projects List, Project Detail | `/app/projects`, `/app/projects/:id` |
| Dashboards | dashboards.md | Dashboard Generating, Dashboard Viewer | `/app/dashboards/:id/generating`, `/app/dashboards/:id` |
| Data (Multi-Source) | data.md | Data Sources Home (grouped), **Data Source Detail** *(change-045)*, **Backend-Driven Setup Wizard** *(change-039/045)*, ProgressLoader (shared), CSV Upload, Dataset/Table Detail (Sync History), Legacy per-source Connect/Setup pages (historical), Legacy CSV Files, Legacy CSV Upload | `/app/data`, `/app/data/sources/:connectionId` *(change-045)*, `/app/data/connect/:sourceType` *(change-039)*, `/app/data/csv-upload`, `/app/data/datasets/:id`, `/app/data/files`, `/app/data/upload` (+ legacy `/app/data/{google-sheets,shopify,salla,zid}/…`, `/app/data/{sql-server,mongodb-atlas}/connect`) |
| Notifications | notifications.md | Notifications | `/app/notifications` |
| Subscriptions | subscriptions.md | Subscriptions | `/app/subscriptions` |
| User Settings | profile.md | Profile Settings | `/app/settings/profile` |
| In-Portal Admin | admin.md | Admin Users, Admin Settings | `/app/admin/users`, `/app/admin/settings` |
| Workspace & Onboarding | workspace.md | Onboarding Wizard, Workspace Settings, Members & Invitations, Workspace Branding | `/onboarding`, `/app/settings/workspace`, `/app/settings/members`, `/app/settings/branding` |
| Shared Infrastructure | shared-infrastructure.md | AppShell, onboardingGuard, Auth Models, Auth Service, WorkspaceService, WorkspaceMembersService | (cross-cutting) |

---

## Known Frontend Gaps

- AppShell sidebar links to `/app/dashboards` which has **no route** (redirects to `/app/projects`).
- In-portal Admin Settings page is a placeholder.
- Dashboard PDF export is requested but backend PDF worker is not implemented yet.
- Data Sources page, CSV wizard, Google Sheets, Shopify, Salla, Zid, SQL Server, and MongoDB Atlas pages are implemented (change-022/023/024/025/026/027/028). Dataset Detail page with sync history and observability implemented in change-029.
