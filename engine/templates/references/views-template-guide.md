# Views Template — Detailed Guide

> This is the verbose reference for `../views-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- `views.md` lives at `project/actions/<app-key>/views.md`.
- `<app-key>` is the mobile app's key from the Applications table in `project/profile.md`.
- Web apps use `pages-template.md` (`pages.md`); API apps use `services.md` + `endpoints.md`.
- Every screen uses the same section order.
- Document screen behavior in mobile terms, but link it to backend endpoints.
- If the screen has a form, say whether it is create, edit, or combined.
- If the screen contains a list, say what endpoint feeds it and how pagination/refresh works.
- State navigation explicitly (which stack/tab the screen belongs to).
- Use the platform's native component library — not a web UI library.
- Mobile apps reuse the shared backend API — no direct external-provider calls.

## Extended Screen Entry Format

When a screen needs more detail than the compact schema:

```md
### ScreenName

- Route/Navigation: `RouteName` (deep link: `app://path/:id`)
- Type: list | details | create | edit | dashboard | settings | auth
- Navigation: stack | bottom-tab | modal | drawer

#### Components
- `ComponentName` — what it does

#### Services / Data
- `ServiceOrHookName` → EP-NNN (METHOD /route) — purpose

#### Models / DTOs
- `DtoName` — purpose

#### Platform Notes
- push notifications, native gestures, offline cache, biometrics, deep links, permissions

#### States
- Loading: skeleton/spinner
- Empty: empty state message
- Error: retry/toast
- Success: toast/navigation

#### Rules / Notes
- permission note
- RTL / localization note
```

## Suggested Field Meanings

- **Route/Navigation** — route name, deep link, and navigation pattern (stack, tab, modal, drawer)
- **Components** — child components used on the screen
- **Service** — data hook/service + which endpoint IDs it calls
- **Guard** — auth requirement for this screen
- **Platform** — mobile-specific behavior (push, offline, gestures, biometrics)
- **Notes** — permissions, read-only constraints, localization requirements
