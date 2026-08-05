# Impact Analysis — Resource Types + Resources Catalog

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema (resource_types) | none | — | New collection needed |
| Schema (resources) | none | — | New collection needed |
| Contract (resource_types) | none | — | New repo interface |
| Contract (resources) | none | — | New repo interface |
| Repository (resource_types) | none | — | New Mongo repo |
| Repository (resources) | none | — | New Mongo repo |
| Service (resource_types) | none | — | New data service |
| Service (resources) | none | — | New data service |
| Endpoint (resource_types) | none | — | New controller |
| Endpoint (resources) | none | — | New controller |
| Page (resource_types) | none | — | New settings page |
| Page (resources) | none | — | New catalog page + edit form |
| DTO (resource_types) | none | — | New DTOs |
| DTO (resources) | none | — | New DTOs |
| Sidebar | complete | `roya-sales-ai-frontend/src/app/layout/sidebar/sidebar.component.ts` | Add nav items |
| Routes | complete | `roya-sales-ai-frontend/src/app/app.routes.ts` | Add routes |
| Models | complete | `roya-sales-ai-frontend/src/app/core/models/app.models.ts` | Add interfaces |
| AppDataService | complete | `roya-sales-ai-frontend/src/app/core/services/app-data.service.ts` | Add API methods |
| Tenant isolation | complete | `mongodb-generic.repository.ts` TENANT_ISOLATED_COLLECTIONS | Add 2 collection names |
| Ownership | complete | `common/services/ownership.service.ts` | Add 'resources' case |
| Defaults seed | none | — | New defaults file for resource types |

Feature state: **none** (entirely new module)

## Affected Modules

- **New: Resource Types** — admin config for dynamic type definitions with field schemas
- **New: Resources** — workspace catalog of typed items with dynamic data
- **Modify: Infrastructure** — persistence module registration, tenant isolation, ownership
- **Modify: Frontend Layout** — sidebar nav items, routes

## Pack blueprint files to create

- [ ] `blueprint/plan/data-model-delta.md` — resource_types + resources entities
- [ ] `blueprint/plan/modules-delta.md` — new module §15: Resources (Types + Catalog)
- [ ] `blueprint/actions/api/services/resource-types.md` — ResourceTypesDataService
- [ ] `blueprint/actions/api/services/resources.md` — ResourcesDataService
- [ ] `blueprint/actions/api/endpoints/resource-types.md` — /api/data/resource-types
- [ ] `blueprint/actions/api/endpoints/resources.md` — /api/data/resources
- [ ] `blueprint/actions/web/pages/resource-types.md` — Settings resource types page
- [ ] `blueprint/actions/web/pages/resources.md` — Resources catalog page + edit
- [ ] `blueprint/_index.md`

## Code files to create/modify

### API — New files
| File | Purpose |
|------|---------|
| `src/infrastructure/persistence/contracts/resource-types.repository.ts` | Repo interface |
| `src/infrastructure/persistence/contracts/resources.repository.ts` | Repo interface |
| `src/infrastructure/persistence/providers/mongodb/mongodb-resource-types.repository.ts` | Mongo impl + seed |
| `src/infrastructure/persistence/providers/mongodb/mongodb-resources.repository.ts` | Mongo impl |
| `src/services/data/resource-types.data.service.ts` | CRUD + seed |
| `src/services/data/resources.data.service.ts` | CRUD + lite + type filter |
| `src/modules/data/resource-types.controller.ts` | REST endpoints |
| `src/modules/data/resources.controller.ts` | REST endpoints + photo upload |
| `src/dtos/data/resource-types.dto.ts` | Validation DTOs |
| `src/dtos/data/resources.dto.ts` | Validation DTOs |
| `src/lib/defaults/resource-types.defaults.ts` | Seeded type definitions |

### API — Modify
| File | Change |
|------|--------|
| `src/infrastructure/persistence/persistence.tokens.ts` | Add 2 tokens |
| `src/infrastructure/persistence/persistence.module.ts` | Register 2 repos |
| `src/infrastructure/persistence/providers/mongodb/mongodb-generic.repository.ts` | Add 'resource-types', 'resources' to TENANT_ISOLATED_COLLECTIONS |
| `src/services/data/data-services.module.ts` | Register 2 data services |
| `src/modules/data/data.module.ts` | Register 2 controllers |
| `src/common/services/ownership.service.ts` | Add 'resources' case |

### Frontend — New files
| File | Purpose |
|------|---------|
| `src/app/pages/resource-types/resource-types.component.ts` | Settings page: list + create/edit dialog with field builder |
| `src/app/pages/resources/resources.component.ts` | Catalog list page (tabbed by type) |
| `src/app/pages/resources/resource-edit/resource-edit.component.ts` | Dynamic edit form |
| `src/app/shared/resource-type-dialog/resource-type-dialog.component.ts` | Type create/edit dialog |

### Frontend — Modify
| File | Change |
|------|--------|
| `src/app/core/models/app.models.ts` | Add ResourceType, ResourceTypeField, ResourceItem interfaces |
| `src/app/core/services/app-data.service.ts` | Add CRUD methods for both entities |
| `src/app/app.routes.ts` | Add routes for resource-types + resources |
| `src/app/layout/sidebar/sidebar.component.ts` | Add nav items |
| `src/assets/i18n/en.json` | Add translation keys |
| `src/assets/i18n/ar.json` | Add translation keys |

## Risk

- Complexity: **M** — follows established patterns but dynamic field builder is novel for this codebase
- Cross-module: **N** — self-contained; only infrastructure wiring touches existing code
- Migration: **N** — new collections, no schema changes to existing data

## Recommendation

- **Create**: All 11 new API files, 4 new FE files, 1 defaults file
- **Modify**: 6 API files (registration/wiring), 4 FE files (routing/nav/models/API client), 2 i18n files

## Status target (per artifact in the pack after implement)

| Artifact | Target |
|----------|--------|
| resource_types entity (data model) | done |
| resources entity (data model) | done |
| ResourceTypesDataService | done |
| ResourcesDataService | done |
| /api/data/resource-types endpoints | done |
| /api/data/resources endpoints | done |
| Resource Types settings page | done |
| Resources catalog page + edit | done |

## Dependencies

- depends-on: — (no dependencies)
