# AI-Control Engine — Orchestration Guide

## Overview

This is the **engine** of the framework: a generic, product-agnostic workflow that drives AI from a
product description through planning, action specifications, code generation, and verification to
produce a complete, consistent application.

The engine never hardcodes a specific system's data. All concrete facts about *this* system —
applications, repositories, tech stack, brand tokens, environments, integrations — live in
**`project/profile.md`**. Wherever this guide says "the repo / app / stack / brand defined in
`project/profile.md`", resolve it against that file.

Two zones:
- **`engine/`** — this guide (`flow.md`), the generic templates (`engine/templates/`), and the generic
  backend/frontend rules (`engine/rules/`). Reusable across any product.
- **`project/`** — the living blueprint and single source of truth for the current system:
  `profile.md`, `description.md`, `plan/`, `actions/`, `rules.md`, `verify/`, `changes/`.

Follow each phase in order. Each step declares its **Inputs**, **Template**, **Output**, and
**Done-when** criteria.

### Description entry (Phase 0)

Phase 0 supports two paths:

| Path | When | What happens |
|------|------|--------------|
| **A — Full description** | `project/description.md` exists and is a complete product spec you wrote | Validate it, normalize if needed, and use it as the authoritative source. Skip the template walkthrough. |
| **B — Step-by-step** | `project/description.md` is missing, empty, or incomplete | Work through `engine/templates/description-template.md` section by section with you until `project/description.md` is complete. |

Place your full description in **`project/description.md`** before starting Phase 0 if you already have
one. Otherwise, start with an empty or partial file and the AI will guide you through the template.

---

## Phase 0 — Understand

### Goal
Produce a complete, unambiguous product specification in `project/description.md`, and a confirmed
system profile in `project/profile.md`, that AI can use as the authoritative source for all downstream
planning.

### Step 0.0 — Choose Description Path

- **Input**: `project/description.md` (optional — may not exist yet)
- **Output**: Decision — Path A or Path B
- **How to decide**:

  **Use Path A** when `project/description.md` exists **and** all of the following are true:
  - File has substantive content (not empty or placeholder-only)
  - Product purpose, primary user, and core workflow are described
  - Core features are listed
  - Key entities/data are identified (or explicitly marked N/A)
  - No unresolved `[placeholder]`, `TBD`, or template boilerplate remains

  **Use Path B** when any of the above is false, or when the file does not exist.

- **Done when**: Path A or Path B is selected and recorded before continuing.

### Step 0.0b — Establish System Profile

- **Input**: existing repos/code (if any), the description
- **Template**: `engine/templates/profile-template.md`
- **Output**: `project/profile.md`
- **Actions**: Confirm (or create) `project/profile.md` from the template with the applications,
  repositories, tech stack, brand tokens, environments, and integrations for this system. For an
  existing codebase, derive these from the actual repos. For a greenfield build, fill them in with the
  intended choices. Get the **Applications** table right first — its **Key** column defines both the
  `target-app` values and the per-app `project/actions/<key>/` folder names.
- **Done when**: `project/profile.md` exists, the template's **Completion Checklist** is satisfied, and it
  lists the apps, repos, stack, brand, environments, and integrations the rest of the flow will reference.

---

### Step 0.1A — Adopt Full Description (Path A)

Use this step when Step 0.0 selects **Path A**.

- **Input**: `project/description.md` (your complete product spec)
- **Template**: None — do not rewrite from scratch
- **Output**: `project/description.md` (validated; minor edits only if needed for clarity or consistency)
- **Actions**:
  1. Read `project/description.md` as the authoritative product description.
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

- **Input**: `project/description.md` (empty, partial, or missing — create the file if needed)
- **Template**: `engine/templates/description-template.md`
- **Output**: `project/description.md` (built section by section)
- **Actions**:
  1. Open `engine/templates/description-template.md` and treat each numbered section as a separate step (1. Product Summary → 11. Additional Context).
  2. For each section: ask for the information needed, draft or refine that section in `project/description.md`, confirm with the user, then move to the next section.
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
Generate the planning documents that define modules, features, custom rules, and data model. Outputs land in `project/plan/` and `project/rules.md`. (Services are defined in Phase 2, where they head the action call chain.)

### Step 1.1 — Create Modules Map

- **Input**: `project/description.md`
- **Template**: `engine/templates/modules-template.md`
- **Output**: `project/plan/modules.md`
- **Done when**:
  - All business capabilities are grouped into named modules
  - Each module declares backend/frontend scope
  - Module dependencies are documented
  - No orphaned features exist outside modules

### Step 1.2 — Create Features Map

- **Input**: `project/description.md`, `project/plan/modules.md`
- **Template**: `engine/templates/features-template.md`
- **Output**: `project/plan/features.md`
- **Done when**:
  - Every module from `modules.md` has a corresponding section
  - All product features are listed under the correct module
  - Each feature declares visibility (frontend/backend-only/both)
  - Feature names are stable and reusable

### Step 1.3 — Create Custom Feature Rules

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/features.md`
- **Template**: `engine/templates/custom-feature-rules-template.md`
- **Output**: `project/rules.md`
- **Done when**:
  - Project-specific rules are documented (AI usage, integrations, async jobs, security)
  - Each rule references a specific module and feature
  - Provider/integration requirements are explicit
  - Constraints and forbidden behaviors are clear
  - Generic rules remain in `engine/rules/backend-rule.md` / `engine/rules/frontend-rule.md` only

### Step 1.4 — Create Data Model

- **Input**: `project/description.md`, `project/plan/modules.md`, `project/plan/features.md`, `project/rules.md`
- **Template**: `engine/templates/data-model-template.md`
- **Output**: `project/plan/data-model.md`
- **Done when**:
  - All persistent entities are defined with schema shapes appropriate to the project's database (per `project/profile.md`)
  - Field types, required flags, and constraints are documented
  - Relationships (references vs embedded) are explicit
  - Index recommendations are provided
  - Enum types are declared
  - Validation rules are stated

---

## Phase 2 — Actions

### Goal
Generate the service map, endpoint, and client (page/view) specifications. Outputs land in **per-app folders** under `project/actions/<app-key>/`, where `<app-key>` is the app key from the Applications table in `project/profile.md`. API apps hold `services.md` + `endpoints.md`; web apps hold `pages.md`; mobile apps hold `views.md`. See `project/actions/README.md` for the structure.

**Call chain** (dependency direction, crossing app folders):

```text
<app>/pages.md | <app>/views.md → <api-app>/endpoints.md → <api-app>/services.md → repositories / external providers
```

Create the API app's **`project/actions/<api-app>/services.md`** before its `endpoints.md`, and create endpoints before any client (`pages.md` / `views.md`) that depends on them. Endpoints must call services — not repositories or external APIs directly.

### Step 2.1 — Create Services Map

- **Input**:
  - `project/description.md`
  - `project/plan/modules.md`
  - `project/plan/features.md`
  - `project/plan/data-model.md`
  - `engine/rules/backend-rule.md`
  - `project/rules.md`
- **Template**: `engine/templates/services-template.md`
- **Output**: `project/actions/<api-app>/services.md`
- **Done when**:
  - Every backend-relevant feature is covered by at least one **internal** service
  - Services are grouped by module
  - Each service declares type (`internal` or `external`), public methods, and dependencies
  - **Internal** services own business logic and may use repositories and other services
  - **External** services wrap third-party integrations and follow `engine/rules/backend-rule.md` isolation rules
  - All referenced entities and DTOs exist in `data-model.md`
  - No orphaned integration — every external API from the description has a corresponding **external** service

### Step 2.2 — Create Endpoints Specification

- **Input**: 
  - `project/description.md`
  - `project/plan/modules.md`
  - `project/plan/features.md`
  - `project/plan/data-model.md`
  - `project/actions/<api-app>/services.md`
  - `engine/rules/backend-rule.md`
  - `project/rules.md`
- **Template**: `engine/templates/endpoints-template.md`
- **Output**: `project/actions/<api-app>/endpoints.md`
- **Done when**:
  - Every backend-relevant feature has at least one endpoint
  - Endpoints are grouped by module
  - Each endpoint declares method, route, auth, input, output, and constraints
  - Each endpoint declares which **services** it calls (must exist in `services.md`)
  - Endpoints do not call repositories or external providers directly
  - CRUD patterns follow `engine/rules/backend-rule.md` conventions
  - Custom feature rules are reflected in endpoint notes
  - All referenced DTOs and entities exist in `data-model.md`

### Step 2.3 — Create Client Specifications (Pages / Views) — one file per app

Create one client spec **per frontend app**. Web apps get `pages.md` (use `engine/templates/pages-template.md`); mobile apps get `views.md` (use `engine/templates/views-template.md`). Repeat this step for each frontend app in the Applications table.

- **Input**: 
  - `project/description.md`
  - `project/plan/modules.md`
  - `project/plan/features.md`
  - `project/plan/data-model.md`
  - `project/actions/<api-app>/endpoints.md`
  - `engine/rules/frontend-rule.md`
  - `project/rules.md`
- **Template**: `engine/templates/pages-template.md` (web) or `engine/templates/views-template.md` (mobile)
- **Output**: `project/actions/<app-key>/pages.md` (web) or `project/actions/<app-key>/views.md` (mobile) — one per app
- **Done when**:
  - Every frontend-visible feature has at least one page/view in the relevant app
  - Pages/views are grouped by module
  - Each page/view declares route, components, frontend services, models, and **endpoints** used
  - Pages/views do not call backend services directly — only frontend HTTP services that call endpoints
  - UI states (loading/empty/error/success) are documented
  - Frontend/mobile patterns follow `engine/rules/frontend-rule.md` conventions
  - All referenced endpoints exist in the API app's `endpoints.md`
  - Custom feature rules are reflected in page/view notes

---

## Phase 3 — Build

### Goal
Generate backend and frontend code into the repositories (defined in `project/profile.md`) following all planning documents and rules.

---

### ⛔ Pre-Build Confirmation Gate (MANDATORY — do not skip)

Before writing **any** code in Phase 3, the AI **must** stop and present the following to the user for explicit approval. Code generation does **not** begin until the user replies with confirmation.

**What to present**:
1. **What will be built** — list every backend module, schema, service, controller, and endpoint from the planning docs that will be generated.
2. **What will be created on the frontend** — list every page, component, service, and route that will be generated, per app.
3. **Target repos/folders** — the exact repository paths (from `project/profile.md`) where files will be written.
4. **Frontend visual approach** — confirm the design system, brand tokens, and UI library that will be used (from `project/profile.md`). If a reference screenshot/mockup/Figma link is available, confirm it now. If none is provided, state that the existing design system will be followed.

**How to present**:
- Format the summary as a concise, readable list (not prose).
- End with a single clear question: **"Can I proceed with building the code?"**
- Wait for an explicit **"yes" / "go ahead" / "confirmed"** (or equivalent) before continuing.
- If the user requests changes to the plan, update the relevant planning docs and re-present the summary before asking again.
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**

**This gate applies to**:
- All new-app builds (Phases 0–4).
- Any re-run of Phase 3 (e.g. after planning doc corrections).

---

### Step 3.1 — Generate Backend Code

- **Input**: 
  - `project/plan/data-model.md`
  - `project/actions/<api-app>/services.md`
  - `project/actions/<api-app>/endpoints.md`
  - `engine/rules/backend-rule.md`
  - `project/rules.md`
- **Output**: Code in the backend repo defined in `project/profile.md` (e.g. `src/`)
- **Done when**:
  - All modules from `modules.md` have corresponding backend folders
  - All schemas from `data-model.md` are implemented
  - All services from `services.md` are implemented (internal + external)
  - All endpoints from `endpoints.md` are implemented
  - Layered architecture (controller → service → repository) is followed
  - Endpoints call services only — not repositories or external SDKs directly
  - Auth guards, validation DTOs, and error handling are in place
  - Integration providers are isolated per `engine/rules/backend-rule.md`
  - Custom feature rules are implemented correctly

### Step 3.2 — Generate Frontend Code (per app)

- **Input**: 
  - `project/actions/<app-key>/pages.md` (web) or `project/actions/<app-key>/views.md` (mobile) — for the app being built
  - `project/actions/<api-app>/endpoints.md`
  - `engine/rules/frontend-rule.md` (web and mobile; see its "Mobile App Adaptation" section)
  - `project/rules.md`
- **Output**: Code in the frontend/mobile app repo defined in `project/profile.md`
- **Done when**:
  - All pages/views from the app's spec are implemented
  - All components, services, and models are created
  - Routing follows `engine/rules/frontend-rule.md` conventions
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
   - Every module in `project/plan/modules.md` has features in `project/plan/features.md`
   - No features exist outside defined modules

2. **Feature-to-Service Coverage**
   - Every backend-relevant feature is covered by at least one internal service in `project/actions/<api-app>/services.md`
   - Every third-party integration has a corresponding external service
   - No orphaned services that don't map to features

3. **Feature-to-Endpoint Coverage**
   - Every backend-relevant feature has at least one endpoint in `project/actions/<api-app>/endpoints.md`
   - No orphaned endpoints that don't map to features

4. **Endpoint-to-Service Linking**
   - Every endpoint declares which services it calls
   - Every service referenced by an endpoint exists in `project/actions/<api-app>/services.md`
   - Endpoints do not reference repositories or external providers directly

5. **Feature-to-Page Coverage**
   - Every frontend-visible feature has at least one page in `project/actions/<app-key>/pages.md`
   - No orphaned pages that don't map to features

6. **Entity Consistency**
   - All entities referenced in the API app's `services.md` / `endpoints.md` and every app's `pages.md` / `views.md` are defined in `data-model.md`
   - All DTOs mentioned in services and endpoints exist in `data-model.md` or are derivable from entities

7. **Endpoint-to-Page Linking**
   - Every endpoint listed in a page's "Backend Endpoints Used" exists in `endpoints.md`
   - Routes and HTTP methods match exactly

8. **Auth Coverage**
   - Every protected endpoint declares auth requirements
   - Every protected page declares route guard requirements
   - Auth patterns are consistent across backend and frontend

9. **Custom Rules Compliance**
   - Constraints in `project/rules.md` are reflected in services/endpoints/pages/code
   - AI/integration/async requirements are implemented correctly
   - Provider integrations are properly isolated in external services

10. **UI State Coverage**
   - Every data-driven page documents loading/empty/error/success states
   - All forms have validation and error display
   - All lists have pagination and empty states

11. **Path and Naming Consistency**
   - No dead or stale file paths
   - File/folder names match references in all documents
   - Module/feature/entity/service names are consistent across all files

12. **Code Layering Compliance**
    - Backend follows controller → service → repository pattern per `engine/rules/backend-rule.md`
    - Frontend follows page → frontend service → endpoint pattern per `engine/rules/frontend-rule.md`
    - No business logic in controllers or components
    - Endpoints do not bypass services to reach repositories or external SDKs
    - Integration providers are isolated in external services

13. **Frontend Third-Party Isolation**
    - Scan the frontend's service and page folders (per `project/profile.md` source layout) for HTTP calls
    - Every HTTP call must target the configured API base URL (the `apiUrl` defined in `project/profile.md`) — never a third-party URL directly
    - Flag any hardcoded external `https://` URL that is not the configured API base URL as a **CRITICAL** violation
    - Specifically check: no direct calls to object storage, AI, mail, or payment providers from the frontend — all such traffic routes through the API
    - Cross-reference the frontend-isolation rule in `project/rules.md` — zero tolerance

14. **Self-Contained Blueprint** (the "rebuild test")
    - No `engine/` file contains system-specific data (repo names, brand colors, product-specific stack/paths) — those belong only in `project/profile.md` and other `project/` docs
    - `project/` docs reference only other `project/` docs and `engine/rules/` — never depend on examples baked into the engine
    - Result: copying `project/` alone is enough to understand and rebuild the current system

### Verification Report

When checks are complete, produce a verification report saved to `project/verify/verification-report.md`:

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

## Self-Contained Blueprint: [✓ | ✗]
- [Details if any system data leaked into engine/, or any project doc depends on engine examples]

## Summary
[Overall assessment and recommended fixes]
```

---

## Done

When all phases complete and verification passes, the framework has produced:

- A confirmed system profile in `project/profile.md`
- Complete planning documents in `project/plan/`
- Complete action specifications in `project/actions/` — one folder per app (`<api-app>/{services,endpoints}.md`, `<web-app>/pages.md`, `<mobile-app>/views.md`)
- Project-specific rules in `project/rules.md`
- Backend code following all specifications
- Frontend code following all specifications
- A verification report confirming consistency in `project/verify/`

The system is ready for testing and iteration.

---

## Phase 5 — Change Mode

### Goal
Incrementally add new features or modules, or modify existing ones, while keeping all `project/`
planning documents in sync with the actual codebase. The plan must always equal the latest state of the
code, so `project/` stays a self-contained blueprint anyone can rebuild from.

Phase 5 is independent of Phases 0–4. Use it any time after the initial app exists (greenfield or partial build). You do not need to re-run Phases 0–4 to make a change.

---

### Entry Point

Each change gets its own folder under `project/changes/`:

```
project/changes/change-<NNN>-<slug>/
  change-request.md     # the filled request (kept permanently)
  recon.md              # existing-code review (Step 5.0b)
  verify-plan.md        # pre-build report (Step 5.3)
  verify-code.md        # post-build report (Step 5.5)
```

- `<NNN>` = the next change number (zero-padded), read from `project/changes/change-log.md`.
- `<slug>` = a short kebab-case summary of the change (e.g. `bulk-delete-csv`).

To start a change:
1. Create the folder `project/changes/change-<NNN>-<slug>/`.
2. Copy `engine/templates/change-request-template.md` into it as `change-request.md`.
3. Fill in every field: type of change, scope, plain-language description, acceptance criteria.

The template explains every field and includes a complete example. When the request is filled, tell the AI: **"Start Phase 5"**.

**Or let the AI interview you (default path).** Just describe the change in plain language — one sentence is enough to start. The AI immediately runs a structured interview (Step 5.0a) covering business context, technical scope, data, permissions, edge cases, and frontend style. It drafts `change-request.md` from your answers and **asks you to confirm before touching any planning doc or code**. Nothing is written until you say yes.

---

### Step 5.0 — Understand the Change

- **Input**: `project/changes/change-<NNN>-<slug>/change-request.md`
- **Actions**:
  1. Read `change-request.md` fully. Note the `change-type`, `target-app`, and `affected-repos` — these three fields together determine the scope of every downstream step.
  2. Resolve `target-app` and `affected-repos` against the **Applications** and **Repositories** tables in `project/profile.md`. New-app values (`new-*`) refer to a new application/repo defined in the change request.
  3. If `change-type` is `new-app`: read the **New App Definition** section of the change request. Check whether the listed modules/features exist in `project/plan/modules.md` and `project/plan/features.md`. Note any that are new.
  4. If `change-type` is not `new-app`: read the relevant sections of `project/description.md`, `project/plan/modules.md`, `project/plan/features.md`, `project/actions/<api-app>/endpoints.md`, and `project/actions/<app-key>/pages.md` that match the declared scope. (The deep code inspection happens next, in Step 5.0b.)
  5. If the request was authored directly (Path 1) and the description is complete, proceed. If it is thin, ambiguous, or the user started from a one-line idea (Path 2), run **Step 5.0a — Discovery & Confirmation** before going further.
- **Done when**: The change is fully understood, `target-app` is resolved against `project/profile.md`, and there are no unresolved ambiguities.

---

### Step 5.0a — Discovery Interview & Confirmation

**This step is mandatory for every change, in both paths.** The goal is to fully understand the change through a structured interview before any planning doc or code file is created or modified. Nothing is drafted, planned, or touched until the interview is complete and you confirm the result.

- **Input**: the user's plain-language idea (or the partial `change-request.md`) + the `change-type`
- **Template**: `engine/templates/change-request-template.md` → **"Discovery Interview by Change Type"**
- **Output**: a complete `project/changes/change-<NNN>-<slug>/change-request.md`, **confirmed by the user**

---

#### Phase A — Identify the Change Type

1. Read the user's description and identify the `change-type` from the list in the template.
2. If the type is unclear, ask the user to choose before continuing — do not guess.
3. State the identified type back to the user before starting the interview (e.g. "This looks like a `new-feature`. Starting the discovery interview now.").

---

#### Phase B — Run the Discovery Interview

Ask every question in the following order. **Do not skip any section.** Present each section as a clearly labelled group so the user can answer section-by-section, not question-by-question.

**Section 1 — Business Context** (always)
Ask the questions in the **"Business Context"** block from the template (motivation, who is affected, desired outcome, out-of-scope, constraints, priority).

**Section 2 — Type-Specific Technical Details** (always)
Ask the questions in the **type-specific block** for the identified `change-type` from the template. These cover the technical depth: user story, data, integrations, permissions, edge cases.

**Section 3 — Data & Integrations** (always, if not already covered in Section 2)
Ask the questions in the **"Data & Integrations"** block from the template: new fields/entities, external providers, async jobs, AI usage.

**Section 4 — Security & Permissions** (always)
Ask the questions in the **"Security & Permissions"** block: who can trigger it, role/ownership checks, sensitive data, audit trail.

**Section 5 — Edge Cases & Errors** (always)
Ask the questions in the **"Edge Cases & Errors"** block: invalid input, empty states, concurrent actions, failure handling, rollback.

**Section 6 — Frontend Style** (only when the frontend is touched)
If `affected-repos` includes `frontend` or `admin`, or any page/UI is in scope, ask the **"Frontend Style"** block: which pages, design system, reference screenshot/Figma link, layout, states, RTL.

**Rules for asking questions**:
- Present all questions for a section together in one message — do not ask one question per message.
- Wait for the user's answers before moving to the next section.
- If an answer is unclear or missing, ask a follow-up before proceeding.
- Skip a specific question only when the answer is already unambiguous from what the user said — never skip a whole section.
- Do not start drafting `change-request.md` until all sections are answered.

---

#### Phase C — Draft the Change Request

After all sections are answered:

1. Create the folder `project/changes/change-<NNN>-<slug>/` (next number from `project/changes/change-log.md`).
2. Draft `change-request.md` using the **Change Request Block** from the template. Fill in every field: `metadata`, `scope`, `description`, `acceptance-criteria`, and `notes`. For `new-app` changes, fill the **New App Definition** section too.
3. The `description` field must capture: the problem, the desired behavior, who is affected, the user story (happy path + edge cases), permissions, data changes, and what is out of scope.
4. The `acceptance-criteria` must be a numbered list of **testable, observable outcomes** — not vague summaries.

---

#### Phase D — ⛔ Confirmation Gate (MANDATORY)

Present the full drafted `change-request.md` to the user. Format it clearly, section by section. Then ask:

> **"Does this change request look correct? Please confirm to proceed, or tell me what to correct."**

**Rules**:
- Do **not** proceed to Step 5.0b until the user explicitly confirms.
- If the user requests any correction — even a small one — apply it and re-present the full request before asking again.
- **Do not interpret silence, vague replies, or follow-up questions as confirmation.**
- For frontend changes: the visual style confirmation (Section 6 answers + any reference provided) is part of this gate. Confirm the visual approach explicitly before moving on.
- Only after an explicit **"yes" / "confirmed" / "go ahead"** (or equivalent) does the flow continue to Step 5.0b.

---

- **Done when**: `change-request.md` is saved in the change folder **and** the user has explicitly confirmed it — including the visual style for any frontend change.

---

### Step 5.0b — Existing-Code Review (Reconnaissance)

Run this **before any endpoint or page is decided**. Base every decision on the real code: a feature may
already exist (fully or partially), and a change here may ripple into other endpoints, services, or pages.
Skip only for `change-type: new-app` (greenfield app — there is no existing code to review for it).

- **Input**: the resolved scope from Step 5.0 + the repos in `project/profile.md` + `project/plan/` + `project/actions/`
- **Template**: `engine/templates/code-recon-template.md`
- **Output**: `project/changes/change-<NNN>-<slug>/recon.md`
- **Actions**:
  1. Search the affected module(s) in the **actual code** across every layer — schema, repository, service, controller/endpoint, frontend service, page/component, route registration.
  2. Decide the **feature state**: `none` (greenfield), `partial` (exists but incomplete — list implemented vs. missing), or `complete` (exists; this is a modification).
  3. Record **plan-vs-code drift**: code not in the plan, and plan entries with no code.
  4. Build the **ripple/impact map**: every caller and callee — other endpoints, services, repositories, pages, shared DTOs/schemas/components — that a change here could affect, with the action needed for each.
  5. Note **reuse opportunities** (existing services/endpoints/components to reuse instead of creating new).
  6. Capture **risks**: auth implications, async jobs/webhooks, and whether a data migration is needed.
- **Done when**: `recon.md` is complete and Section 6 gives Step 5.1 a clear **create / complete / modify** list, including all ripple-affected items.

---

### Step 5.1 — Impact Analysis

Determine exactly which planning documents and code files need to change. **Drive this from the
`recon.md` findings (Step 5.0b), not from the change request alone** — so endpoints/pages are decided
against what the code actually contains.

For each affected area, classify the work using the recon verdict:
- **Create new** — only when recon found nothing in code.
- **Complete in place** — when recon found a *partial* implementation (extend it; never duplicate).
- **Modify** — when recon found a *complete* implementation that this change alters.
- Always include the **ripple-affected** endpoints/services/pages from the recon impact map.

Then use the table below to map `change-type` to required doc updates:

| Change type | `modules.md` | `features.md` | `data-model.md` | `services.md` | `endpoints.md` | `pages.md` / `views.md` | `rules.md` | `description.md` |
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
| `bug-fix` | see Phase 6 | see Phase 6 | see Phase 6 | see Phase 6 | see Phase 6 | see Phase 6 | see Phase 6 | see Phase 6 |
| `general` | assess | assess | assess | assess | assess | assess | assess | assess |

Legend: ✓ = always update, maybe = update if the change touches that area, — = skip, assess = decide case by case

**Note on `bug-fix`**: Phase 6 automatically determines whether a bug requires Phase 5 (full change request with plan updates) or Phase 6 Path B (direct fix with no plan updates). See **Phase 6 — Bug Fix Flow** for the decision tree.

(All plan docs above live under `project/plan/`; action docs live **per app** under
`project/actions/<app-key>/` — `services.md`/`endpoints.md` for the API app, `pages.md` for web apps,
`views.md` for mobile apps; `rules.md` and `description.md` live under `project/`. The `services.md` /
`endpoints.md` columns refer to the affected API app's folder; the `pages.md` / `views.md` column refers
to the affected frontend app's folder.)

**Note on `new-app`**: `pages.md` means creating a **new app folder** `project/actions/<app-key>/` with its own client spec — `pages.md` for a web app or `views.md` for a mobile app — not editing another app's file. The API specs (`<api-app>/services.md`, `<api-app>/endpoints.md`) are only touched if the new app needs new or changed endpoints. Modules and features are updated only if the new app introduces modules/features not already in the codebase.

- **Output**: A short impact list — which docs change, which code folders/files change, and which existing endpoints/services/pages must also change (the ripple set from `recon.md`).
- **Done when**: Every affected doc and code location is identified before any edits begin, and every ripple item from `recon.md` is either scheduled for change or explicitly judged safe to leave.

---

### Step 5.1b — New App Definition (only when `change-type` is `new-app`)

Skip this step if `change-type` is anything other than `new-app`.

This step translates the **New App Definition** section of `change-request.md` into a concrete specification before any planning docs are updated.

- **Input**: The New App Definition section from `change-request.md` + `project/plan/modules.md` + `project/plan/features.md` + `project/profile.md`
- **Template**: `engine/templates/new-app-template.md`
- **Actions**:
  1. **Resolve included modules** — map each module listed in the "Modules to Include" table against `project/plan/modules.md`. Confirm each exists. Flag any that are listed as included but marked backend-only (no frontend pages exist for them).
  2. **Resolve included features** — for each included module, list the features that are in scope for the new app. Features marked `excluded` are documented but not implemented.
  3. **Identify new modules/features** — any item in the "New Modules / Features" section that does not exist in `project/plan/modules.md` or `project/plan/features.md` must be flagged. These will need to be added to `modules.md` and `features.md` in Step 5.2.
  4. **Determine endpoint reuse** — for each included feature, identify which existing endpoints in `project/actions/<api-app>/endpoints.md` the new app will call. Flag any features that need new or modified endpoints.
  5. **Generate new app client spec** — create the app folder `project/actions/<app-key>/` and produce its complete client spec: `pages.md` for a web app (using `engine/templates/pages-template.md`) or `views.md` for a mobile app (using `engine/templates/views-template.md`), with `engine/templates/new-app-template.md` as guidance. Example: `project/actions/customer-mobile/views.md`, `project/actions/partner-portal/pages.md`.
  6. **Determine new repo structure** — confirm the tech stack, folder layout, and whether the new app will share the existing backend (defined in `project/profile.md`) or need a separate one. Record the new app and repo in `project/profile.md`.
- **Output**:
  - A confirmed list of: included modules, included features, reused endpoints, new endpoints needed, new pages spec file
  - If new modules/features were identified: a note that Step 5.2 must add them to `modules.md` and `features.md`
- **Done when**: All of the above are documented and there is a complete client spec for the new app (`project/actions/<app-key>/pages.md` or `project/actions/<app-key>/views.md`) ready before Step 5.2 runs.

---

### Step 5.2 — Update Planning Documents

Update only the sections of planning docs identified in Step 5.1. Do not rewrite entire files.

> [!IMPORTANT]
> **No Appended Change Sections**: Never create or append separate `change-<NNN>` sections at the end of planning/action files (such as `modules.md`, `features.md`, `data-model.md`, `endpoints.md`, `services.md`, `pages.md`/`views.md`). All edits, modifications, and new definitions must be applied **directly in-place** to their original/intended location in the file. Existing tables, schemas, endpoint definitions, and lists must be updated directly so that these files remain a consolidated, up-to-date **single source of truth** representing the *current* state of the application. The record of what changed for a specific task is tracked exclusively in the `project/changes/` folder.

Honor the `recon.md` verdict:
- **Partial implementation found** — update the existing plan entry to *complete* it; do not add a duplicate entry for something the code already started.
- **Ripple items** — also update the plan entries for every endpoint/service/page the recon impact map flagged as affected.
- **Plan-vs-code drift** — bring drifted plan entries back in line with the code as part of this change.


#### Rules for each document

**`project/plan/modules.md`** (new-module only)
- Add the new module entry following the existing format in the file.
- Declare backend/frontend scope, purpose, and dependencies.

**`project/plan/features.md`** (new-module or new-feature)
- Add new feature entries under the correct module section.
- Follow the existing feature entry format: name, visibility, subfeatures, phase priority.
- For `modify-feature`: update the relevant feature entry in place.

**`project/plan/data-model.md`** (when data model changes)
- Add new collections or update existing field tables.
- Follow existing collection entry format: schema shape, field table, indexes, enums.
- Document any new relationships (embedded vs referenced).

**`project/actions/<api-app>/services.md`** (when services change)
- Add new service entries or update existing method signatures.
- Follow existing service entry format: type (internal/external), public methods, dependencies.

**`project/actions/<api-app>/endpoints.md`** (when endpoints change)
- Add new endpoint entries or update existing ones.
- Follow existing endpoint format: method, route, auth, input DTO, return DTO, business rules, services called.

**`project/actions/<app-key>/pages.md`** (web app, when pages change)
- Edit the file inside the affected app's folder (e.g. `customer-portal/pages.md`, `admin-panel/pages.md`).
- Add new page entries or update existing ones.
- Follow existing page format: route, components, frontend services, models, backend endpoints used, UI states.

**`project/actions/<app-key>/views.md`** (mobile app, when screens change)
- Edit the file inside the affected mobile app's folder (e.g. `customer-mobile/views.md`).
- Add new screen entries or update existing ones following `engine/templates/views-template.md`.

**`project/rules.md`** (when new integration, security, or async rules are introduced)
- Add new rules under the relevant module section.
- Follow existing rule format: rule ID, constraint, rationale.

**`project/profile.md`** (when a new app, repo, integration, or stack/brand change is introduced)
- Update the relevant table (Applications, Repositories, Integrations, Tech Stack, Brand Tokens).

**`project/description.md`** (new features or modules only)
- Append to or update the relevant section (Core Features, Key Entities, or Integrations).
- Preserve existing content — extend, do not replace.

- **Done when**: All identified planning docs are updated and internally consistent.

---

### Step 5.3 — Pre-Build Plan Verification

Run this **before writing any code**. Confirm the updated planning documents are internally consistent and complete.

- **Input**: Updated planning docs from Step 5.2
- **Template**: `engine/templates/change-verification-report-template.md` — Part 1
- **Output**: `project/changes/change-<NNN>-<slug>/verify-plan.md`
- **Checks to run** (scoped to changed areas only):
  1. **Feature coverage** — every new/modified feature has an endpoint (if backend-relevant) and a page (if frontend-relevant)
  2. **Service coverage** — every service referenced by new/modified endpoints exists in `services.md`
  3. **Data model consistency** — every entity/DTO referenced in new/modified endpoints and pages is defined in `data-model.md`
  4. **Endpoint-page linking** — routes listed in new/modified pages match exactly the routes in `endpoints.md` (method + path)
  5. **Auth declarations** — new/modified endpoints declare auth level; new/modified pages declare route guard
  6. **Custom rules coverage** — new external integrations, async jobs, or security behaviors are covered by a rule in `project/rules.md`
- **If issues are found**: fix the relevant planning docs and re-run the check. Do not proceed to Step 5.4 until the report shows PASS.
- **Done when**: `verify-plan.md` is written in the change folder and shows **Overall: PASS**.

---

### Step 5.4 — Implement Code Changes

Generate or modify code in the actual repos (defined in `project/profile.md`) following the updated planning docs and all rules.

#### ⛔ Confirmation Gate (MANDATORY — do not skip)

Before writing or modifying **any** code, the AI **must** stop and present the following to the user for explicit approval. Code changes do **not** begin until the user replies with confirmation.

**What to present**:
1. **What will be applied** — list every file that will be created or modified: schemas, services, controllers, endpoints, pages, components, routes. Use the create/complete/modify list from `recon.md` plus the full ripple set from Step 5.1.
2. **Target repos/folders** — the exact repository paths (from `project/profile.md`) where each file will be written or changed.
3. **Frontend style** — if `affected-repos` includes `frontend` or `admin`, or any page/UI is in scope: state which app/pages change, confirm the design system / brand tokens that will be followed (from `project/profile.md`), and note any reference screenshot/mockup/Figma link. If none is provided, state that the existing design system will be followed.

**How to present**:
- Format the summary as a concise, readable list (not prose).
- End with a single clear question: **"Can I proceed with implementing the code?"**
- Wait for an explicit **"yes" / "go ahead" / "confirmed"** (or equivalent) before continuing.
- If the user requests adjustments, update the relevant planning docs and re-present the summary before asking again.
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**
- This gate is **separate from** and **in addition to** the change-request confirmation in Step 5.0a — the plan may have evolved through recon and impact analysis, so re-confirm the concrete code-level scope here.

Once the user explicitly confirms, proceed with the changes below.

#### Backend changes
- Apply to the backend repo defined in `project/profile.md`.
- Follow `engine/rules/backend-rule.md` and `project/rules.md`.
- Layered architecture: controller → service → repository. No business logic in controllers.
- New schemas go in `src/modules/<module>/schemas/` (or the project's equivalent layout).
- New services go in `src/modules/<module>/services/`.
- New controllers go in `src/modules/<module>/controllers/`.
- Wire new modules into the application module/root.
- Integration providers stay isolated in the integrations layer.

#### Frontend changes
- Apply to the frontend app defined in `project/profile.md` for the resolved `target-app`.
- Follow `engine/rules/frontend-rule.md` and `project/rules.md`.
- New pages go in the frontend's pages folder (per `project/profile.md` source layout).
- New frontend services go in the frontend's core services folder.
- Pages call frontend services only — no direct HTTP in components.
- Register new routes in the app's route configuration.
- No hardcoded external URLs — all API calls go through the configured `apiUrl` in `project/profile.md`.

#### Admin / additional app changes
- Same rules as above, applied to the app/repo defined in `project/profile.md` for the resolved `target-app`.

#### New app creation (when `change-type` is `new-app`)
- Create the new repo/folder with the tech stack scaffold declared in the New App Definition / `project/profile.md`.
- Base the folder structure on the same patterns used in existing apps (e.g. `core/`, `pages/`, `shared/`, `layouts/`).
- Implement only the pages/views listed in the new app's client spec (`project/actions/<app-key>/pages.md` or `project/actions/<app-key>/views.md`).
- Reuse existing backend endpoints — do not duplicate business logic in the new app.
- If new endpoints were flagged in Step 5.1b, implement those in the backend repo first (following backend rules), then call them from the new app.
- Apply the auth strategy declared in the New App Definition (`same-backend-jwt` reuses the existing JWT flow; `separate-auth` means a new auth module or provider).
- Apply the same frontend isolation rule: no direct external API calls from the app — all traffic goes through the backend API.
- For mobile / non-web targets: use the platform's native component library instead of the web UI library; keep all API calls through the same backend.

#### UI Screenshot Review (frontend apps only)

After the frontend code is implemented, screenshots of the running UI can be submitted for visual review.

**How to submit**: Run the app locally, navigate to each new/modified page, take a screenshot, and attach it in the chat.

**What the AI checks when screenshots are provided**:
1. **Layout matches the app's spec** — key components described in the app's `pages.md` (web) or `views.md` (mobile) page/screen spec are present and visible (tables, forms, buttons, headers, empty states).
2. **UI states are reachable** — loading, empty, error, and success states are observable.
3. **Correct route** — the browser URL (web) or navigation target (mobile) matches the route declared in the app's `pages.md` / `views.md`.
4. **No obvious regressions** — existing pages not in scope of this change have not broken.
5. **Localization / RTL support** — if the app supports RTL (per `project/profile.md`), layout is correct (mirrored, right-aligned).
6. **Brand consistency** — the brand tokens defined in `project/profile.md`, typography, and the project's UI library usage are consistent with the rest of the app.

**Screenshot feedback output**: If issues are found from screenshots, the AI describes the exact problem, references the relevant section in the app's `pages.md` / `views.md`, and suggests the code fix. Screenshots do not replace the code checks in Step 5.5 — they are an additional visual layer.

**Screenshots are optional**: If no screenshots are provided, the UI check in Step 5.5 is marked as "skipped — no screenshots provided" and does not block the verification report from passing.

- **Done when**: All code changes are implemented, affected apps compile without errors, and any submitted screenshots have been reviewed.

---

### Step 5.5 — Post-Build Code Verification

Run this **after all code is implemented**. Confirm the code matches the planning docs and all acceptance criteria are met.

- **Input**: Implemented code + updated planning docs
- **Template**: `engine/templates/change-verification-report-template.md` — Part 2
- **Output**: `project/changes/change-<NNN>-<slug>/verify-code.md`
- **Checks to run** (scoped to changed areas only):
  1. **Endpoints in code** — every new/modified endpoint from `endpoints.md` exists in backend code with the correct HTTP method and route decorator
  2. **Pages/views in code** — every new/modified page/screen from the app's `pages.md` (web) or `views.md` (mobile) exists in the app's code at the correct route/navigation target
  3. **Code layering — backend** — new/modified controllers delegate to services only; no DB queries or external SDK calls in controllers
  4. **Frontend isolation** — no hardcoded external URLs in new/modified frontend pages or services; all API calls go through the configured `apiUrl` in `project/profile.md`
  5. **Auth implementation** — auth guards, role decorators, and frontend route guards are applied in code as declared in the planning docs
  6. **Acceptance criteria** — every item listed in `change-request.md` is verifiably met; unmet items must be explicitly deferred with justification
  7. **UI screenshots** — if screenshots were submitted in Step 5.4, verify layout, UI states, route, brand consistency, and RTL correctness against the app's `pages.md` / `views.md`; if no screenshots were provided, mark as skipped
- **If issues are found**: fix the code and re-run the relevant checks. Do not proceed to Step 5.6 until the report shows PASS (or PASS with documented deferrals).
- **Done when**: `verify-code.md` is written in the change folder and shows **Overall: PASS**.

---

### Step 5.6 — Archive

After the Post-Build Code Verification passes:

1. Open `project/changes/change-log.md`.
2. Append **one row** to the table following the column format defined in that file:
   `# | Date | Type | Target app | Scope | Outcome | Folder` — where `Folder` links to `change-<NNN>-<slug>/`.
3. Nothing is cleared: the change folder (`change-request.md`, `verify-plan.md`, `verify-code.md`) is the permanent record for this change.

- **Done when**: `change-log.md` has the new row pointing at the change folder, and the folder contains the filled request and both verification reports.

---

### Phase 5 — Done

When Step 5.6 completes:
- Planning docs are in sync with the code (the plan equals the latest state).
- The change folder `project/changes/change-<NNN>-<slug>/` holds the filled request, the code reconnaissance, and both verification reports.
- `project/changes/change-log.md` has a new row pointing at that folder.

To make another change, create the next `project/changes/change-<NNN>-<slug>/` folder (copy the template in as `change-request.md`), fill it, and start Phase 5.

---

## Phase 6 — Bug Fix Flow

### Goal
Provide a lightweight, fast-track process for bug fixes that automatically determines whether the fix requires a full change request (architectural impact) or can follow a simplified direct-fix path (isolated code correction).

---

### Entry Point

Bug fixes can be reported in two ways:

1. **Plain language description** — user describes the bug (e.g. "Login button doesn't work on mobile")
2. **Bug report file** — user creates `project/bugs/bug-<NNN>-<slug>.md` following `engine/templates/bug-report-template.md`

When a bug is reported, the AI immediately starts **Step 6.0 — Bug Triage**.

---

### Step 6.0 — Bug Triage

Understand the bug and determine which path it should follow.

- **Input**: Bug description (plain language or bug report file)
- **Actions**:
  1. If the user provided plain language only, ask clarifying questions to gather:
     - What is broken / not working as expected?
     - Where does it happen? (which page/screen/endpoint/module)
     - What is the expected behavior?
     - Steps to reproduce (if applicable)
     - Severity: critical / high / medium / low
  2. Identify the **affected area**: which app(s), module(s), file(s) are involved
  3. Determine the **fix scope** using the decision tree below

---

### Decision Tree: Change Request vs. Direct Fix

Ask these questions in order:

**Q1. Does the fix require changes to the plan?**
- New entity fields, new endpoints, new pages, new services, new integrations, modified business logic that affects other features → **YES, escalate to Change Request**
- Otherwise → continue to Q2

**Q2. Does the fix affect multiple modules or apps?**
- Fix touches more than one module or app → **YES, escalate to Change Request**
- Otherwise → continue to Q3

**Q3. Does the fix require a data migration?**
- Schema changes, data transformations, or backfill needed → **YES, escalate to Change Request**
- Otherwise → **NO, proceed with Direct Fix**

---

### Path A — Escalate to Change Request (Architectural Impact)

When the decision tree says **YES** to any question:

1. Create `project/changes/change-<NNN>-bug-fix-<slug>/` folder (next number from `project/changes/change-log.md`)
2. Set `change-type: bug-fix` in `change-request.md`
3. Proceed to **Phase 5 Step 5.0** with the bug details as the change description
4. Follow the full change request flow (discovery interview, recon, impact analysis, plan updates, code implementation, verification)
5. The bug is considered **resolved** when Phase 5 completes (Step 5.6 archives the change)

**Done when**: The change is logged in `project/changes/change-log.md` with type `bug-fix` and the bug folder contains the full change artifacts.

---

### Path B — Direct Fix (Isolated Code Correction)

When the decision tree says **NO** (no architectural impact):

Follow these steps for a lightweight, fast-track fix.

---

### Step 6.1 — Create Bug Log Entry

- **Input**: Bug description + affected area from Step 6.0
- **Output**: `project/bugs/bug-<NNN>-<slug>.md`
- **Actions**:
  1. If the bug report file doesn't exist yet, create it now using this format:

```markdown
# Bug #<NNN> — <Short Title>

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: <YYYY-MM-DD>
- **Severity**: critical | high | medium | low
- **Affected area**: <app/module/file>

## Description
<What is broken / not working as expected>

## Expected Behavior
<What should happen instead>

## Steps to Reproduce (if applicable)
1. <Step 1>
2. <Step 2>
3. ...

## Root Cause
<Brief technical explanation of the cause — filled after investigation>

## Fix Applied
<Brief description of the code changes made — filled after implementation>

## Verification
- [ ] Fix implemented in code
- [ ] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- <list of modified files>
```

  2. Save to `project/bugs/bug-<NNN>-<slug>.md` (next number from `project/bugs/bug-log.md`)
  3. Set **Status: PENDING**

- **Done when**: Bug log file exists with PENDING status.

---

### Step 6.2 — Investigate & Document Root Cause

- **Input**: `project/bugs/bug-<NNN>-<slug>.md` + affected code
- **Actions**:
  1. **Investigate the root cause**:
     - Read the affected files (identified in Step 6.0)
     - Trace the code path that produces the bug
     - Identify the exact line(s) or logic causing the issue
  2. **Document the root cause** in the bug log file (update "Root Cause" section)
  3. **Propose the fix approach**:
     - Describe the exact code change needed to resolve the bug
     - List every file that will be modified
     - Keep the proposed fix **minimal and isolated** — do not plan refactoring of unrelated code
  4. **Update the bug log** with the proposed fix description and the files list (pre-fill "Fix Applied" and "Related Files" sections as a proposal)

- **Done when**: Root cause is understood and documented, proposed fix is described in the bug log, and **no code has been changed yet**.

---

### Step 6.3 — ⛔ Pre-Fix Confirmation Gate (MANDATORY)

Before writing **any** code, the AI **must** stop and present the investigation findings to the user for explicit approval.

**What to present**:
1. **Bug summary** — brief recap of what is broken
2. **Root cause** — the exact line(s) or logic causing the issue
3. **Proposed fix** — what code changes will be made and why
4. **Files to be modified** — list of every file that will change

**How to ask**:
- Present the summary clearly and concisely
- End with: **"This is the root cause and proposed fix. Can I proceed with applying the changes?"**
- Wait for an explicit **"yes" / "go ahead" / "confirmed"** (or equivalent) before continuing
- If the user disagrees with the analysis or wants a different approach:
  - Update the bug log with the revised understanding
  - Go back to **Step 6.2** and re-investigate
  - Re-present for confirmation when done
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**

---

### Step 6.4 — Implement Fix

Once the user explicitly confirms the proposed fix:

- **Input**: confirmed proposed fix from Step 6.3 + affected code
- **Actions**:
  1. **Apply code changes**:
     - Implement exactly the fix described in Step 6.3
     - Follow all rules from `engine/rules/backend-rule.md` / `engine/rules/frontend-rule.md` and `project/rules.md`
     - Keep the fix **minimal and isolated** — do not refactor unrelated code
     - Do not add new features or change behavior outside the bug scope
  2. **Update the bug log** (finalize "Fix Applied" and "Related Files" sections to reflect what was actually changed)
  3. **Run basic verification**:
     - Check that the fixed code compiles without errors
     - Check that no linter errors were introduced in the modified files
     - Verify the fix logically addresses the root cause

- **Done when**: Code is fixed, bug log is updated with final fix description + related files, and basic verification passes.

---

### Step 6.5 — ⛔ Post-Fix Confirmation Gate (MANDATORY)

After the fix is implemented, the AI **must** stop and ask the user to confirm it resolves the issue before marking it as DONE.

**What to present**:
1. **Bug summary** — brief recap of what was broken
2. **Root cause** — what caused the bug
3. **Fix applied** — what code changes were made
4. **Files modified** — list of changed files
5. **Verification checklist** — show the checklist from the bug log

**How to ask**:
- Present the summary clearly and concisely
- End with: **"The fix is applied. Can you confirm this resolves the issue so I can mark it as DONE?"**
- Wait for an explicit **"yes" / "confirmed" / "looks good"** (or equivalent)
- If the user reports the bug is **not** fixed or a regression was introduced:
  - Update the bug log with the feedback
  - Go back to **Step 6.2** and re-investigate
  - Re-present for confirmation when done
- **Do not interpret silence, ambiguous replies, or follow-up questions as confirmation.**

---

### Step 6.6 — Mark as Done

Once the user explicitly confirms the fix resolves the issue:

1. Update the bug log file:
   - Change **Status** from `PENDING` to `DONE`
   - Add a "Confirmed" line: `**Confirmed**: <YYYY-MM-DD>`
   - Check all boxes in the "Verification" section
2. Append one row to `project/bugs/bug-log.md`:
   - Format: `# | Date | Severity | Area | Summary | Status | File`
   - Where `File` links to `bug-<NNN>-<slug>.md`

- **Done when**: Bug log status is DONE, verification checklist is complete, and `project/bugs/bug-log.md` has the new row.

---

### Path B — Done

When Step 6.6 completes:
- The bug is fixed in code
- The bug log `project/bugs/bug-<NNN>-<slug>.md` has status DONE and documents the root cause, fix, and verification
- `project/bugs/bug-log.md` has a new row pointing at the bug file

For the next bug, repeat Phase 6 from Step 6.0.

---

## Bug Fix Flow — Summary

| Decision | Path | Steps | Outputs |
|----------|------|-------|---------|
| Needs plan change, multi-module impact, or data migration | **Path A — Change Request** | Phase 5 full flow | `project/changes/change-<NNN>-bug-fix-<slug>/` with change request + recon + verification reports |
| Isolated code fix, no architectural impact | **Path B — Direct Fix** | 6.0 Triage → 6.1 Log → 6.2 Investigate → 6.3 Pre-Fix Confirm → 6.4 Fix → 6.5 Post-Fix Confirm → 6.6 Done | `project/bugs/bug-<NNN>-<slug>.md` with pending → done transition |

**Key principle**: Bugs that touch the plan become change requests. Bugs that are pure code corrections follow the lightweight direct-fix path.

---
