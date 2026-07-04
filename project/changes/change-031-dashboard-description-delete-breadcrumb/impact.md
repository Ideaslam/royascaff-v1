# Impact — change-031-dashboard-description-delete-breadcrumb

## Scope
Customer-portal frontend: Project Detail (dashboard list) + Dashboard Viewer pages.

## Feature state
- `purposeDescription` — exists on Dashboard model/API; not shown on cards or viewer.
- `DELETE /dashboards/:id` — complete; no usage decrement on delete (limit check uses create-time assert only).
- Breadcrumb on viewer — partial (Projects → dashboard name only; missing project link).

## Files to change
| File | Action |
|------|--------|
| `project-detail.page.html/ts/scss` | Add description + delete on dashboard cards |
| `dashboard-viewer.page.html/ts/scss` | Add description, delete button, project breadcrumb |
| `project/actions/customer-portal/pages/projects.md` | Update Project Detail spec |
| `project/actions/customer-portal/pages/dashboards.md` | Update Viewer spec |

## Ripple
None — reuses existing `DashboardsService.remove()` and `ProjectsService.getById()`.

## Limit rule
Delete must not restore dashboard quota. Backend `deleteDashboard` already has no decrement; frontend will not call usage/subscription refresh after delete.
