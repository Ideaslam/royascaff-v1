## Module: Notifications

### Notifications Page
- Route: `/app/notifications`
- Components: NotificationsPage (notification list with per-item read, "Mark all as read" action)
- Service: NotificationsService.list() → `GET /api/v1/notifications`; NotificationsService.markRead() → `PATCH /api/v1/notifications/:id/read`; NotificationsService.markAllRead() → `PATCH /api/v1/notifications/read-all`
- Guard: authGuard + onboardingGuard
- Notes: AppShell topbar shows unread badge via `GET /api/v1/notifications/unread-count`. This is a full page, not a slide-over panel.
