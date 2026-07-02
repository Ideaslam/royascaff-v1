# Pages Template — Detailed Guide

> This is the verbose reference for `../pages-template.md`. Consult when you need field meanings, rules, or extended entry formats.

## File-Level Rules

- `pages.md` lives at `project/actions/<app-key>/pages.md`.
- `<app-key>` is the web app's key from the Applications table in `project/profile.md`.
- For mobile apps, use `views-template.md` to create `views.md` instead.
- Every page should use the same section order.
- Document page behavior in frontend terms, but link it to backend endpoints.
- If the page has a form, say whether it is create, edit, or combined create/edit.
- If the page contains a table, say what endpoint feeds it.
- If the page is inside auth or app shell, say so explicitly.

## Extended Page Entry Format

When a page needs more detail than the compact schema:

```md
### PageName

- Route: `/app/resource`
- Type: list | details | create | edit | create-edit | dashboard | settings | auth
- Layout: app shell | auth layout | public layout

#### Components
- `ComponentName` — what it does

#### Services
- `ServiceName` → EP-NNN (METHOD /route) — purpose

#### Models / DTOs
- `DtoName` — purpose

#### UI Sections
- section 1
- section 2

#### User Actions
- action 1
- action 2

#### States
- Loading: behavior
- Empty: behavior
- Error: behavior
- Success: behavior

#### Rules / Notes
- permission note
- validation note
- RTL/LTR note
```

## Suggested Field Meanings

- **Route** — frontend route path
- **Status** — build state: `planned`, `partial`, `done`, `deferred` (see `engine/conventions.md`). Defaults to `planned` when specced before code; `deferred` states its reason in Notes.
- **Components** — child components used on the page
- **Service** — Angular/React service + which endpoint IDs it calls
- **Guard** — route guard protecting this page (authGuard, adminGuard, none)
- **Notes** — permissions, validation, UI constraints, modal rules, pagination
- **Type** — page archetype (list, details, create, edit, dashboard, etc.)
- **Layout** — which app layout contains the page
