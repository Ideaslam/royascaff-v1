## Module: Color Templates

`@Controller('color-templates')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-CTPL-01 | GET | /api/v1/color-templates | JWT | query: activeOnly? | 200 `ColorTemplateDto[]` | SVC-CTPL.list() | Use `?activeOnly=true` for branding |
| EP-CTPL-02 | GET | /api/v1/color-templates/:id | JWT | `:id` param | 200 `ColorTemplateDto` | SVC-CTPL.getById() | |
| EP-CTPL-03 | POST | /api/v1/color-templates | JWT+admin | `{ name, primary, secondary, accent, chartColors[5], isActive? }` | 201 `ColorTemplateDto` | SVC-CTPL.create() | |
| EP-CTPL-04 | PATCH | /api/v1/color-templates/:id | JWT+admin | `:id` · partial `ColorTemplateDto` fields | 200 `ColorTemplateDto` | SVC-CTPL.update() | |
| EP-CTPL-05 | DELETE | /api/v1/color-templates/:id | JWT+admin | `:id` param | 204 | SVC-CTPL.delete() | Clears references in WorkspaceBranding |
