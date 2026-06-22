# Frontend Setup Guide

## Short Summary

This document defines generic frontend conventions for any project. It covers architecture, tooling, performance, security, accessibility, and UX practices. AI should follow these rules when creating or modifying frontend code unless the project’s own docs or implemented patterns explicitly override them.

## Purpose

The frontend is the user-facing application layer. It should:

- present a clear, consistent UI for the product’s workflows
- communicate with the backend through typed, centralized services
- enforce route-level access control aligned with backend permissions
- handle loading, empty, error, and success states predictably
- remain maintainable as features grow

Adapt stack choices (framework, UI library, state management, etc.) to the project, but keep the architectural principles below.

---

## Core Technology Principles

### 1. Use a structured SPA or SSR framework

Prefer a framework with clear component boundaries, routing, and dependency injection (e.g. Angular, React with a router, Vue, etc.).

Use framework conventions consistently:

- standalone components / feature modules
- route configuration
- services / hooks / stores for side effects
- guards / middleware for access control
- interceptors / HTTP clients for API communication
- typed models and DTOs

Avoid monolithic pages where routing, data fetching, business logic, and presentation are all mixed without separation.

### 2. Use TypeScript or an equivalent typed language

When the stack supports it, use static typing for:

- API request/response models
- route params and query shapes
- form values
- shared UI prop contracts

### 3. Align with the backend contract

The frontend consumes the API — it does not own business rules. Display calculated values returned by the backend; do not treat client-side calculations as authoritative for domain logic.

---

## Architecture

### 1. Layered application structure

Organize code by responsibility:

| Layer | Responsibility |
|-------|----------------|
| Pages / views | Route-bound screens, orchestration, local UI state |
| Feature services | HTTP calls, feature-specific state, mapping API data |
| Shared components | Reusable, mostly presentational UI |
| Core | Auth, config, guards, interceptors, layouts, global services |

Dependency direction:

```text
page/view -> feature service -> HTTP client -> API
page/view -> shared components
core -> used by pages and services
```

### 2. Application shell

Use a main layout for authenticated or primary app routes:

- header / top bar
- navigation (sidebar, tabs, or menu)
- content area (router outlet / nested routes)

Auth and marketing-style pages should use a separate lightweight layout without the main shell.

### 3. Feature-first organization

Each business capability lives under its own feature folder.

Recommended structure (adapt paths to the repo):

```text
src/app/
  core/
    auth/
    guards/
    interceptors/
    layouts/
    services/
    models/
    config/
  shared/
    components/
    directives/
    pipes/
    utils/
    ui/
  pages/
    dashboard/
    auth/
    <feature-a>/
    <feature-b>/
```

Do not mix unrelated business logic in generic shared folders.

### 4. Smart vs presentational split

When a screen grows:

- keep data loading, route params, and orchestration in the page/smart component
- move reusable display sections into smaller presentational components

Avoid mega-components that own an entire product area.

### 5. Separation of concerns

- **Routing** — URL structure, guards, lazy loading
- **Data access** — HTTP/services, caching, error mapping
- **Presentation** — templates, styling, user interaction
- **Domain display logic** — formatting, sorting UI state, filter state (not authoritative business rules)

---

## Component Rules

### 1. Separate files

Each component should have separate files where the framework supports it:

- logic (`.ts`, `.tsx`, `.vue`)
- template/markup (`.html` or inline in `.tsx`/`.vue` per convention)
- styles (`.css`, `.scss`, CSS modules, etc.)

Do not use large inline templates or styles in logic files unless the component is trivial and structural.

### 2. One screen, one responsibility

Each page component should map to one screen responsibility:

- list
- details
- create
- edit
- dashboard / overview

Reusable UI belongs in `shared/components` or the project’s design system folder.

### 3. Component size and composition

Prefer composition over inheritance. Extract repeated patterns (data tables, filter bars, form sections) into shared components once a pattern appears twice or more.

---

## Routing Rules

### 1. Nested routes with a shell

Use a parent route with children for authenticated or main app pages.

Example structure:

```text
/
  auth/
    login
    register
    reset-password
  app/
    dashboard
    <feature-a>
    <feature-b>
```

### 2. Route guards

Protect routes with guards or equivalent middleware:

- authentication required for private routes
- role/permission checks for admin or sensitive screens

Unauthenticated users must not reach protected pages. Authorization should mirror backend rules — the frontend guard is UX, not security.

### 3. Lazy loading

Lazy load feature route groups as the app grows to reduce initial bundle size and improve first load time.

### 4. Deep linking

Routes should be bookmarkable and shareable. Avoid manual “page switching” state that bypasses the router.

---

## Data and API Integration

### 1. Environment configuration

Never hardcode API URLs, keys, or environment-specific values in components.

Use environment/config files for:

- base API URL
- app version
- feature flags
- default locale
- public analytics or monitoring IDs

### 2. Services own HTTP communication

Components should not call HTTP clients directly.

Each entity or feature should have a dedicated service responsible for endpoint communication.

Examples:

- `UsersService`
- `OrdersService`
- `AuthService`

### 3. Standard CRUD service methods

Expose predictable method names across features:

- `getList`
- `getLiteList`
- `getById`
- `create`
- `update`
- `remove`

Match the backend’s CRUD and workflow endpoint conventions.

### 4. List vs lite vs details

Use the right endpoint for the job:

| Endpoint type | Use for |
|---------------|---------|
| List (paginated) | Tables, search pages |
| Lite / minimal | Dropdowns, autocomplete, relation pickers |
| Details | View and edit pages |

Do not fetch full detail payloads to populate selectors when a lite endpoint exists.

### 5. Request/response typing

Define TypeScript interfaces or types for API payloads. Map API responses to view models in services when shape differs from UI needs.

### 6. Interceptors / middleware

Centralize cross-cutting HTTP concerns:

- auth token attachment
- refresh token flow (if applicable)
- global error handling
- correlation/request IDs
- base URL prefixing

---

## Forms

### 1. Use structured form libraries

Use the framework’s recommended form approach for non-trivial forms (e.g. reactive forms, React Hook Form, Formik).

Apply to:

- auth forms
- create/edit screens
- filter panels
- settings forms
- modal forms

### 2. Form UX requirements

Every form should support:

- field-level validation messages
- loading/disabled state while submitting
- backend validation error display
- sensible defaults and reset behavior

### 3. Modal vs dedicated page

Guideline for create/edit UX:

- **≤ 5 fields** — modal or drawer may be acceptable
- **> 5 fields**, relations, attachments, or complex validation — use a dedicated page

---

## Tables and Lists

### 1. Server-driven data

Use paginated, server-side lists for entities that can grow.

Support:

- pagination
- filters
- sorting
- loading skeleton or spinner
- empty state

### 2. Consistent list page layout

A standard list page should include:

- page title
- primary actions (create, export, etc.)
- filters
- data table or list
- row actions

### 3. Avoid over-fetching

Do not load unbounded lists. Respect page size limits and use lite endpoints for selectors.

---

## UI Library and Design System

### 1. Prefer a consistent component library

Use one primary UI library or internal design system for business UI:

- form controls
- tables
- dialogs/modals
- toasts/notifications
- tabs, menus, date pickers

Do not mix many competing libraries without reason.

### 2. Icons

Use an icon library (Font Awesome, Material Icons, Heroicons, etc.) instead of hand-built SVGs for common icons.

Custom SVGs are fine for brand assets or illustrations when explicitly required.

### 3. Design tokens and consistency

Preserve consistency across:

- spacing scale
- typography
- button sizes and variants
- input heights
- card and panel layouts
- table action patterns

Define tokens in global styles or theme config; avoid one-off magic numbers.

---

## Styling

### 1. Global vs local styles

Global styles are for:

- typography baseline
- theme variables / design tokens
- layout utilities
- library theme overrides
- directionality (RTL/LTR) fixes

Feature-specific styling stays with the component or feature.

### 2. Responsive design

Target the breakpoints the product requires. At minimum, ensure core workflows work on desktop and tablet; define mobile expectations per project.

### 3. Avoid inline style sprawl

Prefer class-based or token-based styling for maintainability.

---

## Internationalization and RTL

When the product requires multiple languages or right-to-left support:

### 1. Do not hardcode user-facing strings

Use a consistent i18n solution across the app. Pick one library and apply it project-wide.

### 2. RTL and LTR

If RTL is required, direction changes must affect:

- page layout
- navigation placement
- icon alignment
- spacing
- tables, dialogs, and form fields

Test both directions when adding complex UI (dropdowns, overlays, calendars, frozen columns).

### 3. Locale-aware formatting

Format dates, numbers, and currencies using locale-aware APIs, not manual string concatenation.

If the project is single-language only, still keep strings centralized where practical to ease future i18n.

---

## State Management

### 1. Start simple

Use framework-native patterns first (services, context, signals, composables) before introducing global state libraries.

Recommended ownership:

- auth state → core auth service/store
- locale/direction → core i18n service
- page-specific state → feature service or page component

### 2. When to add global state

Introduce dedicated state management (NgRx, Redux, Zustand, Pinia, etc.) only when:

- many components share complex async state
- optimistic updates and undo flows are common
- debugging/time-travel adds clear value

### 3. Single source of truth per concern

Avoid duplicating the same server data in multiple stores without a sync strategy.

---

## Security

### 1. Authentication tokens

- store tokens securely (httpOnly cookies preferred over localStorage when backend supports it)
- clear auth state on logout
- handle expired sessions gracefully (redirect to login, optional refresh flow)

### 2. Never trust the client for authorization

Hide UI the user cannot use, but assume APIs enforce permissions. Do not expose sensitive actions purely based on hidden buttons.

### 3. XSS prevention

- avoid `innerHTML` / `dangerouslySetInnerHTML` with untrusted content
- sanitize rich text when rendering user-generated or AI-generated HTML
- use framework-default binding escaping

### 4. Sensitive data in the UI

- do not log tokens, passwords, or PII to the console in production builds
- mask sensitive fields when displaying (partial card numbers, etc.) if required by domain

### 5. CSRF and cookies

If using cookie-based auth, follow backend CSRF requirements (SameSite, CSRF tokens).

### 6. Environment secrets

Never embed private API keys in frontend bundles. Only public/client-safe keys belong in frontend env config.

### 7. Dependency hygiene

Keep dependencies updated. Scan for known vulnerabilities as part of CI or release checks.

---

## Performance

### 1. Initial load

- lazy load routes and heavy features
- code-split large third-party libraries
- optimize bundle size (tree shaking, analyze bundles periodically)

### 2. Change detection and rendering

- avoid unnecessary re-renders (OnPush, memoization, signals, virtual DOM best practices)
- use track-by / stable keys in lists
- virtualize long lists when rendering performance degrades

### 3. Network efficiency

- debounce search inputs
- cancel in-flight requests when params change (switchMap, AbortController)
- cache stable reference data with TTL where appropriate
- prefetch likely next routes only when it measurably helps

### 4. Assets

- optimize images (format, size, lazy loading)
- use SVGs for icons; compress raster assets
- avoid loading unused font weights

### 5. Perceived performance

Use skeleton loaders, optimistic UI (where safe), and clear loading indicators so the app feels responsive even when the network is slow.

---

## Accessibility

- use semantic HTML and landmark regions
- ensure keyboard navigation for core flows
- associate labels with form controls
- provide visible focus states
- meet contrast requirements for text and interactive elements
- add `aria-*` attributes when native semantics are insufficient

Accessibility is not optional for production business applications.

---

## Error Handling and UX

Every data-driven screen should handle:

| State | Behavior |
|-------|----------|
| Loading | Spinner, skeleton, or disabled actions |
| Empty | Clear message and optional primary action |
| Validation error | Field-level or summary from backend |
| Server error | User-safe message; log details server-side |
| Success | Toast, banner, or inline confirmation |

Use a consistent notification/toast service for transient feedback.

Do not fail silently. Do not show raw stack traces or provider errors to users.

---

## Auth Pages

Typical auth screens (implement what the product requires):

- login
- register (if applicable)
- reset password / forgot password

Auth screens should use a minimal layout — not the main application shell.

---

## Testing

### 1. Unit tests

Test services, utilities, guards, and complex component logic with mocked dependencies.

### 2. Component tests

Test critical UI behavior: form validation, conditional rendering, error states.

### 3. E2E tests

Cover critical user journeys:

- login/logout
- main CRUD flows
- permission-restricted routes
- key workflow screens

### 4. Visual and direction testing

When i18n/RTL is required, verify layouts in both directions for complex screens.

---

## Naming and Consistency

- Page folders match business capabilities: `pages/<feature>/`.
- Services: `<Entity>Service`, `AuthService`.
- Components: `<Feature><Purpose>Component` or `<Feature>-<purpose>.component.ts`.
- Models: `<Entity>`, `Create<Entity>Request`, `List<Entity>Response`.
- Keep route paths kebab-case and aligned with API resource names where sensible.

---

## Conventions AI Should Follow

- Use router-driven pages, not manual view switching.
- Put HTTP logic in services, not in components or templates.
- Use environment/config files for URLs and client-safe settings.
- Use structured forms for all non-trivial input.
- Use one UI library/design system consistently.
- Handle loading, empty, error, and success states on every data screen.
- Lazy load features as the app grows.
- Guard authenticated and role-restricted routes.
- Keep folder structure organized into `core`, `shared`, and `pages` (or project equivalent).
- Prefer dedicated pages over modals for complex forms.
- Do not duplicate backend business logic on the client.

---

## What AI Should Not Do

- Do not hardcode API base URLs or secrets.
- Do not call backend endpoints directly from templates or page components.
- Do not put all screens in one component.
- Do not mix unrelated feature logic into `shared`.
- Do not use modal forms for large or complex entities.
- Do not ignore loading, empty, and error states.
- Do not create inconsistent CRUD patterns across features.
- Do not store auth tokens insecurely when safer options exist.
- Do not render untrusted HTML without sanitization.
- Do not treat frontend role checks as sufficient security.

---

## Mobile App Adaptation

This guide also covers **mobile client apps** (React Native, Expo, Flutter, SwiftUI, Jetpack Compose). The architectural principles are identical — only the platform primitives change. When building a mobile app:

- **Screens, not pages** — route-bound screens are the equivalent of pages. Specify them in `project/actions/<app-key>/views.md` (see `engine/templates/views-template.md`), not `pages.md`.
- **Native UI library** — use the platform's native component library / design system instead of a web UI library. Keep one consistent library per app.
- **Navigation** — use the platform's navigator (stack / bottom-tab / drawer / modal) in place of a web router; keep screens deep-linkable.
- **Same layering** — screen → data hook/service → HTTP client → API. No business logic in screens; no direct HTTP in components.
- **Reuse the backend** — a mobile app consumes the **same** shared API as the web apps. It must not duplicate business logic or call external providers (storage, AI, payments) directly — all traffic routes through the backend API.
- **Platform concerns** — document push notifications, offline/caching, gestures, biometrics, and permissions per screen.
- **States & i18n/RTL** — still handle loading / empty / error / success on every data screen, and respect RTL/localization where the product requires it.

Everything else in this document (services own HTTP, typed models, guards/auth, security, performance, accessibility) applies to mobile with the platform-native equivalent.

---

## Final Guidance

Treat this document as the default frontend (and mobile) convention for any project using this template. When the repository already has established patterns (framework choice, UI library, i18n approach, folder layout), follow the implemented code and project-specific docs. When starting fresh, use this guide to keep frontend work modular, secure, performant, accessible, and aligned with the backend API.
