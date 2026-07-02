# Pages — Shell

## Module: Shell

### App Shell Layout

- Route: `/`
- Status: partial (layout wrapper for child routes)
- Components: `AppShellComponent`, `SidebarNavComponent`, `HeaderComponent`, `NotificationBellComponent`
- Service: `AuthApiService` → EP-012 (GET /auth/me); `NotificationsApiService` → EP-088 (unread count)
- Guard: `AuthGuard`
- Notes: sidebar links — Sphere, Projects, Mind Map, Wallet, Notifications, Profile; Admin section if `admin` role

### Home Dashboard Page

- Route: `/`
- Status: partial
- Components: `HomeDashboardComponent`, `QuickStatsCardsComponent`, `RecentNotificationsComponent`, `MyProjectsListComponent`
- Service: `ProjectsApiService` → EP-039; `NotificationsApiService` → EP-088; `WalletsApiService` → EP-074
- Guard: `AuthGuard`
- UI states: loading skeleton; empty projects CTA to create; error + retry
- Notes: landing after login; shortcuts to Sphere and pending offers
