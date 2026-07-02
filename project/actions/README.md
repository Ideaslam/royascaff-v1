# project/actions/

## Purpose

This folder contains the **action specifications** for every application in the solution. They are part of `project/` — the single source of truth for the current system. Specs are organized **per app**, so you can see the services, endpoints, and screens of each application on its own.

## Structure — one folder per app, split by module

Each application gets its own folder. Specs are **split into per-module files** with an `_index.md` routing registry at the top of each directory:

```
project/actions/
  <api-app>/                 # backend / API app
    endpoints/
      _index.md              # ROUTING REGISTRY: module → file → EP- ID range
      auth.md                # endpoints for Auth module
      workspace.md           # endpoints for Workspace module
      ...
    services/
      _index.md              # ROUTING REGISTRY: module → file → SVC- ID
      auth.md                # services for Auth module
      ...
  <web-app>/                 # web SPA (customer portal, admin panel, …)
    pages/
      _index.md              # page registry: page name → route
      auth.md                # pages for auth flows
      ...
  <mobile-app>/              # mobile app (would follow same pattern with views/)
```

| App type | Folder | Spec structure |
|----------|--------|---------------|
| Backend / API | `<api-app-key>/` | `endpoints/_index.md` + per-module, `services/_index.md` + per-module |
| Web SPA | `<web-app-key>/` | `pages/_index.md` + per-group |
| Mobile app | `<mobile-app-key>/` | `views/_index.md` + per-group |

App folders are created in Phase 2 from `project/profile.md` (Applications table). Until then this directory contains only this README.

## How to use the registries

1. Read `_index.md` first to find which file(s) contain the module you need
2. Load only those files — never scan the whole directory
3. The registry maps module → file → ID range (e.g., Auth → `auth.md` → `EP-AUTH-01..08`)
4. It also carries the module's **build status** and `Done/Total` count, so you can see what is finished vs. pending without opening every file (see `engine/templates/index-template.md`)

## Build status

Every service, endpoint, page, and view carries a **status** (`planned` · `partial` · `done` · `deferred`) recorded next to its spec and rolled up in each `_index.md`. The system-wide summary lives in `project/status.md`. This is how anyone — human or AI — tells what is built vs. still to do. Vocabulary and rules: `engine/conventions.md` → **Build Status**.

## The call chain

```text
<web-app>/pages/*  ─┐
<mobile-app>/views/* ┼─►  <api-app>/endpoints/*  ─►  <api-app>/services/*  ─►  repositories / providers
```

Client screens (pages/views) call the API's endpoints; endpoints call services; services call repositories and isolated external providers. A client spec never calls a service directly.

**Order matters** when generating an API app: create services first, then endpoints. Client specs are created after the endpoints they depend on exist.

## Defaults

Global defaults (route prefix, auth model, envelope, pagination, UI states) live in `engine/conventions.md`. Spec files only document **deviations** from those defaults.
