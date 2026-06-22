# Change Request

> Fill in the fields below to describe your change, then tell the AI: **"Start Phase 5"**.
> See `2-templates/change-request-template.md` for the field reference and a filled-in example.
> When Phase 5 completes, this file will be cleared and the change archived to `6-changes/change-log.md`.

---

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
> For new-app: list the existing modules/features to reuse, plus any new ones.

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

## Acceptance Criteria

> Numbered list of testable outcomes that confirm the change is done correctly.

1. [First criterion]
2. [Second criterion]
3. [Add more as needed]

---

## New App Definition (only when change-type is `new-app`)

> Remove this section if change-type is not `new-app`.
> See `2-templates/new-app-template.md` for the full field reference and examples.

- **app-name**: [short name, e.g. "Customer Mobile App"]
- **app-purpose**: [one sentence — what this app does and who uses it]
- **target-platform**: [web | mobile-ios | mobile-android | mobile-cross-platform]
- **tech-stack**: [e.g. Angular 21 + PrimeNG | React Native | Flutter | React + Tailwind]
- **auth-strategy**: [same-backend-jwt | separate-auth | sso | none]

### Modules to Include from Existing Codebase

| Module | Include? | Features included | Features excluded |
|--------|:--------:|-------------------|-------------------|
| [module name] | full / partial / no | [feature list] | [feature list] |

### New Modules / Features (specific to this app)

- [New module/feature name]: [brief description]

### App-Specific Pages

1. [Page name] — [what it shows / does]
2. [Page name] — [what it shows / does]

---

## Notes (optional)

> Design decisions, constraints, related context, things to avoid.

[Optional — remove this section if not needed]
