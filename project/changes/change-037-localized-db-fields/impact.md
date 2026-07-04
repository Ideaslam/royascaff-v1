# Impact — change-037-localized-db-fields

## Naming convention
English in existing fields; Arabic companions with `Ar` suffix (`titleAr`, `nameAr`, …).

## Backend — Modify
| Area | Files |
|------|-------|
| Util | `common/utils/localized.util.ts` (new) |
| Schemas | subscription-plan, widget-definition, notification, project, dashboard, chart-widget |
| DTOs | subscription.dto.ts, project.dto, dashboard.dto |
| Pipelines | save-widgets, save-single-widget, save-updated-widget steps |
| Services | dashboards.service (duplicate), notifications.service + repository |
| Processors | data-sync.processor (bilingual notify strings) |
| AI prompts | dashboard-generate.md, add-widget.md, edit-widget.md |
| Seeder | widget-definition.seeder.ts (+ displayNameAr) |

## Frontend customer-portal — Modify
| Area | Files |
|------|-------|
| Core | i18n.service.ts (localized helper), localized.pipe.ts (new) |
| Models | subscription, dashboard, project, notification |
| Pages | subscriptions, notifications, dashboard-viewer, shared-viewer, projects-list, project-detail |

## Admin — Modify
| Area | Files |
|------|-------|
| Models | admin.models.ts |
| Pages | plans.page.ts (form + display) |

## Planning docs — Modify in place
- `project/plan/data-model.md` — add `*Ar` fields to affected entities

## Ripple
- No breaking API changes; new optional fields only.
- Existing documents without `*Ar` display English via fallback.
