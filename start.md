# AI-Control Framework — Orchestration Guide

## Overview

This framework drives AI from a product description through planning, action specifications, code generation, and verification to produce a complete, consistent application.

Follow each phase in order. Each step declares its **Inputs**, **Template**, **Output**, and **Done-when** criteria.

---

## Phase 0 — Understand

### Goal
Read the user's product description and rewrite it into a complete, unambiguous specification that AI can use as the authoritative source for all downstream planning.

### Step 0.1 — Refine Description

- **Input**: `1-description.md` (initial user draft)
- **Template**: None (interactive refinement)
- **Output**: `1-description.md` (rewritten)
- **Done when**:
  - Product purpose is clear
  - Primary user and workflow are described
  - Core features are listed
  - Key entities/data are identified
  - Integrations and constraints are documented
  - No incomplete sentences or "TBD" placeholders remain

---

## Phase 1 — Plan

### Goal
Generate the planning documents that define modules, features, custom rules, and data model. Outputs land in `3-plan/` and `5-rules/`.

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

---

## Phase 2 — Actions

### Goal
Generate endpoint and page specifications. Outputs land in `4-actions/`.

### Step 2.1 — Create Endpoints Specification

- **Input**: 
  - `1-description.md`
  - `3-plan/modules.md`
  - `3-plan/features.md`
  - `3-plan/data-model.md`
  - `5-rules/backend-rule.md`
  - `5-rules/custom-feature-rules.md`
- **Template**: `2-templates/endpoints-template.md`
- **Output**: `4-actions/endpoints.md`
- **Done when**:
  - Every backend-relevant feature has at least one endpoint
  - Endpoints are grouped by module
  - Each endpoint declares method, route, auth, input, output, and constraints
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
  - Each page declares route, components, services, models, and endpoints used
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
  - `4-actions/endpoints.md`
  - `5-rules/backend-rule.md`
  - `5-rules/custom-feature-rules.md`
- **Output**: Code in `src/` (or project-specific backend folder)
- **Done when**:
  - All modules from `modules.md` have corresponding backend folders
  - All schemas from `data-model.md` are implemented
  - All endpoints from `endpoints.md` are implemented
  - Layered architecture (controller → service → repository) is followed
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

2. **Feature-to-Endpoint Coverage**
   - Every backend-relevant feature has at least one endpoint in `4-actions/endpoints.md`
   - No orphaned endpoints that don't map to features

3. **Feature-to-Page Coverage**
   - Every frontend-visible feature has at least one page in `4-actions/pages.md`
   - No orphaned pages that don't map to features

4. **Entity Consistency**
   - All entities referenced in `endpoints.md` and `pages.md` are defined in `data-model.md`
   - All DTOs mentioned in endpoints exist in `data-model.md` or are derivable from entities

5. **Endpoint-to-Page Linking**
   - Every endpoint listed in a page's "Backend Endpoints Used" exists in `endpoints.md`
   - Routes and HTTP methods match exactly

6. **Auth Coverage**
   - Every protected endpoint declares auth requirements
   - Every protected page declares route guard requirements
   - Auth patterns are consistent across backend and frontend

7. **Custom Rules Compliance**
   - Constraints in `custom-feature-rules.md` are reflected in endpoints/pages/code
   - AI/integration/async requirements are implemented correctly
   - Provider integrations are properly isolated

8. **UI State Coverage**
   - Every data-driven page documents loading/empty/error/success states
   - All forms have validation and error display
   - All lists have pagination and empty states

9. **Path and Naming Consistency**
   - No dead or stale file paths (e.g., `docs/references/...`, `D:/...`)
   - File/folder names match references in all documents
   - Module/feature/entity names are consistent across all files

10. **Code Layering Compliance**
    - Backend follows controller → service → repository pattern per `backend-rule.md`
    - Frontend follows page → service → HTTP pattern per `frontend-rule.md`
    - No business logic in controllers or components
    - Integration providers are isolated

### Verification Report

When checks are complete, produce a verification report:

```markdown
# Verification Report

## Status: [PASS | ISSUES FOUND]

## Module Coverage: [✓ | ✗]
- [Details if issues found]

## Feature Coverage: [✓ | ✗]
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

## Summary
[Overall assessment and recommended fixes]
```

---

## Done

When all phases complete and verification passes, the framework has produced:

- Complete planning documents in `3-plan/`
- Complete action specifications in `4-actions/`
- Project-specific rules in `5-rules/`
- Backend code following all specifications
- Frontend code following all specifications
- A verification report confirming consistency

The system is ready for testing and iteration.
