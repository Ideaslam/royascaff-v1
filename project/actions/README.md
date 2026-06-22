# project/actions/

## Purpose

This folder contains the **action specifications** for every application in the solution. They are part of `project/` — the single source of truth for the current system. Specs are organized **per app**, so you can see the services, endpoints, and screens of each application on its own.

## Structure — one folder per app

Each application from the **Applications** table in `project/profile.md` gets its own folder, named by its **app key**. The spec files inside a folder depend on the app type:

```
project/actions/
  <api-app>/                 # backend / API app
    services.md              # service map (internal + external providers)
    endpoints.md             # HTTP API specification
  <web-app>/                 # web SPA (customer portal, admin panel, …)
    pages.md                 # routed page specification
  <mobile-app>/              # mobile app (iOS / Android / cross-platform)
    views.md                 # mobile screen specification
```

| App type | Folder | Spec files |
|----------|--------|-----------|
| Backend / API | `<api-app-key>/` | `services.md`, `endpoints.md` |
| Web SPA | `<web-app-key>/` | `pages.md` |
| Mobile app | `<mobile-app-key>/` | `views.md` |

If the solution has **multiple APIs** (e.g. a `customer-api` and an `admin-api`), each gets its own folder with its own `services.md` + `endpoints.md`. Today this system has a **single shared API** (`backend/`) consumed by all frontends.

### Current apps in this system

| App key | App | Type | Spec files |
|---------|-----|------|-----------|
| `backend` | API (`roya-ai-dynamo-api`) | Backend / API | `backend/services.md`, `backend/endpoints.md` |
| `customer-portal` | Customer Portal (`roya-ai-dynamo-frontend`) | Web SPA | `customer-portal/pages.md` |
| `admin-panel` | Admin Panel (`roya-ai-dynamo-frontend-admin`) | Web SPA | `admin-panel/pages.md` |

## The call chain

The dependency direction is unchanged — it now just crosses app folders:

```text
<web-app>/pages.md  ─┐
<mobile-app>/views.md ┼─►  <api-app>/endpoints.md  ─►  <api-app>/services.md  ─►  repositories / external providers
```

Client screens (pages/views) call the API's endpoints; endpoints call services; services call repositories and isolated external providers. A client spec never calls a service directly.

**Order matters** when generating an API app: create its `services.md` first, then `endpoints.md`. Client specs (`pages.md` / `views.md`) are created after the endpoints they depend on exist.

## Usage

These files are generated from:
- All planning documents in `project/plan/`
- `project/profile.md` (the Applications table defines the app keys/folders)
- `project/rules.md` (system-specific rules) and `engine/rules/` (generic rules)
- `engine/templates/` (structured templates: `services-template.md`, `endpoints-template.md`, `pages-template.md`, `views-template.md`)

Follow the orchestration steps in `engine/flow.md` to keep these documents consistent. In Change Mode (Phase 5) they are updated in place — within the matching app folder — so the plan always equals the latest state of the code.
