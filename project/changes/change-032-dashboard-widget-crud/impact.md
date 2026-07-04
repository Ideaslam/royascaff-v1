# Impact — change-032-dashboard-widget-crud

## Scope
Dashboard widget CRUD on customer-portal viewer + backend pipeline wiring.

## Feature state
- Endpoints EP-DASH-10/11/12 existed but add/update used direct DB writes, not AI pipelines.
- Frontend had `DashboardsService.addWidget/updateWidget/removeWidget` but no UI.

## Changes
| Area | Action |
|------|--------|
| `dashboards.service.ts` (BE) | Wire add/update to `add-widget` / `edit-widget` pipelines |
| `dashboard.dto.ts` | `CreateWidgetDto` → `{ widgetRequest }`; `UpdateWidgetDto` + optional `widgetRequest` |
| `pipeline.engine.ts` | Return `{ pipelineRunId, metadata }` |
| `add-widget-ai.step.ts` / `edit-widget-ai.step.ts` | Fix prompt var `userRequest` |
| `dashboard-viewer.page.*` | Add/Edit/Delete widget UI |
| Plan docs | endpoints + pages updated |

## Ripple
- `dashboard-generation.processor.ts`, `data-sync.processor.ts` — destructure new pipeline return type
