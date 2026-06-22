# AI-Control Framework — Orchestration Guide

## Overview

This framework drives AI from a product description through planning, action specifications, code generation, and verification to produce a complete, consistent application.

Follow each phase in order. Each step declares its **Inputs**, **Template**, **Output**, and **Done-when** criteria.

### Description entry (Phase 0)

Phase 0 supports two paths:

| Path | When | What happens |
|------|------|--------------|
| **A — Full description** | `1-description.md` exists and is a complete product spec you wrote | Validate it, normalize if needed, and use it as the authoritative source. Skip the template walkthrough. |
| **B — Step-by-step** | `1-description.md` is missing, empty, or incomplete | Work through `2-templates/description-template.md` section by section with you until `1-description.md` is complete. |

Place your full description in **`1-description.md`** before starting Phase 0 if you already have one. Otherwise, start with an empty or partial file and the AI will guide you through the template.

---

## Phase 0 — Understand

### Goal
Produce a complete, unambiguous product specification in `1-description.md` that AI can use as the authoritative source for all downstream planning.

### Step 0.0 — Choose Description Path

- **Input**: `1-description.md` (optional — may not exist yet)
- **Output**: Decision — Path A or Path B
- **How to decide**:

  **Use Path A** when `1-description.md` exists **and** all of the following are true:
  - File has substantive content (not empty or placeholder-only)
  - Product purpose, primary user, and core workflow are described
  - Core features are listed
  - Key entities/data are identified (or explicitly marked N/A)
  - No unresolved `[placeholder]`, `TBD`, or template boilerplate remains

  **Use Path B** when any of the above is false, or when the file does not exist.

- **Done when**: Path A or Path B is selected and recorded before continuing.

---

### Step 0.1A — Adopt Full Description (Path A)

Use this step when Step 0.0 selects **Path A**.

- **Input**: `1-description.md` (your complete product spec)
- **Template**: None — do not rewrite from scratch
- **Output**: `1-description.md` (validated; minor edits only if needed for clarity or consistency)
- **Actions**:
  1. Read `1-description.md` as the authoritative product description.
  2. Run the **Done-when** checklist below. Fix only gaps, ambiguities, or formatting issues — preserve your wording and structure unless a section is truly missing.
  3. Do **not** replace the document with the template layout unless you explicitly ask for that.
- **Done when**:
  - Product purpose is clear
  - Primary user and workflow are described
  - Core features are listed
  - Key entities/data are identified
  - Integrations and constraints are documented
  - No incomplete sentences or "TBD" placeholders remain

When Step 0.1A is done, proceed directly to **Phase 1 — Plan**.

---

### Step 0.1B — Build Description Step-by-Step (Path B)

Use this step when Step 0.0 selects **Path B**.

- **Input**: `1-description.md` (empty, partial, or missing — create the file if needed)
- **Template**: `2-templates/description-template.md`
- **Output**: `1-description.md` (built section by section)
- **Actions**:
  1. Open `2-templates/description-template.md` and treat each numbered section as a separate step (1. Product Summary → 11. Additional Context).
  2. For each section: ask for the information needed, draft or refine that section in `1-description.md`, confirm with the user, then move to the next section.
  3. Do not skip ahead to Phase 1 until the **Completion Checklist** at the bottom of the template is satisfied.
  4. On the final pass, review the full document for consistency and remove any leftover template placeholders.
- **Done when**:
  - All template sections are filled in or marked "N/A"
  - Product purpose is clear
  - Primary user and workflow are described
  - Core features are listed
  - Key entities/data are identified
  - Integrations and constraints are documented
  - No incomplete sentences or "TBD" placeholders remain
  - Template **Completion Checklist** is satisfied

When Step 0.1B is done, proceed to **Phase 1 — Plan**.

---

## Phase 1 — Plan

### Goal
Generate the planning documents that define modules, features, services, custom rules, and data model. Outputs land in `3-plan/` and `5-rules/`.

### Step 1.1 — Create Modules Map

- **Input**: `1-description.md`
- **Template**: `2-templates/modules-template.md`
- **Output**: `3-plan/modules.md`
- **Done when**:
  - All business capabilities are grouped into named modules
  - Each module declares backend/frontend scope
  - Module dependencies are documented
  - No orphaned features exist outside modules

### Step 1.2 — Create Features Map

- **Input**: `1-description.md`, `3-plan/modules.md`
- **Template**: `2-templates/features-template.md`
- **Output**: `3-plan/features.md`
- **Done when**:
  - Every module from `modules.md` has a corresponding section
  - All product features are listed under the correct module
  - Each feature declares visibility (frontend/backend-only/both)
  - Feature names are stable and reusable

### Step 1.3 — Create Custom Feature Rules

- **Input**: `1-description.md`, `3-plan/modules.md`, `3-plan/features.md`
- **Template**: `2-templates/custom-feature-rules-template.md`
- **Output**: `5-rules/custom-feature-rules.md`
- **Done when**:
  - Project-specific rules are documented (AI usage, integrations, async jobs, security)
  - Each rule references a specific module and feature
  - Provider/integration requirements are explicit
  - Constraints and forbidden behaviors are clear
  - Generic rules remain in `backend-rule.md` / `frontend-rule.md` only

### Step 1.4 — Create Data Model

- **Input**: `1-description.md`, `3-plan/modules.md`, `3-plan/features.md`, `5-rules/custom-feature-rules.md`
- **Template**: `2-templates/data-model-template.md`
- **Output**: `3-plan/data-model.md`
- **Done when**:
  - All persistent entities are defined with Mongoose shapes
  - Field types, required flags, and constraints are documented
  - Relationships (references vs embedded) are explicit
  - Index recommendations are provided
  - Enum types are declared
  - Validation rules are stated

### Step 1.5 — Create Services Map

- **Input**:
  - `1-description.md`
  - `3-plan/modules.md`
  - `3-plan/features.md`
  - `3-plan/data-model.md`
  - `5-rules/backend-rule.md`
  - `5-rules/custom-feature-rules.md`
- **Template**: `2-templates/services-template.md`
- **Output**: `3-plan/services.md`
- **Done when**:
  - Every backend-relevant feature is covered by at least one **internal** service
  - Services are grouped by module
  - Each service declares type (`internal` or `external`), public methods, and dependencies
  - **Internal** services own business logic and may use repositories and other services
  - **External** services wrap third-party integrations and follow `backend-rule.md` isolation rules
  - All referenced entities and DTOs exist in `data-model.md`
  - No orphaned integration — every external API from the description has a corresponding **external** service

---

## Phase 2 — Actions

### Goal
Generate endpoint and page specifications. Outputs land in `4-actions/`.

**Call chain** (dependency direction):

```text
pages → endpoints → services → repositories / external providers
```

Create **`3-plan/services.md` (Phase 1)** before endpoints. Endpoints must call services — not repositories or external APIs directly.

### Step 2.1 — Create Endpoints Specification

- **Input**: 
  - `1-description.md`
  - `3-plan/modules.md`
  - `3-plan/features.md`
  - `3-plan/data-model.md`
  - `3-plan/services.md`
  - `5-rules/backend-rule.md`
  - `5-rules/custom-feature-rules.md`
- **Template**: `2-templates/endpoints-template.md`
- **Output**: `4-actions/endpoints.md`
- **Done when**:
  - Every backend-relevant feature has at least one endpoint
  - Endpoints are grouped by module
  - Each endpoint declares method, route, auth, input, output, and constraints
  - Each endpoint declares which **services** it calls (must exist in `services.md`)
  - Endpoints do not call repositories or external providers directly
  - CRUD patterns follow `backend-rule.md` conventions
  - Custom feature rules are reflected in endpoint notes
  - All referenced DTOs and entities exist in `data-model.md`

### Step 2.2 — Create Pages Specification

- **Input**: 
  - `1-description.md`
  - `3-plan/modules.md`
  - `3-plan/features.md`
  - `3-plan/data-model.md`
  - `4-actions/endpoints.md`
  - `5-rules/frontend-rule.md`
  - `5-rules/custom-feature-rules.md`
- **Template**: `2-templates/pages-template.md`
- **Output**: `4-actions/pages.md`
- **Done when**:
  - Every frontend-visible feature has at least one page
  - Pages are grouped by module
  - Each page declares route, components, frontend services, models, and **endpoints** used
  - Pages do not call backend services directly — only frontend HTTP services that call endpoints
  - UI states (loading/empty/error/success) are documented
  - Frontend patterns follow `frontend-rule.md` conventions
  - All referenced endpoints exist in `endpoints.md`
  - Custom feature rules are reflected in page notes

---

## Phase 3 — Build

### Goal
Generate backend and frontend code into the repository following all planning documents and rules.

### Step 3.1 — Generate Backend Code

- **Input**: 
  - `3-plan/data-model.md`
  - `3-plan/services.md`
  - `4-actions/endpoints.md`
  - `5-rules/backend-rule.md`
  - `5-rules/custom-feature-rules.md`
- **Output**: Code in `src/` (or project-specific backend folder)
- **Done when**:
  - All modules from `modules.md` have corresponding backend folders
  - All schemas from `data-model.md` are implemented
  - All services from `services.md` are implemented (internal + external)
  - All endpoints from `endpoints.md` are implemented
  - Layered architecture (controller → service → repository) is followed
  - Endpoints call services only — not repositories or external SDKs directly
  - Auth guards, validation DTOs, and error handling are in place
  - Integration providers are isolated per `backend-rule.md`
  - Custom feature rules are implemented correctly

### Step 3.2 — Generate Frontend Code

- **Input**: 
  - `4-actions/pages.md`
  - `4-actions/endpoints.md`
  - `5-rules/frontend-rule.md`
  - `5-rules/custom-feature-rules.md`
- **Output**: Code in `client/src/app/` (or project-specific frontend folder)
- **Done when**:
  - All pages from `pages.md` are implemented
  - All components, services, and models are created
  - Routing follows `frontend-rule.md` conventions
  - Auth guards protect routes correctly
  - All pages handle loading/empty/error/success states
  - API calls use services, not direct HTTP in components
  - Custom feature rules are respected

---

## Phase 4 — Verify

### Goal
Run consistency checks across all documents and code to ensure completeness and correctness.

### Cross-Document Consistency Checks

Run these checks and fix any gaps:

1. **Module-to-Feature Coverage**
   - Every module in `3-plan/modules.md` has features in `3-plan/features.md`
   - No features exist outside defined modules

2. **Feature-to-Service Coverage**
   - Every backend-relevant feature is covered by at least one internal service in `3-plan/services.md`
   - Every third-party integration has a corresponding external service
   - No orphaned services that don't map to features

3. **Feature-to-Endpoint Coverage**
   - Every backend-relevant feature has at least one endpoint in `4-actions/endpoints.md`
   - No orphaned endpoints that don't map to features

4. **Endpoint-to-Service Linking**
   - Every endpoint declares which services it calls
   - Every service referenced by an endpoint exists in `3-plan/services.md`
   - Endpoints do not reference repositories or external providers directly

5. **Feature-to-Page Coverage**
   - Every frontend-visible feature has at least one page in `4-actions/pages.md`
   - No orphaned pages that don't map to features

6. **Entity Consistency**
   - All entities referenced in `services.md`, `endpoints.md`, and `pages.md` are defined in `data-model.md`
   - All DTOs mentioned in services and endpoints exist in `data-model.md` or are derivable from entities

7. **Endpoint-to-Page Linking**
   - Every endpoint listed in a page's "Backend Endpoints Used" exists in `endpoints.md`
   - Routes and HTTP methods match exactly

8. **Auth Coverage**
   - Every protected endpoint declares auth requirements
   - Every protected page declares route guard requirements
   - Auth patterns are consistent across backend and frontend

9. **Custom Rules Compliance**
   - Constraints in `custom-feature-rules.md` are reflected in services/endpoints/pages/code
   - AI/integration/async requirements are implemented correctly
   - Provider integrations are properly isolated in external services

10. **UI State Coverage**
   - Every data-driven page documents loading/empty/error/success states
   - All forms have validation and error display
   - All lists have pagination and empty states

11. **Path and Naming Consistency**
   - No dead or stale file paths (e.g., `docs/references/...`, `D:/...`)
   - File/folder names match references in all documents
   - Module/feature/entity/service names are consistent across all files

12. **Code Layering Compliance**
    - Backend follows controller → service → repository pattern per `backend-rule.md`
    - Frontend follows page → frontend service → endpoint pattern per `frontend-rule.md`
    - No business logic in controllers or components
    - Endpoints do not bypass services to reach repositories or external SDKs
    - Integration providers are isolated in external services

13. **Frontend Third-Party Isolation**
    - Scan every file under `src/app/core/services/` and `src/app/pages/` for HTTP calls
    - Every `this.http.get/post/put/patch/delete(...)` call must start with `${this.api}` or `${environment.apiUrl}`
    - Flag any hardcoded `https://` URL that is not `environment.apiUrl` as a **CRITICAL** violation
    - Specifically check: no presigned R2/S3 PUT calls, no direct AI API calls, no direct mail/payment calls
    - Cross-reference Global Rule 12 in `custom-feature-rules.md` — zero tolerance

### Verification Report

When checks are complete, produce a verification report:

```markdown
# Verification Report

## Status: [PASS | ISSUES FOUND]

## Module Coverage: [✓ | ✗]
- [Details if issues found]

## Feature Coverage: [✓ | ✗]
- [Details if issues found]

## Service Coverage: [✓ | ✗]
- [Details if issues found]

## Endpoint-Service Linking: [✓ | ✗]
- [Details if issues found]

## Entity Consistency: [✓ | ✗]
- [Details if issues found]

## Endpoint-Page Linking: [✓ | ✗]
- [Details if issues found]

## Auth Coverage: [✓ | ✗]
- [Details if issues found]

## Custom Rules Compliance: [✓ | ✗]
- [Details if issues found]

## UI State Coverage: [✓ | ✗]
- [Details if issues found]

## Path Consistency: [✓ | ✗]
- [Details if issues found]

## Code Layering: [✓ | ✗]
- [Details if issues found]

## Frontend Third-Party Isolation: [✓ | ✗]
- [Details if issues found — list every file with a direct external URL call]

## Summary
[Overall assessment and recommended fixes]
```

---

## Done

When all phases complete and verification passes, the framework has produced:

- Complete planning documents in `3-plan/` (including `services.md`)
- Complete action specifications in `4-actions/`
- Project-specific rules in `5-rules/`
- Backend code following all specifications
- Frontend code following all specifications
- A verification report confirming consistency

The system is ready for testing and iteration.

---

## Phase 5 — Change Mode

### Goal
Incrementally add new features or modules, or modify existing ones, while keeping all `.ai-control` planning documents in sync with the actual codebase.

Phase 5 is independent of Phases 0–4. Use it any time after the initial app exists (greenfield or partial build). You do not need to re-run Phases 0–4 to make a change.

---

### Entry Point

Before running Phase 5, fill in **`6-changes/change-request.md`** with:
- The type of change
- The scope (which modules, features, endpoints, or pages)
- A plain-language description
- Acceptance criteria

Use `2-templates/change-request-template.md` as the reference — it explains every field and includes a complete example.

When the file is ready, tell the AI: **"Start Phase 5"**.

---

### Step 5.0 — Understand the Change

- **Input**: `6-changes/change-request.md`
- **Actions**:
  1. Read `change-request.md` fully. Note the `change-type`, `target-app`, and `affected-repos` — these three fields together determine the scope of every downstream step.
  2. Resolve `target-app` to the affected application(s):

     | target-app | Application | Repo |
     |------------|------------|------|
     | `customer-portal` | Existing user-facing web app | `roya-ai-dynamo-frontend` |
     | `admin-panel` | Existing admin web app | `roya-ai-dynamo-frontend-admin` |
     | `new-customer-portal` | New customer web app | new repo (defined in change request) |
     | `new-admin-panel` | New admin web interface | new repo (defined in change request) |
     | `new-mobile-app` | New mobile app | new repo (defined in change request) |
     | `new-[name]` | New application named `[name]` | new repo (defined in change request) |
     | `backend-only` | No frontend impact | `roya-ai-dynamo-api` only |
     | `all-apps` | All existing apps | all repos |

  3. If `change-type` is `new-app`: read the **New App Definition** section of the change request. Check whether the listed modules/features exist in `3-plan/modules.md` and `3-plan/features.md`. Note any that are new.
  4. If `change-type` is not `new-app`: read the relevant sections of `1-description.md`, `3-plan/modules.md`, `3-plan/features.md`, `4-actions/endpoints.md`, and `4-actions/pages.md` that match the declared scope. Scan the actual code in the affected modules/pages — do not rely solely on planning docs.
  5. Ask one clarifying question if (and only if) the description is genuinely ambiguous. Otherwise proceed.
- **Done when**: The change is fully understood, `target-app` is resolved, and there are no unresolved ambiguities.

---

### Step 5.1 — Impact Analysis

Determine exactly which planning documents and code files need to change.

Use the table below to map `change-type` to required doc updates:

| Change type | `modules.md` | `features.md` | `data-model.md` | `services.md` | `endpoints.md` | `pages.md` | `custom-feature-rules.md` | `1-description.md` |
|-------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `new-app` | maybe | maybe | — | — | — | ✓ new file | maybe | ✓ |
| `new-module` | ✓ | ✓ | maybe | ✓ | ✓ | maybe | maybe | ✓ |
| `new-feature` | maybe | ✓ | maybe | maybe | maybe | maybe | maybe | ✓ |
| `modify-feature` | — | ✓ | maybe | maybe | maybe | maybe | maybe | maybe |
| `modify-endpoint` | — | — | maybe | maybe | ✓ | maybe | — | — |
| `modify-page` | — | — | — | — | maybe | ✓ | — | — |
| `modify-service` | — | — | maybe | ✓ | maybe | — | maybe | — |
| `modify-data-model` | — | — | ✓ | maybe | maybe | maybe | — | maybe |
| `refactor` | — | — | — | maybe | maybe | maybe | — | — |
| `bug-fix` | — | — | — | — | — | — | — | — |
| `general` | assess | assess | assess | assess | assess | assess | assess | assess |

Legend: ✓ = always update, maybe = update if the change touches that area, — = skip, assess = decide case by case

**Note on `new-app`**: `pages.md` means creating a **new pages file** for the new app (e.g. `4-actions/pages-mobile.md`), not editing the existing `pages.md`. Modules and features are updated only if the new app introduces modules/features not already in the codebase.

- **Output**: A short impact list — which docs change and which code folders/files change.
- **Done when**: Every affected doc and code location is identified before any edits begin.

---

### Step 5.1b — New App Definition (only when `change-type` is `new-app`)

Skip this step if `change-type` is anything other than `new-app`.

This step translates the **New App Definition** section of `change-request.md` into a concrete specification before any planning docs are updated.

- **Input**: The New App Definition section from `change-request.md` + `3-plan/modules.md` + `3-plan/features.md`
- **Template**: `2-templates/new-app-template.md`
- **Actions**:
  1. **Resolve included modules** — map each module listed in the "Modules to Include" table against `3-plan/modules.md`. Confirm each exists. Flag any that are listed as included but marked backend-only (no frontend pages exist for them).
  2. **Resolve included features** — for each included module, list the features that are in scope for the new app. Features marked `excluded` are documented but not implemented.
  3. **Identify new modules/features** — any item in the "New Modules / Features" section that does not exist in `3-plan/modules.md` or `3-plan/features.md` must be flagged. These will need to be added to `modules.md` and `features.md` in Step 5.2.
  4. **Determine endpoint reuse** — for each included feature, identify which existing endpoints in `4-actions/endpoints.md` the new app will call. Flag any features that need new or modified endpoints.
  5. **Generate new app pages spec** — using `2-templates/pages-template.md` as the format and `2-templates/new-app-template.md` as guidance, produce a complete pages spec for the new app. Save it as `4-actions/pages-<app-slug>.md` (e.g. `pages-mobile.md`, `pages-partner-portal.md`).
  6. **Determine new repo structure** — confirm the tech stack, folder layout, and whether the new app will share the same backend (`roya-ai-dynamo-api`) or need a separate one.
- **Output**:
  - A confirmed list of: included modules, included features, reused endpoints, new endpoints needed, new pages spec file
  - If new modules/features were identified: a note that Step 5.2 must add them to `modules.md` and `features.md`
- **Done when**: All of the above are documented and there is a complete `4-actions/pages-<app-slug>.md` ready before Step 5.2 runs.

---

### Step 5.2 — Update Planning Documents

Update only the sections of planning docs identified in Step 5.1. Do not rewrite entire files.

#### Rules for each document

**`3-plan/modules.md`** (new-module only)
- Add the new module entry following the existing format in the file.
- Declare backend/frontend scope, purpose, and dependencies.

**`3-plan/features.md`** (new-module or new-feature)
- Add new feature entries under the correct module section.
- Follow the existing feature entry format: name, visibility, subfeatures, phase priority.
- For `modify-feature`: update the relevant feature entry in place.

**`3-plan/data-model.md`** (when data model changes)
- Add new collections or update existing field tables.
- Follow existing collection entry format: Mongoose shape, field table, indexes, enums.
- Document any new relationships (embedded vs referenced).

**`3-plan/services.md`** (when services change)
- Add new service entries or update existing method signatures.
- Follow existing service entry format: type (internal/external), public methods, dependencies.

**`4-actions/endpoints.md`** (when endpoints change)
- Add new endpoint entries or update existing ones.
- Follow existing endpoint format: method, route, auth, input DTO, return DTO, business rules, services called.

**`4-actions/pages.md`** (when pages change)
- Add new page entries or update existing ones.
- Follow existing page format: route, components, frontend services, models, backend endpoints used, UI states.

**`5-rules/custom-feature-rules.md`** (when new integration, security, or async rules are introduced)
- Add new rules under the relevant module section.
- Follow existing rule format: rule ID, constraint, rationale.

**`1-description.md`** (new features or modules only)
- Append to or update the relevant section (Core Features, Key Entities, or Integrations).
- Preserve existing content — extend, do not replace.

- **Done when**: All identified planning docs are updated and internally consistent.

---

### Step 5.3 — Pre-Build Plan Verification

Run this **before writing any code**. Confirm the updated planning documents are internally consistent and complete.

- **Input**: Updated planning docs from Step 5.2
- **Template**: `2-templates/change-verification-report-template.md` — Part 1
- **Output**: `6-changes/verify-plan-change-<N>.md` (where N = next change number from `change-log.md`)
- **Checks to run** (scoped to changed areas only):
  1. **Feature coverage** — every new/modified feature has an endpoint (if backend-relevant) and a page (if frontend-relevant)
  2. **Service coverage** — every service referenced by new/modified endpoints exists in `services.md`
  3. **Data model consistency** — every entity/DTO referenced in new/modified endpoints and pages is defined in `data-model.md`
  4. **Endpoint-page linking** — routes listed in new/modified pages match exactly the routes in `endpoints.md` (method + path)
  5. **Auth declarations** — new/modified endpoints declare auth level; new/modified pages declare route guard
  6. **Custom rules coverage** — new external integrations, async jobs, or security behaviors are covered by a rule in `custom-feature-rules.md`
- **If issues are found**: fix the relevant planning docs and re-run the check. Do not proceed to Step 5.4 until the report shows PASS.
- **Done when**: `verify-plan-change-<N>.md` is written and shows **Overall: PASS**.

---

### Step 5.4 — Implement Code Changes

Generate or modify code in the actual repos following the updated planning docs and all rules.

#### Backend changes (`roya-ai-dynamo-api`)
- Follow `5-rules/backend-rule.md` and `5-rules/custom-feature-rules.md`.
- Layered architecture: controller → service → repository. No business logic in controllers.
- New schemas go in `src/modules/<module>/schemas/`.
- New services go in `src/modules/<module>/services/`.
- New controllers go in `src/modules/<module>/controllers/`.
- Wire new modules into `app.module.ts`.
- Integration providers stay isolated in `src/integrations/`.

#### Frontend changes (`roya-ai-dynamo-frontend`)
- Follow `5-rules/frontend-rule.md` and `5-rules/custom-feature-rules.md`.
- New pages go in `src/app/pages/<module>/`.
- New frontend services go in `src/app/core/services/`.
- Pages call frontend services only — no direct HTTP in components.
- Register new routes in `app.routes.ts`.
- No hardcoded external URLs — all API calls go through `environment.apiUrl`.

#### Admin frontend changes (`roya-ai-dynamo-frontend-admin`)
- Same rules as user frontend above, applied to `roya-ai-dynamo-frontend-admin`.

#### New app creation (when `change-type` is `new-app`)
- Create the new repo/folder with the correct tech stack scaffold (Angular, React Native, Flutter, etc.).
- Base the folder structure on the same patterns used in existing apps: `core/`, `pages/`, `shared/`, `layouts/`.
- Implement only the pages listed in `4-actions/pages-<app-slug>.md`.
- Reuse existing backend endpoints — do not duplicate business logic in the new app.
- If new endpoints were flagged in Step 5.1b, implement those in `roya-ai-dynamo-api` first (following backend rules), then call them from the new app.
- Apply the same auth strategy declared in the New App Definition (`same-backend-jwt` means reuse the existing JWT flow; `separate-auth` means a new auth module or provider).
- Apply the same frontend isolation rule: no direct external API calls from the app — all traffic goes through `roya-ai-dynamo-api`.
- For mobile apps (React Native / Flutter): replace PrimeNG with the platform's native component library; keep all API calls through the same backend.

#### UI Screenshot Review (frontend and admin only)

After the frontend code is implemented, screenshots of the running UI can be submitted for visual review.

**How to submit**: Run the app locally, navigate to each new/modified page, take a screenshot, and attach it in the chat.

**What the AI checks when screenshots are provided**:
1. **Layout matches `pages.md`** — key components described in the page spec are present and visible (tables, forms, buttons, headers, empty states).
2. **UI states are reachable** — loading, empty, error, and success states are observable.
3. **Correct route** — the browser URL matches the route declared in `pages.md`.
4. **No obvious regressions** — existing pages not in scope of this change have not broken.
5. **RTL support** — if the page is displayed in Arabic/RTL mode, layout is correct (mirrored, right-aligned).
6. **Brand consistency** — color palette (`#ff6043`, `#5922ea`, `#282828`), typography, and PrimeNG component usage are consistent with the rest of the app.

**Screenshot feedback output**: If issues are found from screenshots, the AI describes the exact problem, references the relevant section in `pages.md`, and suggests the code fix. Screenshots do not replace the code checks in Step 5.5 — they are an additional visual layer.

**Screenshots are optional**: If no screenshots are provided, the UI check in Step 5.5 is marked as "skipped — no screenshots provided" and does not block the verification report from passing.

- **Done when**: All code changes are implemented, affected apps compile without errors, and any submitted screenshots have been reviewed.

---

### Step 5.5 — Post-Build Code Verification

Run this **after all code is implemented**. Confirm the code matches the planning docs and all acceptance criteria are met.

- **Input**: Implemented code + updated planning docs
- **Template**: `2-templates/change-verification-report-template.md` — Part 2
- **Output**: `6-changes/verify-code-change-<N>.md`
- **Checks to run** (scoped to changed areas only):
  1. **Endpoints in code** — every new/modified endpoint from `endpoints.md` exists in backend code with the correct HTTP method and route decorator
  2. **Pages in code** — every new/modified page from `pages.md` exists in frontend code at the correct route
  3. **Code layering — backend** — new/modified controllers delegate to services only; no DB queries or external SDK calls in controllers
  4. **Frontend isolation** — no hardcoded external URLs in new/modified Angular pages or services; all API calls go through `environment.apiUrl`
  5. **Auth implementation** — JWT guards, role decorators, and Angular route guards are applied in code as declared in the planning docs
  6. **Acceptance criteria** — every item listed in `change-request.md` is verifiably met; unmet items must be explicitly deferred with justification
  7. **UI screenshots** — if screenshots were submitted in Step 5.4, verify layout, UI states, route, brand consistency, and RTL correctness against `pages.md`; if no screenshots were provided, mark as skipped
- **If issues are found**: fix the code and re-run the relevant checks. Do not proceed to Step 5.6 until the report shows PASS (or PASS with documented deferrals).
- **Done when**: `verify-code-change-<N>.md` is written and shows **Overall: PASS**.

---

### Step 5.6 — Archive and Clear

After the Post-Build Code Verification passes:

1. Open `6-changes/change-log.md`.
2. Append a new entry at the bottom (after the comment marker) following the log entry format defined in that file:
   - Increment the change number.
   - Fill in: date, change-type, affected-repos, scope, description, files modified, planning docs updated, outcome.
   - Reference the two verification report files: `verify-plan-change-<N>.md` and `verify-code-change-<N>.md`.
3. Clear `6-changes/change-request.md` back to its blank starter state (preserve the header comment and template fields — remove only the filled-in values).

- **Done when**: `change-log.md` has the new entry (with report references) and `change-request.md` is blank and ready for the next change.

---

### Phase 5 — Done

When Step 5.6 completes:
- Planning docs are in sync with the code.
- Pre-Build and Post-Build verification reports are saved in `6-changes/`.
- `6-changes/change-log.md` has the new entry.
- `6-changes/change-request.md` is cleared and ready for the next change.

To make another change, fill in `6-changes/change-request.md` again and start Phase 5.