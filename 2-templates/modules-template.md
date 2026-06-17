# Modules File Template

## Short Summary

Use this template when creating `modules.md`.  
The `modules.md` file should define the application modules the AI will build, and every module entry should use the same structure.

## Purpose

This template is not for NestJS module code, Angular module code, or folder scaffolding.  
It is a documentation template for grouping product features into stable backend and frontend modules before `endpoints.md` and `pages.md` are created.

Each module entry should describe:

- module name and purpose
- related features from `features.md`
- backend and frontend scope
- expected folder paths
- related data model collections or entities
- dependencies on other modules
- planning notes and rollout constraints

## File-Level Rules

- `modules.md` is the module source-of-truth created before `features.md` and before endpoint/page planning.
- Every module must use the same section order.
- Module names must stay stable because they will be reused in `endpoints.md` and `pages.md` as `## Module: {Module Name}`.
- Name modules by business capability, not by one screen or one endpoint.
- One feature may span one module or multiple modules; one module may contain many features.
- Separate admin/master-data modules from normal user workflow modules when they serve different audiences.
- Mark backend-only modules explicitly when they have no dedicated frontend area.
- Mark frontend shell/layout modules explicitly when they are not backend domains.
- Shared infrastructure modules should be documented separately from business modules.
- Do not dump existing code; describe the recommended module map the project should implement.

## Recommended `modules.md` Structure

```md
# Modules

## Short Summary

{One paragraph: what product this module map supports and where it comes from.}

Source inputs:

- `{reference doc or prototype}`
- `data-model.md` when available

Its purpose is to define the module list that will later be used to build:

- `endpoints.md`
- `pages.md`
- backend feature folders
- frontend feature folders

This file is not an endpoint list and not a page list. It is the module source-of-truth used before those files are created.

## How To Use This File

When AI builds `endpoints.md`:

- group endpoints under the matching module from this file
- use the exact module name in `## Module: {Module Name}`

When AI builds `pages.md`:

- group pages under the matching frontend module from this file
- use the exact module name in `## Module: {Module Name}`

When AI builds backend code:

- create one backend feature module per business module when scope includes backend
- follow the backend folder pattern defined in the project rules

When AI builds frontend code:

- create one frontend feature area per frontend-visible module
- keep shell/layout modules separate from business modules

## Product Module Strategy

{One paragraph describing how the system is split into modules.}

Recommended split:

- business modules for domain workflows
- admin modules for master data and configuration
- shared/infrastructure modules for cross-cutting concerns

## Business Modules

## 1. {Module Name}

{module entry}

## 2. {Module Name}

{module entry}

## Shared / Infrastructure Modules

## 1. {Module Name}

{module entry}

## Module Priority For Implementation Planning

## Phase 1: Core Required Modules

- {Module Name}
- {Module Name}

## Phase 2: {Phase Name}

- {Module Name}
- {Module Name}

## Phase 3: {Phase Name}

- {Module Name}
- {Module Name}

## Module Dependency Summary

- `{Module A}` depends on `{Module B}`
- `{Module A}` depends on `{Module C}`

## Important Planning Notes

- One module may contain many endpoints and many pages.
- Some modules are backend-only and may not need dedicated pages.
- Some modules are frontend shell modules and may not need dedicated backend domains.
- Do not create a new module for every screen in the prototype.

Examples:

- {Example 1}
- {Example 2}

## Final Guidance

Use this file as the module map before generating `endpoints.md` and `pages.md`.

The correct order of work is:

1. define modules in `modules.md`
2. define all features for each module in `features.md`
3. derive endpoints from modules and features
4. derive pages from modules and features

Do not jump directly from the product description to endpoint or page lists without defining modules and features first.
```

## Single Module Entry Template

```md
## {Number}. {Module Name}

### Purpose

{Clear explanation of what this module owns in the system.}

### Scope

- Backend: `{yes | no}`
- Frontend: `{yes | no}`
- Audience: `{internal users | admin | public | mixed}`

### Related Features

- {Feature from features.md}
- {Feature from features.md}

### Backend Module

- Folder: `src/modules/{module-slug}/`
- Owns:
  - {controller/service responsibility}
  - {controller/service responsibility}

### Frontend Module

- Folder: `{client/src/app/...}`
- Owns:
  - {page area or shell responsibility}
  - {page area or shell responsibility}

### Data Model / Entities

- `{collection or entity}`
- `{collection or entity}`

### Depends On

- `{Module Name}`
- `{Module Name}`

### Notes

- {Auth, async, admin-only, shell, or dependency note}
- {Auth, async, admin-only, shell, or dependency note}
```

## Backend-Only Module Template

Use when a module has API responsibilities but no dedicated frontend area.

```md
## {Number}. {Module Name}

### Purpose

{Clear explanation of what this backend module owns.}

### Scope

- Backend: `yes`
- Frontend: `no`
- Audience: `{internal users | admin | system}`

### Related Features

- {Feature from features.md}

### Backend Module

- Folder: `src/modules/{module-slug}/`
- Owns:
  - {service/workflow responsibility}

### Data Model / Entities

- `{collection or entity}`

### Depends On

- `{Module Name}`

### Notes

- {Async, integration, or security note}
```

## Frontend Shell Module Template

Use for auth layout, app shell, navigation, or other UI infrastructure modules.

```md
## {Number}. {Module Name}

### Purpose

{Clear explanation of what this frontend shell or layout module owns.}

### Scope

- Backend: `{yes | no}`
- Frontend: `yes`
- Audience: `{all authenticated users | public | mixed}`

### Related Features

- {Feature from features.md}

### Frontend Module

- Folder: `{client/src/app/...}`
- Owns:
  - {layout, navigation, or shell responsibility}

### Depends On

- `{Module Name}`

### Notes

- {Routing, guard, or layout note}
```

## Compact Module Entry Template

Use this if you want a shorter style but still consistent.

```md
## {Number}. {Module Name}

- Purpose: `{what this module owns}`
- Scope: `backend={yes|no}, frontend={yes|no}`
- Features:
  - `{feature}`
- Backend: `src/modules/{module-slug}/`
- Frontend: `{client path or N/A}`
- Entities:
  - `{entity}`
- Depends on:
  - `{module}`
- Notes:
  - `{planning note}`
```

## Example

```md
## 1. Auth

### Purpose

Handle authentication, session/token lifecycle, and current-user access for the portal.

### Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `public and authenticated users`

### Related Features

- Authentication And Access Control

### Backend Module

- Folder: `src/modules/auth/`
- Owns:
  - login and logout
  - registration and password reset
  - current user profile endpoint
  - auth guards and token validation

### Frontend Module

- Folder: `client/src/app/pages/auth`
- Owns:
  - login page
  - register page
  - reset password page

### Data Model / Entities

- `users`

### Depends On

- `Users`

### Notes

- auth and user administration are related but separate modules
- frontend auth pages use the auth layout, not the main app shell
```

## Suggested Field Meanings

- `Module Name`
  stable business capability label reused in endpoints, pages, and code folders
- `Purpose`
  what this module owns in the system
- `Scope`
  whether the module exists on backend, frontend, or both
- `Related Features`
  links back to entries in `features.md`
- `Backend Module`
  expected backend folder and responsibilities
- `Frontend Module`
  expected frontend folder and page/layout responsibilities
- `Data Model / Entities`
  collections or entities primarily owned by this module
- `Depends On`
  other modules that must exist first or be available at runtime
- `Shared / Infrastructure Modules`
  cross-cutting modules such as database, config, storage, mail, or jobs
- `Phase 1 / Phase 2 / Phase 3`
  implementation priority for backend and frontend generation

## Final Guidance

When AI creates `modules.md`, it should copy this module entry format for every module so the whole file stays consistent and easy to scan before any endpoints, pages, or code folders are generated.

The filled project-specific module map should live in the project docs, not in this template file.
