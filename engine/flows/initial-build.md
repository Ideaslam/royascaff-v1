# AI-Control Engine — Initial Build Flow (Phases 0–4)

Use this flow once to go from product description to a fully built, verified application.
Follow each phase in order. Each step declares **Inputs**, **Template**, **Output**, and **Done-when** criteria.

---

## Phase 0 — Understand

**Goal**: Produce a complete, unambiguous product specification in `project/description.md` and a confirmed system profile in `project/profile.md`.

### Step 0.0 — Choose Description Path

- **Input**: `project/description.md` (optional — may not exist yet)
- **Output**: Decision — Path A or Path B

| Path | When |
|------|------|
| **A — Full description** | `project/description.md` exists with substantive content: product purpose, primary user, core workflow, core features, key entities all described; no `[placeholder]` or `TBD` remains |
| **B — Step-by-step** | Any of the above is false, or file does not exist |

- **Done when**: Path A or Path B is selected and recorded.

### Step 0.0b — Establish System Profile

- **Input**: existing repos/code (if any), the description
- **Template**: `engine/templates/profile-template.md`
- **Output**: `project/profile.md`
- **Actions**: Confirm or create `project/profile.md` — applications, repositories, tech stack, brand tokens, environments, integrations. For existing codebases derive from actual repos; for greenfield fill intended choices. Get the **Applications** table right first — its **Key** column defines `target-app` values and `project/actions/<key>/` folder names.
- **Done when**: `project/profile.md` exists, template checklist is satisfied, and it lists apps, repos, stack, brand, environments, and integrations.

### Step 0.1A — Adopt Full Description (Path A)

- **Input**: `project/description.md`
- **Output**: `project/description.md` (validated; minor edits only)
- **Actions**:
  1. Read `project/description.md` as authoritative.
  2. Run Done-when checklist; fix only gaps, ambiguities, or formatting.
  3. Do **not** replace with template layout unless explicitly asked.
- **Done when**: Product purpose clear, primary user + workflow described, core features listed, key entities identified, integrations/constraints documented, no TBD placeholders.

Proceed to **Phase 1**.

### Step 0.1B — Build Description Step-by-Step (Path B)

- **Input**: `project/description.md` (empty, partial, or missing)
- **Template**: `engine/templates/description-template.md`
- **Output**: `project/description.md` (built section by section)
- **Actions**:
  1. Walk through each template section (1–11) with the user.
  2. For each: ask for info, draft section, confirm, proceed.
  3. Do not skip to Phase 1 until template **Completion Checklist** is satisfied.
  4. Final pass: review for consistency, remove leftover placeholders.
- **Done when**: All template sections filled or N/A, template checklist satisfied, no TBD placeholders.

Proceed to **Phase 1**.

---

## Phase 1 — Plan

**Goal**: Generate planning documents — modules (with features), custom rules, and data model. Outputs land in `project/plan/` and `project/rules.md`.

### Step 1.1 — Create Modules & Features Map

- **Input**: `project/description.md`
- **Template**: `engine/templates/modules-template.md`
- **Output**: `project/plan/modules.md`
- **Done when**:
  - All business capabilities grouped into named modules
  - Each module declares backend/frontend scope and dependencies
  - All product features listed under the correct module with visibility (frontend/backend-only/both)
  - Feature names are stable and reusable
  - No orphaned features outside modules

### Step 1.2 — Create Custom Feature Rules

- **Input**: `project/description.md`, `project/plan/modules.md`
- **Template**: `engine/templates/custom-feature-rules-template.md`
- **Output**: `project/rules.md`
- **Done when**:
  - Project-specific rules documented (AI usage, integrations, async jobs, security)
  - Each rule references a specific module and feature
  - Provider/integration requirements explicit
  - Constraints and forbidden behaviors clear
  - Generic rules remain in `engine/rules/` only

### Step 1.3 — Create Data Model

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/rules.md`
- **Template**: `engine/templates/data-model-template.md`
- **Output**: `project/plan/data-model.md`
- **Done when**:
  - All persistent entities defined with schema shapes per project database (per `project/profile.md`)
  - Field types, required flags, and constraints documented
  - Relationships (references vs embedded) explicit
  - Index recommendations provided
  - Enum types declared
  - Validation rules stated

---

## Phase 2 — Actions

**Goal**: Generate service map, endpoint specs, and client (page/view) specs. Outputs land in per-app folders under `project/actions/<app-key>/`.

**Call chain** (dependency direction):
```
<app>/pages/ → <api-app>/endpoints/ → <api-app>/services/ → repositories / external providers
```

Create services before endpoints, endpoints before client specs.

**Status at spec time**: Every artifact created in Phase 2 starts with **status `planned`** (no code exists yet — see `engine/conventions.md`). Each `_index.md` registry (`engine/templates/index-template.md`) records the per-module rolled-up status and `Done/Total` count — at this phase every module is `planned` with `0/N` done.

### Step 2.1 — Create Services Map

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/data-model.md`, `engine/rules/backend-rule.md`, `project/rules.md`
- **Template**: `engine/templates/services-template.md`
- **Output**: `project/actions/<api-app>/services/_index.md` + per-module files in `services/`
- **Done when**:
  - Every backend-relevant feature covered by at least one **internal** service
  - Services grouped by module
  - Each service declares type (`internal`/`external`), public methods, dependencies
  - Internal services own business logic, may use repositories and other services
  - External services wrap third-party integrations per `engine/rules/backend-rule.md` isolation rules
  - All referenced entities/DTOs exist in `data-model.md`
  - Every external API has a corresponding external service

### Step 2.2 — Create Endpoints Specification

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/data-model.md`, `project/actions/<api-app>/services/_index.md`, `engine/rules/backend-rule.md`, `project/rules.md`
- **Template**: `engine/templates/endpoints-template.md`
- **Output**: `project/actions/<api-app>/endpoints/_index.md` + per-module files in `endpoints/`
- **Done when**:
  - Every backend-relevant feature has at least one endpoint
  - Endpoints grouped by module
  - Each endpoint declares method, route, auth, input, output, constraints
  - Each endpoint declares which **services** it calls (must exist in `services/`)
  - Endpoints do not call repositories or external providers directly
  - CRUD patterns follow `engine/rules/backend-rule.md`
  - Custom feature rules reflected
  - All referenced DTOs/entities exist in `data-model.md`

### Step 2.3 — Create Client Specifications (Pages / Views) — one per app

Create one client spec per frontend app. Web → `pages/`, Mobile → `views/`. Repeat for each frontend app.

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/data-model.md`, `project/actions/<api-app>/endpoints/_index.md`, `engine/rules/frontend-rule.md`, `project/rules.md`
- **Template**: `engine/templates/pages-template.md` (web) or `engine/templates/views-template.md` (mobile)
- **Output**: `project/actions/<app-key>/pages/` (web) or `project/actions/<app-key>/views/` (mobile)
- **Done when**:
  - Every frontend-visible feature has at least one page/view in the relevant app
  - Pages/views grouped by module
  - Each page/view declares route, components, frontend services, models, and **endpoints** used
  - Pages/views call frontend HTTP services only — not backend services directly
  - UI states (loading/empty/error/success) documented
  - Frontend/mobile patterns follow `engine/rules/frontend-rule.md`
  - All referenced endpoints exist in the API app's `endpoints/`
  - Custom feature rules reflected

---

## Phase 3 — Build

**Goal**: Generate backend and frontend code into the repositories defined in `project/profile.md`.

**Status maintenance (applies to every build step)**: As each artifact is implemented, update its **status** in the spec file and the module's `_index.md`:
- fully implemented & matches spec → `done`
- started but incomplete → `partial` (note what remains)
- intentionally skipped for now → `deferred` (note the reason)
- not started → leave `planned`

This is how a later model knows exactly what is left. Keep each `_index.md` `Done/Total` count in sync.

### ⛔ Pre-Build Confirmation Gate (MANDATORY — do not skip)

Before writing **any** code, present the following for explicit user approval:

1. **What will be built** — every backend module, schema, service, controller, endpoint from planning docs
2. **What will be created on the frontend** — every page, component, service, route per app
3. **Target repos/folders** — exact paths from `project/profile.md`
4. **Frontend visual approach** — design system, brand tokens, UI library (from `project/profile.md`); reference screenshot/mockup/Figma if available

End with: **"Can I proceed with building the code?"**

Wait for explicit confirmation. Do not interpret silence, ambiguous replies, or follow-up questions as confirmation. If user requests changes, update planning docs and re-present.

### Step 3.1 — Generate Backend Code

- **Input**: `project/plan/data-model.md`, `project/actions/<api-app>/services/`, `project/actions/<api-app>/endpoints/`, `engine/rules/backend-rule.md`, `project/rules.md`
- **Output**: Code in backend repo per `project/profile.md`
- **Done when**:
  - All modules have backend folders
  - All schemas from `data-model.md` implemented
  - All services (internal + external) implemented
  - All endpoints implemented
  - Layered architecture (controller → service → repository) followed
  - Auth guards, validation DTOs, error handling in place
  - Integration providers isolated per `engine/rules/backend-rule.md`
  - Custom feature rules implemented
  - **Status updated**: every built service/endpoint set to `done` (or `partial`/`deferred` with a note); `services/_index.md` and `endpoints/_index.md` `Done/Total` counts refreshed

### Step 3.2 — Generate Frontend Code (per app)

- **Input**: `project/actions/<app-key>/pages/` or `views/`, `project/actions/<api-app>/endpoints/`, `engine/rules/frontend-rule.md`, `project/rules.md`
- **Output**: Code in frontend/mobile repo per `project/profile.md`
- **Done when**:
  - All pages/views from app spec implemented
  - All components, services, models created
  - Routing follows `engine/rules/frontend-rule.md`
  - Auth guards protect routes correctly
  - All pages handle loading/empty/error/success states
  - API calls use services, not direct HTTP in components
  - Custom feature rules respected
  - **Status updated**: every built page/view set to `done` (or `partial`/`deferred` with a note); the app's `pages/_index.md` or `views/_index.md` `Done/Total` counts refreshed

---

## Phase 4 — Verify

**Goal**: Run consistency checks across all documents and code.

### Cross-Document Consistency Checks

Run these checks and fix any gaps:

1. **Module-to-Feature Coverage** — every module in `modules.md` has features; no features outside modules
2. **Feature-to-Service Coverage** — every backend-relevant feature has ≥1 internal service; every integration has an external service; no orphaned services
3. **Feature-to-Endpoint Coverage** — every backend-relevant feature has ≥1 endpoint; no orphaned endpoints
4. **Endpoint-to-Service Linking** — every endpoint declares called services; those services exist; no direct repository/provider references
5. **Feature-to-Page Coverage** — every frontend-visible feature has ≥1 page; no orphaned pages
6. **Entity Consistency** — all entities in services/endpoints/pages are defined in `data-model.md`; all DTOs exist or are derivable
7. **Endpoint-to-Page Linking** — every endpoint in a page's "Backend Endpoints Used" exists in `endpoints/`; routes and methods match
8. **Auth Coverage** — every protected endpoint declares auth; every protected page declares route guard; consistent across BE/FE
9. **Custom Rules Compliance** — `project/rules.md` constraints reflected in services/endpoints/pages/code
10. **UI State Coverage** — every data-driven page documents loading/empty/error/success; forms have validation; lists have pagination + empty states
11. **Path and Naming Consistency** — no dead/stale paths; names consistent across all files
12. **Code Layering Compliance** — BE: controller → service → repository; FE: page → frontend service → endpoint; no business logic in controllers/components; integration providers isolated
13. **Frontend Third-Party Isolation** — every HTTP call targets configured `apiUrl`; no hardcoded external URLs; no direct third-party calls from frontend — zero tolerance
14. **Self-Contained Blueprint** — no `engine/` file contains system-specific data; `project/` docs reference only other `project/` docs and `engine/rules/`; copying `project/` alone is enough to rebuild
15. **Build Status Coverage** — every service/endpoint/page/view carries a status; each `_index.md` rollup + `Done/Total` matches the per-artifact statuses; anything not `done` is either `planned`, `partial`, or `deferred` (with a reason). Code that exists but is spec'd as `planned` is a drift — fix the status.

### Step 4.1 — Generate the Status Dashboard

- **Template**: `engine/templates/status-template.md`
- **Output**: `project/status.md`
- **Actions**: Roll up the per-artifact statuses and `_index.md` counts into the system dashboard: per-app snapshot, per-module table, **In Progress** (`partial`), **Next Up** (ordered roadmap of `planned` work in build order), and **Deferred** (with reasons). This is the file a future model reads first to know where the build stands.
- **Done when**: `project/status.md` exists and its counts match every `_index.md`.

### Verification Report

Save to `project/verify/verification-report.md`:

```markdown
# Verification Report

## Status: [PASS | ISSUES FOUND]

## Module Coverage: [✓ | ✗]
## Feature Coverage: [✓ | ✗]
## Service Coverage: [✓ | ✗]
## Endpoint-Service Linking: [✓ | ✗]
## Entity Consistency: [✓ | ✗]
## Endpoint-Page Linking: [✓ | ✗]
## Auth Coverage: [✓ | ✗]
## Custom Rules Compliance: [✓ | ✗]
## UI State Coverage: [✓ | ✗]
## Path Consistency: [✓ | ✗]
## Code Layering: [✓ | ✗]
## Frontend Third-Party Isolation: [✓ | ✗]
## Self-Contained Blueprint: [✓ | ✗]
## Build Status Coverage: [✓ | ✗]

## Summary
[Overall assessment and recommended fixes]
```

---

## Done

When all phases complete and verification passes, the framework has produced:

- Confirmed system profile in `project/profile.md`
- Complete planning documents in `project/plan/`
- Complete action specs in `project/actions/` — one folder per app
- Project-specific rules in `project/rules.md`
- Backend code following all specifications
- Frontend code following all specifications
- Verification report in `project/verify/`
- Build-status dashboard in `project/status.md` (per-artifact status in specs + `_index.md`, rolled up system-wide)

The system is ready for testing and iteration. Use `engine/flows/change-mode.md` for all subsequent changes.
