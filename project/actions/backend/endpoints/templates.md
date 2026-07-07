## Module: Canonical Templates *(change-049)*

Customer browse: `@Controller('templates')` · Admin CRUD: `@Controller('admin/template-catalog')`

### Customer (JWT)

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-TPL-01 | GET | /api/v1/templates/industries | JWT | — | 200 `IndustryDto[]` (active only, with active fields nested) | SVC-TPL.listIndustries(true) | Bilingual names/descriptions; sorted by `sortOrder` |
| EP-TPL-02 | GET | /api/v1/templates | JWT | query: fieldId | 200 `TemplateSummaryDto[]` (active only) | SVC-TPL.listTemplates(fieldId, true) | Summary: names, description, requiredModels, preview — no blueprint |
| EP-TPL-03 | GET | /api/v1/templates/:id | JWT | `:id` | 200 `TemplateDetailDto` | SVC-TPL.getTemplate() | Includes `requiredModels` with `usedFields`; 404 if missing/inactive |
| EP-TPL-04 | GET | /api/v1/templates/:id/matching-datasets | JWT | `:id` | 200 `{ semanticFlag, required, datasets: DatasetSummary[] }[]` | SVC-DATA-DS.listBySemanticFlags() | Per required model: workspace's ready datasets with matching `semanticFlag`; empty array ⇒ UI blocks with "needs a dataset flagged X" |

### Admin (JWT + admin role)

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-TPL-10 | GET | /api/v1/admin/template-catalog/industries | admin | — | 200 `IndustryDto[]` (incl. inactive) | SVC-TPL.listIndustries(false) | |
| EP-TPL-11 | POST | /api/v1/admin/template-catalog/industries | admin | `CreateIndustryDto` { key, nameEn, nameAr?, descriptionEn?, descriptionAr?, icon?, sortOrder? } | 201 `IndustryDto` | SVC-TPL.createIndustry() | 409 on duplicate `key` |
| EP-TPL-12 | PATCH | /api/v1/admin/template-catalog/industries/:id | admin | `UpdateIndustryDto` | 200 `IndustryDto` | SVC-TPL.updateIndustry() | |
| EP-TPL-13 | PATCH | /api/v1/admin/template-catalog/industries/:id/toggle | admin | — | 200 `IndustryDto` | SVC-TPL.toggleIndustryActive() | |
| EP-TPL-14 | DELETE | /api/v1/admin/template-catalog/industries/:id | admin | — | 204 | SVC-TPL.deleteIndustry() | 409 while fields exist |
| EP-TPL-15 | GET | /api/v1/admin/template-catalog/industries/:id/fields | admin | — | 200 `FieldDto[]` (incl. inactive) | SVC-TPL.listFields(id, false) | |
| EP-TPL-16 | POST | /api/v1/admin/template-catalog/industries/:id/fields | admin | `CreateFieldDto` | 201 `FieldDto` | SVC-TPL.createField() | 409 on duplicate key within industry |
| EP-TPL-17 | PATCH | /api/v1/admin/template-catalog/fields/:id | admin | `UpdateFieldDto` | 200 `FieldDto` | SVC-TPL.updateField() | Also `/toggle` variant like industries |
| EP-TPL-18 | DELETE | /api/v1/admin/template-catalog/fields/:id | admin | — | 204 | SVC-TPL.deleteField() | 409 while templates exist |
| EP-TPL-19 | GET | /api/v1/admin/template-catalog/fields/:id/templates | admin | — | 200 `TemplateSummaryDto[]` (incl. inactive) | SVC-TPL.listTemplates(id, false) | |
| EP-TPL-20 | GET | /api/v1/admin/template-catalog/templates/:id | admin | — | 200 `TemplateDetailDto` (full blueprint) | SVC-TPL.getTemplate() | |
| EP-TPL-21 | POST | /api/v1/admin/template-catalog/fields/:id/templates | admin | `CreateTemplateDto` { key, nameEn, nameAr?, …, requiredModels[], widgetBlueprint[], layoutColumns? } | 201 `TemplateDetailDto` | SVC-TPL.createTemplate() | 400 with structured `BlueprintValidationError[]` when blueprint references unknown canonical fields/widget types |
| EP-TPL-22 | PATCH | /api/v1/admin/template-catalog/templates/:id | admin | `UpdateTemplateDto` | 200 `TemplateDetailDto` | SVC-TPL.updateTemplate() | Same blueprint validation; also `/toggle` variant |
| EP-TPL-23 | DELETE | /api/v1/admin/template-catalog/templates/:id | admin | — | 204 | SVC-TPL.deleteTemplate() | Never affects dashboards already created from it |

**Notes:**
- Admin controller uses class-level `@Roles(UserRole.ADMIN)` (global `JwtAuthGuard` + `RolesGuard`), same as `admin-datasource-types.controller.ts`.
- Customer endpoints filter `isActive = true` transitively (inactive industry hides its fields/templates).
- [EP-TPL-04] "ready" = `analyticsTable != null && syncStatus != syncing` — same readiness rule as EP-DASH-01.
