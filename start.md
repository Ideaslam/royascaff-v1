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
