# Views File Template (Mobile Apps)

## Short Summary

Use this template when creating a **mobile app's** `views.md`.
The `views.md` file lists every screen (view) the AI will build for **one** mobile application, and every screen entry uses the same structure. It is the mobile counterpart of `pages-template.md`.

> **One app per file.** Each mobile app has its own views file under `project/actions/<app-key>/views.md`
> (e.g. `customer-mobile/views.md`), where `<app-key>` is the app key from the Applications table in
> `project/profile.md`. Web apps use `pages-template.md` (`pages.md`); API apps use `services.md` + `endpoints.md`.

## Purpose

This template is **not** for writing actual mobile code. It is a documentation template for listing planned mobile screens in one consistent format, before any RN/Flutter/SwiftUI/Compose code is generated.

A mobile app **reuses the shared backend API** defined in `project/profile.md` — it does not duplicate business logic and never calls external providers directly. Every screen links to the backend endpoints it consumes from `project/actions/<api-app>/endpoints.md`.

Each screen entry should describe:

- screen name
- route / navigation target
- purpose and description
- navigation pattern (stack, tab, modal, drawer)
- components used inside the screen
- services / data hooks the screen depends on
- models/DTOs used by the screen
- related backend endpoints
- platform notes (gestures, push, offline, permissions)
- states (loading/empty/error/success) and permissions

## File-Level Rules

- `views.md` contains a list of screen entries grouped by module (same module names as `project/plan/modules.md`).
- Every screen uses the same section order.
- Document screen behavior in mobile terms, but link it to backend endpoints and services.
- If the screen has a form, say whether it is create, edit, or combined.
- If the screen contains a list, say what endpoint feeds it and how pagination/refresh works.
- State navigation explicitly (which stack/tab the screen belongs to, and how it is reached).
- Use the platform's **native** component library (per `project/profile.md`) — not a web UI library.

## Recommended `views.md` Structure

```md
# Views — {App Name}

## Short Summary
{which mobile app, platform, framework, and which backend API it reuses}

## Module: {Module Name}

### Screen 1
{entry}

### Screen 2
{entry}
```

## Single Screen Entry Template

```md
### Screen {Number}

- Name: `{Screen Name}`
- Route / Nav: `{route name or deep link}`
- Type: `{list | details | create | edit | create-edit | dashboard | settings | auth}`
- Navigation: `{stack | bottom-tab | modal | drawer}`
- Summary: `{short summary}`

#### Description

{Clear explanation of what this screen does for the user.}

#### Purpose

- {Main use case 1}
- {Main use case 2}

#### Main Component

- Component Name: `{ScreenComponentName}`
- Folder: `{src/screens/... or app/...}`
- Files:
  - `{screen-name}.screen.tsx` (or platform equivalent)
  - `{screen-name}.styles.ts`

#### Child Components

- `{ComponentName} - {why it is used}`

#### Services / Data

- `{ServiceOrHookName} - {purpose}`

#### Models / DTOs

- `{ModelOrDtoName} - {purpose}`

#### Backend Endpoints Used

- `{HTTP METHOD} {route} - {why it is used}`

#### Platform Notes

- {Push notifications, native gestures, offline cache, biometrics, deep links, permissions}

#### States

- Loading: `{behavior — skeleton/spinner}`
- Empty: `{behavior — empty state}`
- Error: `{behavior — retry/toast}`
- Success: `{behavior — toast/navigation}`

#### Rules / Notes

- {Validation or business note}
- {Permission note}
- {RTL / localization note}
```

## Compact Screen Entry Template

Use this for a shorter but still consistent style.

```md
### Screen {Number}

- Name: `{Screen Name}`
- Route / Nav: `{route}`
- Type: `{screen type}`
- Navigation: `{stack | tab | modal | drawer}`
- Description: `{what the screen does}`
- Components:
  - `{...}`
- Services / Data:
  - `{...}`
- Models:
  - `{...}`
- Endpoints:
  - `{...}`
- Platform Notes:
  - `{...}`
- Notes:
  - `{...}`
```

## Example

```md
### Screen 1

- Name: `Dashboard Viewer`
- Route / Nav: `DashboardViewer` (deep link: `app://dashboards/:id`)
- Type: `dashboard`
- Navigation: `stack` (pushed from the Projects tab)
- Summary: `Full-screen native viewer for an AI-generated dashboard.`

#### Description

Renders all widgets of a dashboard in a scrollable native grid. Charts and KPIs are rendered with a native charting library; data comes only from the backend.

#### Purpose

- View a generated dashboard on mobile
- Pull-to-refresh widget data

#### Main Component

- Component Name: `DashboardViewerScreen`
- Folder: `src/screens/dashboards/viewer`
- Files:
  - `dashboard-viewer.screen.tsx`
  - `dashboard-viewer.styles.ts`

#### Child Components

- `WidgetCard - renders one widget (chart/KPI/table) natively`

#### Services / Data

- `DashboardsApi - loads dashboard + widget data via React Query`

#### Models / DTOs

- `DashboardDto - dashboard metadata + widget list`
- `WidgetDataDto - per-widget data payload`

#### Backend Endpoints Used

- `GET /api/v1/dashboards/:id - load dashboard definition`
- `GET /api/v1/dashboards/:id/widgets/:wid/data - load widget data`

#### Platform Notes

- Pull-to-refresh re-fetches widget data
- Charts use a native chart library (no WebView)
- Works offline read-only from the last cached payload

#### States

- Loading: `skeleton widgets`
- Empty: `"No widgets yet" empty state`
- Error: `error banner with retry`
- Success: `rendered widget grid`

#### Rules / Notes

- Read-only on mobile (no create/edit)
- All traffic routes through the backend API — no direct storage/AI calls
- Respect RTL layout for Arabic
```

## Final Guidance

When AI creates `views.md`, it should use this screen entry structure for every screen so the whole file stays consistent and easy to understand before any mobile code is generated. Keep all data access through the shared backend API and use the platform's native UI library.
