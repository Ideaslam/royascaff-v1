# Pages — Customer Portal — Routing Registry

| Module | File | Pages | Routes |
|--------|------|-------|--------|
| Auth | auth.md | Login, Register, Forgot Password, Reset Password | `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password` |
| Sharing (public) | sharing.md | Shared Dashboard Viewer | `/shared/:token` |
| Projects | projects.md | Projects List, Project Detail | `/app/projects`, `/app/projects/:id` |
| Dashboards | dashboards.md | Dashboard Generating, Dashboard Viewer | `/app/dashboards/:id/generating`, `/app/dashboards/:id` |
| Data (Multi-Source) | data.md | Data Sources Home, Connections List, Create/Edit Connection, Datasets List, Dataset Detail+Sync, Legacy CSV Files, Legacy CSV Upload | `/app/data`, `/app/data/connections`, `/app/data/connections/new`, `/app/data/connections/:id/edit`, `/app/data/datasets`, `/app/data/datasets/:id`, `/app/data/files`, `/app/data/upload` |
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
- Data multi-source pages (`/app/data/connections`, `/app/data/datasets`) are **planned** (change-022+); only legacy CSV routes currently exist in code.
