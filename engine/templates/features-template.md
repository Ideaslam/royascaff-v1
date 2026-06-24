# Features File Template

## Short Summary

Use this template when creating `features.md`.  
The `features.md` file should document **all product features grouped by module**, and every feature entry inside a module should use the same structure.

## Purpose

This template is not for endpoint code, page code, module folder scaffolding, or UI implementation.  
It is a documentation template for listing functional features in one consistent format **under each module from `modules.md`**.

Each module section should explain:

- what the module does in product terms
- which audience uses it
- every feature owned by that module

Each feature entry inside a module should describe:

- feature name and purpose
- main subfeatures
- important domain fields or inputs when relevant
- visibility (`frontend`, `backend-only`, or `both`)
- planning notes and constraints

## File-Level Rules

- `features.md` is created **after** `modules.md`.
- Use the **exact module names** from `modules.md` as section headers: `## Module: {Module Name}`.
- Every module section must list **all features** for that module — do not leave features undocumented or placed under the wrong module.
- Every feature inside a module must use the same section order.
- Describe product behavior and business capability, not API routes or page routes.
- One feature may require many endpoints and many pages.
- Do not assume one feature equals one endpoint or one page.
- Do not assume one module equals one feature — most modules contain multiple features.
- Mark backend-only features explicitly when they have no dedicated UI.
- Keep feature names stable because they will be used to derive `endpoints.md` and `pages.md`.
- If a feature spans multiple modules, document it once under the primary owning module and reference the related module in `Notes`.

## Recommended `features.md` Structure

```md
# Features

## Short Summary

{One paragraph: what product this feature map supports and where it comes from.}

Source inputs:

- `modules.md`
- `{reference doc or prototype}`
- `{reference doc or prototype}`

Its purpose is to define the full feature list **for each module** that will later be used to build:

- `endpoints.md`
- `pages.md`

This file is not an endpoint list and not a page list. It is the feature source-of-truth grouped by module.

## How To Use This File

When AI builds `endpoints.md`:

- use the same module names from this file
- convert each backend-relevant feature and subfeature into one or more API endpoints under the matching module
- do not assume one feature equals one endpoint

When AI builds `pages.md`:

- use the same module names from this file
- convert each frontend-visible feature and subfeature into one or more pages under the matching module
- do not assume one feature equals one page

## Product Scope

{One paragraph describing the product.}

The main business flow is:

1. {Step 1}
2. {Step 2}
3. {Step 3}

## Features By Module

## Module: {Module Name}

{module feature block}

## Module: {Module Name}

{module feature block}

## Feature Coverage Summary

| Module | Feature Count | Backend Features | Frontend Features |
|---|---:|---:|---:|
| `{Module Name}` | {count} | {count} | {count} |
| `{Module Name}` | {count} | {count} | {count} |

## Feature Priority For Endpoint And Page Planning

## Phase 1: Core Required Modules

### Module: {Module Name}

- {Feature Name}
- {Feature Name}

## Phase 2: {Phase Name}

### Module: {Module Name}

- {Feature Name}
- {Feature Name}

## Important Planning Notes

- One module may contain many features.
- One feature may require many endpoints and many pages.
- Some features are backend-only and may not need dedicated pages.
- Some UI screens are workflow stages inside one module, not separate modules.

Examples:

- {Example 1}
- {Example 2}

## Final Guidance

Use this file as the feature map before generating `endpoints.md` and `pages.md`.

The correct order of work is:

1. define modules in `modules.md`
2. define all features for each module in `features.md`
3. derive endpoints from modules and features
4. derive pages from modules and features

Do not jump directly from the prototype UI to endpoint or page lists without completing modules and features first.
```

## Single Module Feature Block Template

Use one block per module. It must include **all features** for that module.

```md
## Module: {Module Name}

### Module Purpose

{Clear explanation of what this module does in product terms.}

### Module Scope

- Backend: `{yes | no}`
- Frontend: `{yes | no}`
- Audience: `{internal users | admin | public | mixed}`

### Features In This Module

#### Feature 1: {Feature Name}

##### Purpose

{Clear explanation of what this feature does.}

##### Main Subfeatures

- {Subfeature 1}
- {Subfeature 2}
- {Subfeature 3}

##### Visibility

- `{frontend | backend-only | both}`

##### Notes

- {Constraint, dependency, or workflow note}
- {Constraint, dependency, or workflow note}

#### Feature 2: {Feature Name}

{repeat feature entry format}
```

## Single Feature Entry Template

Use this format for every feature inside a module.

```md
#### Feature {Number}: {Feature Name}

##### Purpose

{Clear explanation of what this feature does in product terms.}

##### Main Subfeatures

- {Subfeature 1}
- {Subfeature 2}
- {Subfeature 3}

##### Visibility

- `{frontend | backend-only | both}`

##### Notes

- {Constraint, audience, backend/frontend note, or dependency}
- {Constraint, audience, backend/frontend note, or dependency}
```

## Extended Feature Entry Template

Use optional subsections when a feature has important domain fields, pricing inputs, or reference categories.

```md
#### Feature {Number}: {Feature Name}

##### Purpose

{Clear explanation of what this feature does in product terms.}

##### Main Subfeatures

- {Subfeature 1}
- {Subfeature 2}
- {Subfeature 3}

##### Main {Entity} Fields

- {Field or domain input}
- {Field or domain input}

##### Pricing Inputs

- {Input used by pricing or calculation logic}
- {Input used by pricing or calculation logic}

##### Reference Domains

- {Category or business subdomain from the product}
- {Category or business subdomain from the product}

##### Visibility

- `{frontend | backend-only | both}`

##### Notes

- {Constraint, audience, backend/frontend note, or dependency}
- {Constraint, audience, backend/frontend note, or dependency}
```

## Compact Module Feature Block Template

Use this if you want a shorter style but still list all module features.

```md
## Module: {Module Name}

- Purpose: `{what this module does}`
- Scope: `backend={yes|no}, frontend={yes|no}`
- Features:
  - `{Feature Name}` — `{short purpose}` — `{frontend|backend-only|both}`
  - `{Feature Name}` — `{short purpose}` — `{frontend|backend-only|both}`
- Notes:
  - `{module-level planning note}`
```

## Cross-Cutting Sections Template

### Feature Coverage Summary

```md
## Feature Coverage Summary

| Module | Feature Count | Backend Features | Frontend Features |
|---|---:|---:|---:|
| `{Module Name}` | {count} | {count} | {count} |
| `{Module Name}` | {count} | {count} | {count} |
```

### Feature Priority

```md
## Feature Priority For Endpoint And Page Planning

## Phase 1: Core Required Modules

### Module: {Module Name}

- {Feature Name}
- {Feature Name}

## Phase 2: {Workflow or Secondary Phase Name}

### Module: {Module Name}

- {Feature Name}
- {Feature Name}
```

## Example

```md
## Module: Auth

### Module Purpose

Control who can access the system and what they are allowed to manage.

### Module Scope

- Backend: `yes`
- Frontend: `yes`
- Audience: `public and authenticated users`

### Features In This Module

#### Feature 1: User Login

##### Purpose

Allow a user to authenticate and enter the portal.

##### Main Subfeatures

- submit email and password
- validate credentials
- store auth session or token
- redirect to app shell after success

##### Visibility

- `both`

##### Notes

- the reference app may use simplified login behavior, but the real system must implement secure auth

#### Feature 2: User Registration

##### Purpose

Allow a new user to create an account when registration is enabled.

##### Main Subfeatures

- collect registration fields
- validate input
- create user record
- redirect to login or auto-login

##### Visibility

- `both`

##### Notes

- registration rules depend on product policy and role assignment

#### Feature 3: Role-Based Access Control

##### Purpose

Restrict pages and backend actions based on user role.

##### Main Subfeatures

- define allowed roles
- protect admin routes
- protect admin endpoints
- enforce role checks in services

##### Visibility

- `both`

##### Notes

- admin pages must be protected by role
```

## Suggested Field Meanings

- `Module Name`
  must match the module name from `modules.md` exactly
- `Module Purpose`
  why this module exists and what business area it owns
- `Features In This Module`
  complete list of features owned by the module
- `Feature Name`
  stable product capability label used for planning and downstream docs
- `Purpose`
  why this feature exists inside the module
- `Main Subfeatures`
  concrete user or system capabilities inside the feature
- `Visibility`
  whether the feature needs frontend UI, backend-only behavior, or both
- `Main {Entity} Fields`
  important domain data attached to the feature when it owns a business entity
- `Pricing Inputs`
  values that affect commercial calculation for this feature
- `Reference Domains`
  categories or business areas referenced by the feature
- `Notes`
  auth, async behavior, admin-only rules, persistence, or workflow constraints
- `Feature Coverage Summary`
  quick check that every module has all features documented
- `Phase 1 / Phase 2 / Phase 3`
  rollout priority grouped by module and feature

## Final Guidance

When AI creates `features.md`, it should:

1. read `modules.md` first
2. create one `## Module: {Module Name}` section for every module
3. document **all features** for each module before moving to the next module
4. use the same feature entry format everywhere

The filled project-specific feature map should live in `project/plan/features.md`, not in this template file.
