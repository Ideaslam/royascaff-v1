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

**Path 2 — The AI interviews you (recommended).**
You describe the change in plain language. The AI then runs the **Discovery Questions** for the matching `change-type` (see the section below), so it understands the *whole* change — not just a one-line description. From your answers it drafts `change-request.md` and **asks you to confirm before applying anything**. If the change touches the frontend, it also asks you to confirm the **visual style**, optionally with a reference screenshot.

The discovery → draft → confirm gate is mandatory in both paths: the AI never starts implementing code until you have confirmed the drafted request.

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

## Discovery Questions by Change Type

A one-line description is never enough to plan a change safely. Before drafting `change-request.md`, the AI must understand the **whole** change. Use the question bank for the matching `change-type` below.

**How to use these questions**
- The AI asks the questions for the relevant `change-type`. Always ask the **Universal** block first, then the type-specific block.
- If the change touches the frontend (`affected-repos` includes `frontend` or `admin`, or a page/UI is in scope), also ask the **Frontend Style** block.
- Skip a question only when the answer is already obvious from the description or the planning docs — never skip the whole block.
- The questions map directly onto the Change Request Block fields. Answers become `scope`, `description`, `acceptance-criteria`, and `notes`.
- When the answers are gathered, the AI drafts `change-request.md` and **asks you to confirm before applying** (see `flow.md`, Step 5.0a).

---

### Universal (ask for every change-type)

1. **Problem / motivation** — what business or user problem does this solve? Why now?
2. **Who is affected** — which users, roles, or apps experience this change?
3. **Desired outcome** — describe the end state in one or two sentences. How will we know it works?
4. **In / out of scope** — what is explicitly *not* part of this change?
5. **Constraints** — anything that must not change, break, or regress? Deadlines, dependencies, related changes?

---

### `new-feature`

> Adding a feature to an existing module.

1. **Module** — which existing module does this feature belong to? (from `modules.md`)
2. **User story** — walk through the happy path step by step, from the user's first action to the final result.
3. **Trigger** — how is it started? (button/page action, schedule, event/webhook, another service)
4. **Data** — what does it read and write? Any new fields, collections, or enums needed?
5. **External / AI** — does it call any third-party integration or AI provider? (these need an external service + a rule)
6. **Permissions** — who is allowed to use it? Any role or ownership checks?
7. **Edge cases & errors** — what should happen on invalid input, empty data, failure, or unauthorized access?
8. **UI?** — is there a page or component? If yes, answer the **Frontend Style** block too.

---

### `new-module`

> Adding an entirely new domain.

1. **Capability** — what business capability does this module own, in one sentence?
2. **Features** — list the features this module will contain (each becomes an entry in `features.md`).
3. **Dependencies** — which existing modules does it rely on or extend?
4. **Data** — what new entities/collections does it introduce? Relationships to existing data?
5. **Surface** — backend-only, or does it have frontend pages? Which apps?
6. **Integrations** — any new external providers, async jobs, or AI usage?

---

### `new-app`

> Creating an entirely new application.

The dedicated **New App Definition** section (below in the Change Request Block) is the question bank for this type. In addition, confirm:

1. **Why a new app** — why a separate app rather than a feature in an existing one?
2. **Reuse vs new** — which existing modules/features/endpoints are reused, and what is genuinely new?
3. **Platform & auth** — target platform and auth strategy (shared backend JWT, separate auth, SSO)?
4. **First screens** — the minimal set of pages for a usable first version.

---

### `modify-feature`

> Changing how an existing feature behaves.

1. **Which feature** — name it as it appears in `features.md`.
2. **Current behavior** — how does it work today?
3. **Desired behavior** — what should it do instead? Be specific about the difference.
4. **Must-not-break** — what existing behavior, callers, or data must stay intact?
5. **Ripple** — which endpoints, services, or pages are likely affected?
6. **Compatibility** — any backward-compatibility or data-migration concerns?

---

### `modify-endpoint`

> Adding, removing, or changing an API endpoint.

1. **Which endpoint** — method + route (from `endpoints.md`), or "new endpoint".
2. **What changes** — request input, response output, auth level, validation, or business logic?
3. **Callers** — which frontend pages/services or external clients call it? Is this a breaking change for them?
4. **Versioning** — does it need a new version, or can it change in place?
5. **Service linkage** — which service(s) does it call? Do those already exist in `services.md`?

---

### `modify-page`

> Adding, removing, or changing a frontend page or major UI component.

1. **Which page** — route/name (from `pages.md`), or "new page".
2. **UI change** — what layout, components, or interactions change?
3. **States** — how do loading / empty / error / success states change?
4. **Data** — does it need new or changed endpoints?
5. **Style** — answer the **Frontend Style** block.

---

### `modify-service`

> Changing internal or external service logic.

1. **Which service** — name it (from `services.md`); internal or external?
2. **Method change** — which method signatures or behaviors change?
3. **Callers** — which endpoints/services depend on it? Impact on them?
4. **Provider** — for external services, what changes in the integration?
5. **Side effects** — async jobs, events, audit logs, or transactions affected?

---

### `modify-data-model`

> Adding/removing fields, collections, indexes, or enums.

1. **Which entity** — collection/entity name (from `data-model.md`).
2. **Field changes** — for each field: name, type, required?, default, constraints. Added / removed / changed?
3. **Migration** — is there existing data? How is it migrated or backfilled?
4. **Indexes & enums** — any index or enum additions/changes?
5. **Consumers** — which services, endpoints, and pages read or write these fields?

---

### `refactor`

> Restructuring code without changing external behavior.

1. **What & why** — what is being restructured, and what's the payoff (readability, performance, reuse)?
2. **Behavior guarantee** — confirm external behavior (APIs, UI, data) stays identical.
3. **Boundaries** — what is explicitly out of scope / must not be touched?
4. **Verification** — how will we confirm equivalence (tests, before/after comparison)?

---

### `bug-fix`

> Fixing incorrect behavior with minimal scope.

1. **Symptom** — what is the incorrect behavior? Steps to reproduce.
2. **Expected vs actual** — what should happen vs what happens now?
3. **Root cause** — known or suspected cause?
4. **Smallest safe fix** — the minimal change that fixes it without widening scope.
5. **Regression risk** — what could this fix accidentally affect?

---

### `general`

> Mixed or cross-cutting change.

Ask the **Universal** block, then pull the relevant questions from each `change-type` the change actually touches (e.g. an endpoint + a page + a data-model change → ask all three blocks). Capture every distinct area so nothing is missed.

---

### Frontend Style (ask whenever the frontend/admin is touched)

> Required when `affected-repos` includes `frontend` or `admin`, or any page/UI is in scope.

1. **Where** — which app and page(s) change visually?
2. **Design system** — should it match the existing design system and brand tokens (per `project/profile.md`), or is this a new visual direction?
3. **Reference (optional)** — do you have a screenshot, mockup, or Figma link for the intended style? Attach it in the chat. *(Optional — if none is provided, the AI follows the existing design system.)*
4. **Layout & components** — any specific layout, components, spacing, or interactions you want?
5. **States** — how should loading / empty / error / success look?
6. **RTL / localization** — any right-to-left or localization requirements (per `project/profile.md`)?

The AI presents the proposed visual approach and **asks you to confirm the style before implementing** the frontend. Providing a reference screenshot is always optional and never blocks the change.

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
