# System Profile Template

This template defines the structure for `project/profile.md` — the single home for a system's **concrete facts**: product, applications, repositories, tech stack, brand tokens, environments, and integrations.

`profile.md` is the bridge between the generic **engine** and the specific system. The engine never hardcodes a repo name, brand color, stack, or provider — it always refers to the values here. So this file must be accurate and kept up to date: when an app, repo, stack, brand color, or provider changes, update it **here**, not in the engine.

This template is produced in **Phase 0, Step 0.0b** of `engine/flow.md`.

---

## How to Use This Template

1. Create `project/profile.md` from the **Profile Block** below.
2. Replace every `[placeholder]` with the system's real values. Keep every section header — other docs and the engine read them by name.
3. **Existing codebase** → derive each value from the actual repos (read `package.json`/config, the source layout, the env files, the styles). Do not guess.
4. **Greenfield build** → fill in the intended choices; mark anything undecided as `TBD` and resolve it before Phase 1.
5. Run the **Completion Checklist** at the bottom before moving on.

The **Applications** table is the most important section: its **Key** column defines the `target-app` values used in change requests **and** the per-app folder names under `project/actions/`. Get the keys right first.

---

## Field Reference

### `Product`

The one-paragraph identity of the system.

| Field | Meaning |
|-------|---------|
| `Name` | Product/system name |
| `Summary` | 2–3 sentences: what it does and the core value |
| `Type` | e.g. SaaS web app, mobile app, internal tool, API platform |
| `Primary users` | Who uses it (roles/personas) |

### `Applications`

Every deployable app/surface in the solution — one row each. This drives the whole framework.

| Column | Meaning |
|--------|---------|
| `Key` | Short kebab-case id (e.g. `backend`, `customer-portal`, `admin-panel`, `customer-mobile`). **This is the `target-app` value and the `project/actions/<key>/` folder name.** Keep it stable. |
| `App` | Human-readable name |
| `Type` | `api`, `web`, `mobile-ios`, `mobile-android`, or `mobile-cross-platform` |
| `Repo` | The repository that holds this app |
| `Framework` | Primary framework + version (e.g. NestJS, Angular 21, React Native + Expo, Flutter) |
| `UI library` | The app's component library (`—` for an API). For mobile, the native/platform UI library. |
| `Auth strategy` | How this app authenticates (e.g. JWT issuer, same-backend JWT, same-backend JWT + admin role, separate auth, SSO, none) |

The **App key ↔ action specs** sub-table maps each app type to the spec files it owns:

| Type value | Action folder | Spec files |
|------------|---------------|-----------|
| `api` | `project/actions/<key>/` | `services.md`, `endpoints.md` |
| `web` | `project/actions/<key>/` | `pages.md` |
| `mobile-*` | `project/actions/<key>/` | `views.md` |

> **Mobile apps are first-class.** To add one, append a row with a `mobile-*` Type, its own Key, repo, framework, and native UI library; its screens are specified in `project/actions/<key>/views.md` (see `engine/templates/views-template.md`). Mobile (and any new app) reuses the existing API — no duplicated business logic — and routes all traffic through the API (no direct external-provider calls).

### `Repositories`

The technical repos behind the apps. Include role and where each lives relative to the workspace root, plus the active branch if relevant. One app may share a repo with others (monorepo), or each app may have its own.

### `Tech Stack`

The concrete stack per layer (backend, each frontend/mobile). List language/runtime, framework, database/ORM, async/jobs, key libraries, and the **source layout** (folder structure) so codegen places files correctly. Reference the generic rules (`engine/rules/backend-rule.md`, `engine/rules/frontend-rule.md`) rather than restating them.

### `Brand Tokens`

The design tokens that define the product's look: colors (with their CSS variable names and hex), typography, and where they are defined in code. Used for UI generation and screenshot/style review. For an API-only system, mark `N/A`.

### `Environments`

Where config/secrets live, the API base URL mechanism, how the backend reads secrets, and the named environments (e.g. development, staging, production).

### `Integrations`

Every third-party provider, with its purpose and notes. State that each is isolated behind an interface/adapter and that the frontend never calls them directly — all traffic routes through the API. Note which are swappable and how the implementation is selected (env var / DI token).

### `System Conventions`

Cross-cutting rules that are facts about *this* system (not generic engine rules): i18n/RTL expectations, source-of-truth rules, app-reuse rules, etc.

---

## Profile Block

Copy everything between the triple-dashes below into `project/profile.md` and fill it in.

---

```markdown
# System Profile

> The single home for this system's concrete facts: applications, repositories, tech stack, brand
> tokens, environments, and integrations. The **engine** (`../engine/`) is generic and refers to the
> values here — it never hardcodes them. When an app, repo, stack, brand color, or provider changes,
> update it **here**, not in the engine.

---

## Product

- **Name**: [product name]
- **Summary**: [2–3 sentences: what it does and the core value]
- **Type**: [e.g. SaaS web app | mobile app | internal tool | API platform]
- **Primary users**: [roles / personas]

---

## Applications

| Key | App | Type | Repo | Framework | UI library | Auth strategy |
|-----|-----|------|------|-----------|-----------|---------------|
| `[key]` | [App name] | [api \| web \| mobile-*] | `[repo]` | [framework] | [UI library or —] | [auth strategy] |
| `[key]` | [App name] | [api \| web \| mobile-*] | `[repo]` | [framework] | [UI library or —] | [auth strategy] |

`target-app` values used in change requests resolve against this table. `all-apps` = all repos above.

### App key ↔ action specs

The **Key** is also the folder name under `project/actions/`. Each app's specs live in its own folder, by type:

| Type value | Action folder | Spec files |
|------------|---------------|-----------|
| `api` | `project/actions/<key>/` | `services.md`, `endpoints.md` |
| `web` | `project/actions/<key>/` | `pages.md` |
| `mobile-ios` / `mobile-android` / `mobile-cross-platform` | `project/actions/<key>/` | `views.md` |

Adding a new app means adding a row above **and** creating its folder under `project/actions/`.

### Adding a mobile app

A mobile app is a first-class application. To add one, append a row with a `mobile-*` **Type**, its own
**Key**, repo, framework, and native UI library. Its screens are specified in
`project/actions/<key>/views.md` (see `engine/templates/views-template.md`). Mobile apps reuse the
existing API — no duplicated business logic — and route all traffic through the API.

---

## Repositories

| Repo | Role | Location (workspace root) | Active branch |
|------|------|---------------------------|---------------|
| `[repo]` | [role] | `[relative path]` | `[branch]` |

---

## Tech Stack

**[Backend / API app] (`[repo]`)**
- [language + framework, architecture]
- [database + ORM/driver]
- [async / jobs / cache]
- [layering, per `../engine/rules/backend-rule.md`]
- Source layout: `[folder structure]`

**[Frontend / mobile app(s)] (`[repo]`)**
- [framework + key libraries]
- [UI library + icons + theming]
- [charts / grids / other notable libs]
- [i18n / RTL approach]
- Source layout: `[folder structure]`
- All API traffic goes through the configured API base URL — no direct external URLs in components/services
  (per `../engine/rules/frontend-rule.md`)

---

## Brand Tokens

[Where tokens are defined in code, or `N/A` for API-only systems.]

| Token | Value | Role |
|-------|-------|------|
| `[--token]` | `[#hex]` | [role] |

Typography: [headings/body notes, theme customization].

---

## Environments

- [Where frontend/mobile config lives]
- [API base URL mechanism]
- [How the backend reads secrets/providers]
- Environments: [development | staging | production | ...]

---

## Integrations

Every provider is isolated behind an interface/adapter (per `../engine/rules/backend-rule.md` and the
system rules in `rules.md`). The frontend never calls these directly — all traffic routes through the API.

| Provider | Purpose | Notes |
|----------|---------|-------|
| [Provider] | [purpose] | [swappable? selection mechanism, env var/DI token] |

---

## System Conventions

- [i18n / RTL expectation]
- [source-of-truth rule, e.g. backend owns calculated values]
- [new apps reuse the existing API — no duplicated business logic]
- [any other cross-cutting system fact]
```

---

## Completion Checklist

Before leaving Step 0.0b, confirm:

- [ ] **Product** name, summary, type, and primary users are filled in
- [ ] Every deployable app/surface has a row in **Applications** with a stable kebab-case **Key**
- [ ] Each app's **Type** is one of `api` / `web` / `mobile-*`, and the **App key ↔ action specs** mapping holds
- [ ] Every app has a matching folder under `project/actions/<key>/` (or one is scheduled to be created)
- [ ] **Repositories** lists every repo with role and location
- [ ] **Tech Stack** documents each layer's stack **and source layout**
- [ ] **Brand Tokens** are captured (or marked `N/A`)
- [ ] **Environments** describes config/secrets and the API base URL mechanism
- [ ] Every third-party provider appears in **Integrations** and is marked as isolated behind the API
- [ ] **System Conventions** captures the cross-cutting facts of this system
- [ ] No `[placeholder]` or `TBD` values remain (for a greenfield build, all `TBD`s are resolved before Phase 1)
