# Views Template (Mobile Apps)

Lists all screens for one mobile app. Lives at `project/actions/<app-key>/views.md`. For web apps, use `pages-template.md` instead. Mobile apps reuse the shared backend API — no duplicated business logic.

> Verbose guidance → `references/views-template-guide.md`

## Schema

```md
# Views — {App Name}

## Module: {ModuleName}

### ScreenName

- Route/Navigation: `ScreenName` (stack | bottom-tab | modal | drawer)
- Status: planned | partial | done | deferred
- Components: `WidgetCard`, `FilterChip`
- Service: `ResourceApi` → EP-001 (GET /resource)
- Guard: `authenticated` | `role:admin` | `none`
- Platform: pull-to-refresh, offline cache, push notifications
- Notes: read-only on mobile; native chart library
```

Status: `planned` · `partial` · `done` · `deferred` (see `engine/conventions.md`). New screens default to `planned`; `deferred` states its reason in Notes.

## Example

```md
# Views — Customer Mobile App

## Module: Dashboards

### Dashboard Viewer

- Route/Navigation: `DashboardViewer` (stack, pushed from Projects tab)
- Status: done
- Components: `WidgetCard`
- Service: `DashboardsApi` → EP-020 (GET /dashboards/:id), EP-021 (GET /dashboards/:id/widgets/:wid/data)
- Guard: `authenticated`
- Platform: pull-to-refresh; native charts (no WebView); offline read-only from cached payload
- Notes: read-only on mobile — no create/edit; RTL layout for Arabic

### Notifications List

- Route/Navigation: `Notifications` (bottom-tab)
- Status: planned
- Components: `NotificationItem`, `EmptyState`
- Service: `NotificationsApi` → EP-030 (GET /notifications), EP-031 (PATCH /notifications/read)
- Guard: `authenticated`
- Platform: push notifications via Expo; badge count on tab icon
- Notes: mark-all-read action; swipe-to-dismiss individual items
```
