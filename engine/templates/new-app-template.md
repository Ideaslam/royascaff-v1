# New App Template

Use this template when `change-type` is `new-app` in `6-changes/change-request.md`.

This template guides the AI through Step 5.1b — resolving the new application definition into a complete spec before any planning docs or code are changed.

---

## When to Use

- You want to create a new customer-facing portal (web or mobile)
- You want to create a new admin panel or internal tool
- You want to create a mobile app that uses the same backend
- You want to create a partner portal or any other standalone interface

The new app **reuses the existing `roya-ai-dynamo-api` backend**. It does not duplicate business logic. It selects which existing modules and features to expose and adds new ones only when strictly necessary.

---

## Field Reference

### `app-name`
Short human-readable name for the new app. Used as the folder/repo identifier.
Examples: `Customer Mobile App`, `Partner Portal`, `Ops Dashboard`

### `app-slug`
Lowercase kebab-case identifier derived from `app-name`. Used for file and repo names.
Examples: `mobile`, `partner-portal`, `ops-dashboard`

The new pages file will be named `4-actions/pages-<app-slug>.md`.

### `app-purpose`
One sentence: what this app does and who uses it.

### `target-platform`
| Value | Means |
|-------|-------|
| `web` | Browser-based SPA (Angular, React, Vue) |
| `mobile-ios` | Native iOS app (Swift/SwiftUI) |
| `mobile-android` | Native Android app (Kotlin/Compose) |
| `mobile-cross-platform` | Cross-platform mobile (React Native, Flutter, Expo) |
| `desktop` | Desktop app (Electron, Tauri) |

### `tech-stack`
Full stack specification.
Examples:
- `Angular 21 + PrimeNG + ngx-translate` (matches existing frontend pattern)
- `React Native + Expo + NativeWind`
- `Flutter + Riverpod`
- `React 19 + Tailwind CSS + shadcn/ui`

### `auth-strategy`
| Value | Means |
|-------|-------|
| `same-backend-jwt` | Uses the existing `/api/v1/auth` endpoints and JWT flow. Same user accounts. |
| `separate-auth` | New auth module or OAuth provider, separate user pool |
| `sso` | Single sign-on via existing auth (OAuth, SAML) |
| `none` | Fully public app, no authentication |

### `repo-location`
Where the new app lives.
Examples:
- `roya-ai-dynamo-mobile` (new sibling repo)
- `roya-ai-dynamo-partner-portal`
- `roya-ai-dynamo-frontend/projects/mobile` (monorepo sub-project)

---

## Module Selection Guide

When filling in the **Modules to Include** table, use the following guidance:

| Include value | Meaning |
|--------------|---------|
| `full` | Include all features of this module in the new app |
| `partial` | Include only the features listed in "Features included"; exclude the rest |
| `no` | This module is not relevant to the new app |

**Tips:**
- Start with what the target user actually needs — do not include admin modules in a customer app
- Backend-only modules (AI Processing, Background Jobs) are always included implicitly — they run on the server regardless
- Infrastructure modules (Caching, Storage, Email) are always included implicitly — they are backend concerns
- If a module is `partial`, always fill in both "Features included" and "Features excluded" columns

---

## Pages Spec for a New App

After Step 5.1b, the AI creates `4-actions/pages-<app-slug>.md` using `2-templates/pages-template.md` as the format.

For a new app, each page entry must also declare:
- **Platform notes** — any mobile-specific or platform-specific behavior (e.g. bottom navigation, native gestures, push notifications)
- **Reused endpoints** — backend endpoints from `4-actions/endpoints.md` that this page calls (no new endpoints if the feature already exists)
- **New endpoints needed** — if a feature requires data not available in existing endpoints, flag it here

---

## Example: Customer Mobile App

```markdown
# Change Request

## Metadata

- **date**: 2026-06-22
- **change-type**: new-app
- **target-app**: new-mobile-app
- **affected-repos**: new-repo:roya-ai-dynamo-mobile
- **priority**: high

---

## Scope

- Module(s): Auth, Projects, Dashboards, Notifications
- Feature(s): Login, Register, Project List, Dashboard Viewer, Notification Center

---

## Description

Create a mobile app (React Native + Expo) for end users to view their dashboards on iOS and Android. Users should be able to log in, browse their projects, open dashboards to view charts and KPIs, and receive push notifications. The mobile app uses the same backend JWT auth — no new user accounts. No CSV upload or AI generation from mobile; viewing only.

---

## New App Definition

- **app-name**: Customer Mobile App
- **app-purpose**: Mobile viewer for existing dashboards — lets customers browse projects and view AI-generated dashboards on iOS and Android.
- **target-platform**: mobile-cross-platform
- **tech-stack**: React Native + Expo + NativeWind + React Query
- **auth-strategy**: same-backend-jwt

### Modules to Include from Existing Codebase

| Module | Include? | Features included | Features excluded |
|--------|:--------:|-------------------|-------------------|
| Auth | full | Login, Logout, Password Reset | Register (users sign up on web) |
| Users | partial | Own Profile View | Admin Edit User, User List |
| Projects | partial | List Projects, View Project | Create/Edit/Delete Project |
| Data (CSV) | no | — | All (no upload from mobile) |
| AI Processing | no | — | All (background only, no mobile trigger) |
| Dashboards | partial | View Dashboard, View Widget Data | Create, Edit, Delete, Duplicate |
| Sharing | partial | View Shared Dashboard | Create/Delete Share Links |
| Export | no | — | All (not needed on mobile) |
| Notifications | full | In-App Notification Center, Mark Read | — |
| Subscriptions | partial | View Own Plan | Admin Manage Subscriptions |

### New Modules / Features (specific to this app)

- Push Notifications: Mobile push via Expo Notifications — triggered by the same notification events as web, delivered to device

### App-Specific Pages

1. Login — email + password login form, "Forgot password" link
2. Projects List — scrollable list of the user's projects with last-updated date
3. Project Detail — list of dashboards in the project
4. Dashboard Viewer — full-screen dashboard with scrollable widget grid; charts, KPIs, maps rendered natively
5. Notifications — notification list, mark as read
6. Profile — view and edit own profile

---

## Acceptance Criteria

1. User can log in with existing credentials and receive a JWT.
2. Projects list shows all projects the user owns or has access to.
3. Dashboard Viewer renders all widget types from `shared/widgets/` in a native mobile layout.
4. Notifications show unread count badge and allow mark-all-read.
5. App works on iOS 16+ and Android 11+.
6. No direct calls to Cloudflare R2 or Anthropic from the mobile app.
```

---

## Checklist for Step 5.1b (AI uses this)

When processing a `new-app` change request, the AI confirms all of the following before proceeding:

- [ ] `app-name`, `app-purpose`, `target-platform`, `tech-stack`, `auth-strategy` are all filled in
- [ ] Every module in the "Modules to Include" table has an Include value of `full`, `partial`, or `no`
- [ ] For `partial` modules, both "Features included" and "Features excluded" columns are filled in
- [ ] All included features exist in `3-plan/features.md` (or are listed as new)
- [ ] All new modules/features are explicitly listed so Step 5.2 can add them
- [ ] The app-specific pages list is complete enough to generate a full pages spec
- [ ] `auth-strategy` is resolved — for `same-backend-jwt`, confirm `/api/v1/auth/login` and `/api/v1/auth/refresh` exist in `4-actions/endpoints.md`
- [ ] For mobile apps: the tech stack is confirmed and does not require any backend changes to support (REST API is sufficient)
- [ ] The new pages spec `4-actions/pages-<app-slug>.md` has been created and is complete
