# Change Request Template

This template defines the structure for a single change request submitted to Phase 5 (Change Mode).

Create a change folder `project/changes/change-<NNN>-<slug>/` (next number from `change-log.md`), copy the **Change Request** block below into it as `change-request.md`, fill in every field, then start Phase 5.

---

## How to Use This Template

1. Create `project/changes/change-<NNN>-<slug>/change-request.md` from this template.
2. Replace all `[placeholder]` values with your actual content.
3. Keep every section header — the AI reads them by name.
4. One change per file. If you have multiple unrelated changes, complete them sequentially.
5. Tell the AI: **"Start Phase 5"** to trigger the workflow.

As Phase 5 runs, the AI adds more files to the same folder: `recon.md` (existing-code review, Step 5.0b), then `verify-plan.md` and `verify-code.md`. You only author `change-request.md`.

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

List the specific modules, features, endpoints, pages, or services that are directly in scope. Be as specific as you can — module names from `project/plan/modules.md`, feature names from `project/plan/features.md`, endpoint routes from `project/actions/endpoints.md`, page names from `project/actions/pages.md`.

---

### `description`

Plain-language description of the change. Can be:
- A single sentence ("Add a bulk-delete endpoint for CSV files")
- A paragraph explaining the business need
- A rough spec with sub-points

The AI will extract the technical details. You do not need to specify file paths or implementation details.

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

> List the exact modules, features, endpoints, pages, or services in scope.
> Use names from the planning docs (modules.md, features.md, endpoints.md, pages.md).
> For new-app: list the existing modules/features you want to reuse, plus any new ones.

- Module(s): [e.g. Data, Dashboards]
- Feature(s): [e.g. CSV Upload, Column Metadata Editor]
- Endpoint(s): [e.g. POST /api/v1/data/upload, GET /api/v1/data/:id/columns]
- Page(s): [e.g. files-list, upload-wizard]
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

- Module(s): Data
- Feature(s): CSV File Management
- Endpoint(s): POST /api/v1/data/bulk-delete
- Page(s): files-list
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
