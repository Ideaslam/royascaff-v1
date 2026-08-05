# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: new-module
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-CATALOG
- **part**: 1/2
- **depends-on**: —
- **blocks**: change-20260805-184301
- **pack-status**: merged

## Scope
- Module(s): Resource Types (new), Resources (new)
- Feature(s): Configurable resource type definitions, workspace-scoped resource catalog
- Endpoint(s): CRUD for `/api/data/resource-types`, CRUD for `/api/data/resources`
- Page(s)/View(s): web: Resource Types settings page, Resources catalog page + edit form
- Service(s): ResourceTypesDataService, ResourcesDataService

## Description

### Problem
The system needs workspace-scoped catalogs for team members, partners, collaborators (UGC/influencers), and other entity types that feed into proposals. Hard-coding separate modules per entity type (team, partners, influencers) would make the platform industry-specific and rigid.

### Solution — Dynamic Resource Catalog
A single **Resources** module with user-configurable **Resource Types**. Each type defines its own field schema (name, data type, AI hint), so any workspace can model whatever entities their industry needs — without code changes.

### Resource Types (admin-managed configuration)
- Workspace-scoped definitions: key, name (AR/EN), description (AR/EN), icon, AI context hint
- Each type has a dynamic **fields** array where each field defines:
  - `key` — slug identifier
  - `label` / `labelEn` — display labels (AR/EN)
  - `dataType` — one of: `text`, `textarea`, `photo`, `url`, `list`, `number`, `email`, `phone`, `social-links`
  - `required` — boolean
  - `aiHint` — how the AI should interpret this field for DNA/proposals
  - `sortOrder` — field display order
- Seed defaults on first workspace access (or workspace create): "Team Member", "Partner", "Collaborator" with sensible field presets
- Settings-area management UI (table + create/edit dialog with field builder)

### Resources (workspace catalog)
- Each resource belongs to a type (by `typeId` / `typeKey`)
- Core fields always present: `name`, `nameEn`, `photo` (optional convenience), `summary`, `summaryEn`, `tags[]`
- Dynamic `data: {}` object stores type-specific field values
- Management UI: list page grouped/filtered by type tab, dynamic edit form rendered from type's field definitions
- Photo fields render as image upload (S3), list fields as tag-style input, social-links as structured repeater
- Active/inactive toggle for soft-archive

### UX Principles
- Resource Types live under Settings (like service-categories — admin configuration)
- Resources live in main nav (like services — daily catalog management)
- Edit form dynamically renders fields based on selected type's definition
- Bilingual labels (AR/EN) on all fields, RTL-aware
- PrimeNG components: DataTable for list, Dialog or routed page for edit, Chips for tags, FileUpload for photos

## Acceptance Criteria
1. `resource_types` collection created; CRUD API at `/api/data/resource-types` with WorkspaceAuthGuard
2. `resources` collection created; CRUD API at `/api/data/resources` (+ `/lite` picker endpoint) with WorkspaceAuthGuard
3. Resource Types settings page: list types, create/edit with field builder (add/remove/reorder fields, set data types)
4. Resources catalog page: tabbed by type, list with search/filter, add/edit with dynamic form
5. Photo fields upload to S3 via existing upload infrastructure
6. Default types seeded: "Team Member" (jobTitle, photo, email, summary), "Partner" (logo, website, summary), "Collaborator" (photo, title, summary, portfolio, socialLinks)
7. Resources list supports pagination, search by name, filter by type and tags
8. Bilingual support (AR/EN) on all labels and content fields

## Notes
- Follow existing services catalog pattern: flexible Mongo schema, repository → data service → controller
- Resource Types = admin/configuration concern (settings permission); Resources = catalog concern (own permission key)
- The `data: {}` dynamic fields approach mirrors how services store `scopeOfWork`, `executionAndDelivery` etc. — Mongo `strict: false` handles arbitrary shapes
- Part 2/2 covers DNA integration and proposal section support
