# Change Request Template

This template defines the structure for a single change request submitted to Phase 5 (Change Mode).

Create a change folder `project/changes/change-<NNN>-<slug>/` (next number from `change-log.md`), copy the **Change Request** block below into it as `change-request.md`, fill in every field, then start Phase 5.

---

## How to Use This Template

There are two ways to produce a `change-request.md`:

**Path 1 — You fill it yourself.**
1. Create `project/changes/change-<NNN>-<slug>/change-request.md` from this template.
2. Replace all `[placeholder]` values with your actual content.
3. Keep every section header — the AI reads them by name.
4. One change per file. If you have multiple unrelated changes, complete them sequentially.
5. Tell the AI: **"Start Phase 5"** to trigger the workflow.

**Path 2 — The AI interviews you (default path).**
Just describe the change in one sentence. The AI runs a structured **Discovery Interview** (all sections below) to fully understand the change before drafting anything. It covers business context, technical scope, data, permissions, edge cases, and frontend style. After gathering all answers it drafts `change-request.md` and **asks you to confirm before touching any planning doc or code**.

The interview → draft → confirm gate is **mandatory in both paths**: the AI never proceeds past the change request until you explicitly confirm it.

As Phase 5 runs, the AI adds more files to the same folder: `recon.md` (existing-code review, Step 5.0b), then `verify-plan.md` and `verify-code.md`. You only author `change-request.md` (or confirm the AI's draft of it).

---

## Field Reference

### `change-type`

Pick the single best type from the list below. This drives which planning docs the AI updates.

| Type | When to use |
|------|-------------|
| `new-feature` | Adding a feature to an existing module (new endpoint + page, or backend-only) |
| `new-module` | Adding an entirely new domain (new module, features, endpoints, pages, data model) |
| `new-app` | Creating an entirely new application (customer portal, admin panel, mobile app) — may reuse existing modules/features or add new ones. Fill in the **New App Definition** section. |
| `modify-feature` | Changing how an existing feature behaves (logic, rules, flow) |
| `modify-endpoint` | Adding, removing, or changing an API endpoint |
| `modify-page` | Adding, removing, or changing a frontend page or major UI component |
| `modify-service` | Changing internal or external service logic |
| `modify-data-model` | Adding/removing fields, collections, indexes, or enums |
| `refactor` | Restructuring code without changing external behavior |
| `bug-fix` | Fixing incorrect behavior with minimal scope change |
| `general` | Mixed or cross-cutting change that doesn't fit above types |

---

### `target-app`

Identifies **which application or portal** this change is for. This is the business-level name, not the repo name.

| Value | Means |
|-------|-------|
| `customer-portal` | The existing user-facing web app (see Applications in `project/profile.md`) |
| `admin-panel` | The existing admin web app (see Applications in `project/profile.md`) |
| `new-customer-portal` | A new customer-facing web application |
| `new-admin-panel` | A new admin interface (web) |
| `new-mobile-app` | A new mobile app (iOS, Android, or cross-platform) |
| `new-[name]` | Any other new application — replace `[name]` with a short identifier |
| `backend-only` | Change has no frontend impact (API, workers, data model only) |
| `all-apps` | Change affects all existing applications |

When `change-type` is `new-app`, the `target-app` value names the new application being created (e.g. `new-mobile-app`, `new-partner-portal`).

---

### `affected-repos`

The technical repositories impacted. Derived from `target-app` for existing apps; for `new-app` this is the new repo to be created.

| Value | Means |
|-------|-------|
| `backend` | Only the backend API repo (see Repositories in `project/profile.md`) |
| `frontend` | Only the customer-portal frontend repo (see Repositories in `project/profile.md`) |
| `admin` | Only the admin frontend repo (see Repositories in `project/profile.md`) |
| `frontend+admin` | Both existing Angular apps |
| `backend+frontend` | API + customer portal |
| `backend+admin` | API + admin panel |
| `new-repo:[name]` | A new repository to be created for a new app |
| `all` | All existing repos |

---

### `scope`

List the specific modules, features, endpoints, pages/views, or services that are directly in scope. Be as specific as you can — module names from `project/plan/modules.md`, feature names from `project/plan/features.md`, endpoint routes from `project/actions/<api-app>/endpoints.md`, page/screen names from the relevant app's `project/actions/<app-key>/pages.md` (web) or `project/actions/<app-key>/views.md` (mobile).

---

### `description`

Plain-language description of the change. This is the **result** of the Discovery Questions (see "Discovery Questions by Change Type" below) — not just a one-liner. It should capture the problem, the desired behavior, who is affected, and what's out of scope.

It can be:
- A paragraph explaining the business need and the desired behavior
- A structured spec with sub-points (happy path, edge cases, permissions)

The AI will extract the technical details. You do not need to specify file paths or implementation details. If you start from a one-line idea, the AI runs the discovery questions with you and writes this section from your answers.

---

### `acceptance-criteria`

Numbered list of observable outcomes that confirm the change is complete and correct. Think of these as testable facts:
- "A `POST /api/v1/data/bulk-delete` endpoint returns 200 when given valid file IDs"
- "The files-list page shows a multi-select checkbox and a delete button"
- "Deleted files are removed from the DB and storage"

---

### `notes` (optional)

Any additional context: design decisions, constraints, related issues, links, or things to avoid.

---

## Discovery Interview by Change Type

A one-line description is never enough to plan a change safely. The AI must run a full structured interview before drafting anything. The interview has six fixed sections — the AI presents each section as a labelled group and waits for your answers before moving to the next.

**How the interview works**
- The AI identifies the `change-type` first, states it back to you, then starts the interview.
- Sections 1–5 are always asked. Section 6 (Frontend Style) is asked only when the frontend is touched.
- Each section is sent as a single grouped message — not one question at a time.
- Skip a specific question only when the answer is already unambiguous from what you said — never skip a whole section.
- Only after all sections are answered does the AI draft `change-request.md` and present it for your confirmation (see `flow.md`, Step 5.0a — Phase D).

---

### Section 1 — Business Context (always — every change-type)

Present these questions together in one message.

1. **Problem / motivation** — what business or user problem does this solve? Why is it needed now?
2. **Who is affected** — which users, roles, or apps will experience this change?
3. **Desired outcome** — describe the end state in one or two sentences. How will we know it's done correctly?
4. **Out of scope** — what is explicitly *not* part of this change? What should remain unchanged?
5. **Constraints & dependencies** — anything that must not break or regress? Any deadlines, blocked-by changes, or related work in progress?
6. **Priority** — high / medium / low, and why?

---

### Section 2 — Type-Specific Technical Details (always — pick the block that matches the change-type)

Present all questions for the relevant block in one message.

---

#### `new-feature` — Adding a feature to an existing module

1. **Module** — which existing module does this feature belong to? (from `modules.md`)
2. **User story** — walk through the happy path step by step: from the user's first action to the final result.
3. **Trigger** — how is it started? (button/page action, schedule/cron, event/webhook, another service calling it)
4. **Backend requirement** — does it need a new endpoint, a new service method, or both?
5. **Frontend requirement** — does it need a new page, a new component on an existing page, or no UI?
6. **New data** — any new fields, collections, or enums needed in the data model?
7. **Third-party / AI** — does it call any external provider or AI model? Which one, and what for?

---

#### `new-module` — Adding an entirely new domain

1. **Capability** — what business capability does this module own, in one sentence?
2. **Features list** — list every feature this module will contain (each becomes an entry in `features.md`).
3. **Module dependencies** — which existing modules does it rely on, call, or extend?
4. **New entities** — what new collections/entities does it introduce? What are the relationships to existing data?
5. **Surface** — backend-only, or does it have frontend pages? Which apps?
6. **External integrations** — any new third-party providers, async jobs, or AI usage?
7. **Phase 1 scope** — what is the minimal set of features for the first working version?

---

#### `new-app` — Creating an entirely new application

1. **Why a new app** — why a separate app rather than a feature in an existing one?
2. **Platform** — web, iOS, Android, or cross-platform mobile?
3. **Tech stack** — what framework/library should be used? (or "follow existing" if same as another app)
4. **Auth strategy** — shared backend JWT (reuse existing auth), separate auth, SSO, or none?
5. **Reuse vs new** — which existing modules/features are reused as-is, and what is genuinely new?
6. **First screens** — list the minimal pages/views needed for a usable first version.
7. **Backend** — will this app share the existing backend, or does it need a separate API?

---

#### `modify-feature` — Changing how an existing feature behaves

1. **Which feature** — name it exactly as it appears in `features.md`.
2. **Current behavior** — describe how it works today (step by step if needed).
3. **Desired behavior** — what should it do instead? Be specific about the exact difference.
4. **Must-not-break** — which callers, dependents, or existing behaviors must stay intact?
5. **Ripple risk** — which endpoints, services, pages, or integrations are likely affected by this change?
6. **Data compatibility** — does existing data in the DB need to be migrated or backfilled?

---

#### `modify-endpoint` — Adding, removing, or changing an API endpoint

1. **Which endpoint** — HTTP method + route (from `endpoints.md`), or "new endpoint" if creating one.
2. **What changes** — request input shape, response output, auth level, validation rules, or business logic?
3. **Callers** — which frontend pages, services, or external clients call it? Is this a breaking change for them?
4. **Versioning** — does it need a new route version, or can it change in place?
5. **Service linkage** — which service(s) does it call? Do those exist in `services.md`, or do they need updating?

---

#### `modify-page` — Adding, removing, or changing a frontend page or major UI component

1. **Which page** — route and name (from the app's `pages.md`), or "new page" if creating one.
2. **UI change** — what layout, components, or interactions change? Describe concretely.
3. **State changes** — how do loading / empty / error / success states change?
4. **Backend dependency** — does it need new or changed endpoints to support this UI change?
5. **Style** — answer **Section 6 (Frontend Style)** for this change.

---

#### `modify-service` — Changing internal or external service logic

1. **Which service** — name it (from `services.md`); is it internal or external?
2. **Method changes** — which method signatures or behaviors change? What changes specifically?
3. **Callers** — which endpoints or other services depend on this service? What is the impact on them?
4. **Provider change** — for external services, what changes in the third-party integration contract?
5. **Side effects** — any async jobs, events, audit logs, or transactions affected?

---

#### `modify-data-model` — Adding/removing fields, collections, indexes, or enums

1. **Which entity** — collection/entity name (from `data-model.md`).
2. **Field changes** — for each changed field: name, type, required?, default value, and constraints. Is it added, removed, or modified?
3. **Existing data migration** — is there live data in this collection? How will it be migrated or backfilled?
4. **Index and enum changes** — any new, removed, or modified indexes or enum values?
5. **Consumers** — which services, endpoints, and pages read or write these fields? What changes for them?

---

#### `refactor` — Restructuring code without changing external behavior

1. **What and why** — what exactly is being restructured, and what is the payoff (readability, performance, reuse, maintainability)?
2. **Behavior guarantee** — confirm external behavior (APIs, UI, stored data) stays 100% identical.
3. **Boundaries** — what is explicitly out of scope / must not be touched during this refactor?
4. **Verification plan** — how will we confirm the before/after behavior is equivalent?

---

#### `bug-fix` — Fixing incorrect behavior with minimal scope

1. **Symptom** — describe the incorrect behavior. How do you reproduce it (steps)?
2. **Expected vs actual** — what should happen vs what happens now?
3. **Root cause** — known or suspected cause? Which layer (controller, service, frontend, data)?
4. **Smallest safe fix** — what is the minimal change that resolves it without widening scope?
5. **Regression risk** — what adjacent behavior could this fix accidentally break?

---

#### `general` — Mixed or cross-cutting change

Ask **Section 1 (Business Context)** first. Then identify every distinct area the change touches (e.g. endpoint + page + data model) and ask the type-specific block for each area. Capture every area so nothing is missed.

---

### Section 3 — Data & Integrations (always — skip questions already answered in Section 2)

Present these as a labelled group.

1. **New data** — any new collections, fields, enums, or indexes? Or modifications to existing ones?
2. **External providers** — any new third-party API, SDK, or service being introduced? (payment, storage, email, SMS, AI, analytics, etc.)
3. **Existing integrations** — does this change affect how an existing external provider is called?
4. **Async / background jobs** — any queued jobs, webhooks, scheduled tasks, or event-driven flows?
5. **AI usage** — any LLM, embedding, classification, or AI-generation involved? Which provider and model?

---

### Section 4 — Security & Permissions (always)

Present these as a labelled group.

1. **Who can trigger it** — which user roles or system actors are allowed to use this feature/endpoint?
2. **Ownership checks** — can a user only act on their own data, or can admins act on any record?
3. **Auth level** — public, authenticated, or role-restricted (e.g. admin-only, owner-only)?
4. **Sensitive data** — does this feature handle PII, financial data, passwords, tokens, or other sensitive information?
5. **Audit trail** — should this action be logged or audited? (who did what, and when)
6. **Rate limiting / abuse** — any risk of abuse, spam, or resource exhaustion that needs a guard?

---

### Section 5 — Edge Cases & Errors (always)

Present these as a labelled group.

1. **Invalid input** — what should happen when the request is missing required fields, has wrong types, or violates constraints?
2. **Empty / not found** — what happens when a lookup returns no results or a referenced record doesn't exist?
3. **Partial failures** — if processing multiple items (batch/bulk), what happens when some succeed and some fail?
4. **Concurrent actions** — can two users trigger this at the same time? Is there a race condition risk?
5. **External failure** — if a third-party call fails or times out, what should the system do? (retry, fail silently, surface error)
6. **Rollback / undo** — if something goes wrong mid-way, what is the recovery path?

---

### Section 6 — Frontend Style (only when the frontend is touched)

Ask only when `affected-repos` includes `frontend` or `admin`, or any page/UI is in scope. Present as a labelled group.

1. **Which app and pages** — which application and which specific pages/screens change visually?
2. **Design system** — should it match the existing design system and brand tokens (per `project/profile.md`), or is there a new visual direction?
3. **Reference (optional)** — do you have a screenshot, mockup, or Figma link for the intended style? Attach it in the chat. *(Optional — if none provided, AI follows the existing design system.)*
4. **Layout & components** — any specific layout structure, component choices, spacing rules, or interactions you want?
5. **UI states** — how should loading / empty / error / success states look or behave?
6. **RTL / localization** — any right-to-left layout or localization requirements (per `project/profile.md`)?

The AI confirms the visual approach back to you as part of the Phase D confirmation gate — frontend visuals are **not** implemented until you explicitly approve the style.

---

## Change Request Block

Copy everything between the triple-dashes below into `project/changes/change-<NNN>-<slug>/change-request.md`.

---

```markdown
# Change Request

## Metadata

- **date**: [YYYY-MM-DD]
- **change-type**: [new-feature | new-module | new-app | modify-feature | modify-endpoint | modify-page | modify-service | modify-data-model | refactor | bug-fix | general]
- **target-app**: [customer-portal | admin-panel | new-customer-portal | new-admin-panel | new-mobile-app | new-[name] | backend-only | all-apps]
- **affected-repos**: [backend | frontend | admin | frontend+admin | backend+frontend | backend+admin | new-repo:[name] | all]
- **priority**: [high | medium | low]

---

## Scope

> List the exact modules, features, endpoints, pages/views, or services in scope.
> Use names from the planning docs (modules.md, features.md) and the per-app action specs
> (`<api-app>/endpoints.md`, `<api-app>/services.md`, `<app-key>/pages.md`, `<app-key>/views.md`).
> Name the **app** for any page/view so the correct `project/actions/<app-key>/` file is updated.
> For new-app: list the existing modules/features you want to reuse, plus any new ones.

- App(s): [e.g. customer-portal, admin-panel, backend]
- Module(s): [e.g. Data, Dashboards]
- Feature(s): [e.g. CSV Upload, Column Metadata Editor]
- Endpoint(s): [e.g. POST /api/v1/data/upload, GET /api/v1/data/:id/columns]
- Page(s) / View(s): [e.g. customer-portal: files-list, upload-wizard]
- Service(s): [e.g. DataService, ColumnMetadataService]

---

## Description

> Plain-language description of what needs to change and why.

[Describe the change here. Can be a sentence, a paragraph, or a structured spec.]

---

## New App Definition (only when change-type is `new-app`)

> Remove this section if change-type is not `new-app`.
> See `engine/templates/new-app-template.md` for the full field reference and examples.

- **app-name**: [short name, e.g. "Customer Mobile App"]
- **app-purpose**: [one sentence describing what this app does and who uses it]
- **target-platform**: [web | mobile-ios | mobile-android | mobile-cross-platform]
- **tech-stack**: [e.g. Angular 21 + PrimeNG | React Native | Flutter | React + Tailwind]
- **auth-strategy**: [same-backend-jwt | separate-auth | sso | none]

### Modules to Include from Existing Codebase

> List modules from `project/plan/modules.md` this new app will use.
> For each module, specify which features to include, exclude, or partially include.

| Module | Include? | Features included | Features excluded |
|--------|:--------:|-------------------|-------------------|
| [module name] | full / partial / no | [feature list] | [feature list] |

### New Modules / Features (specific to this app)

> List any modules or features this new app needs that don't exist yet in the codebase.
> Leave blank if none.

- [New module/feature name]: [brief description]

### App-Specific Pages

> List the pages this new app needs. Can be a rough list — the AI will generate the full spec.

1. [Page name] — [what it shows / does]
2. [Page name] — [what it shows / does]

---

## Acceptance Criteria

> Numbered list of testable outcomes that confirm the change is done correctly.

1. [First criterion]
2. [Second criterion]
3. [Add more as needed]

---

## Notes (optional)

> Design decisions, constraints, related context, things to avoid.

[Optional — remove this section if not needed]
```

---

## Example: Filled-In Change Request

The following is a complete example for a real change.

```markdown
# Change Request

## Metadata

- **date**: 2026-06-22
- **change-type**: new-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: high

---

## Scope

- App(s): backend, customer-portal
- Module(s): Data
- Feature(s): CSV File Management
- Endpoint(s): POST /api/v1/data/bulk-delete
- Page(s) / View(s): customer-portal: files-list
- Service(s): DataService, R2StorageService

---

## Description

Users need to be able to select multiple CSV files from the files-list page and delete them all at once. Currently deletion is one file at a time. The bulk delete should remove records from the DB and the corresponding files from Cloudflare R2 storage. Only file owners (or admins) can bulk-delete.

---

## Acceptance Criteria

1. A new `POST /api/v1/data/bulk-delete` endpoint accepts an array of file IDs and deletes each.
2. Files not owned by the requesting user return a 403 — other files in the batch still process.
3. Each deleted file is removed from Cloudflare R2 storage.
4. The files-list page shows a multi-select checkbox column and a "Delete Selected" button.
5. The "Delete Selected" button is disabled when no files are selected.
6. A confirmation dialog appears before deletion.
7. The list refreshes automatically after successful bulk delete.

---

## Notes

- Follow the same ownership check pattern used in the single-file delete endpoint.
- Do not expose R2 calls directly from the Angular service — route through the API.
```
