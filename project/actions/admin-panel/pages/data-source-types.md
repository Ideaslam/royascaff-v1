## Module: Data Source Types *(change-048, change-072)*

### Data Source Types Page
- Route: `/app/data-source-types`
- Components: DataSourceTypesPage — table of all `datasource_type_meta` rows (Type key, Title EN/AR, Logo URL, **Active** toggle, **Coming soon** toggle, Edit action). Edit dialog updates bilingual titles, logo URL, and bilingual instructions. Active toggle calls `PATCH .../toggle`; Coming soon toggle calls `PATCH .../:type` with `{ comingSoon }` *(change-072)*.
- Service: DatasourceTypesAdminService — `getAll()` → `GET /api/v1/admin/data-source-types`; `update(type, dto)` → `PATCH /api/v1/admin/data-source-types/:type`; `toggleActive(type)` → `PATCH /api/v1/admin/data-source-types/:type/toggle`
- Guard: authGuard + admin role
- Notes: standalone component, inline template, signals, PrimeNG table/dialog/toggleswitch/toast; admin app has no ngx-translate — bilingual content edited via `*En`/`*Ar` form fields; sidebar nav item "Data Source Types" (icon `pi-database`) in `app-shell.ts`. No create/delete — type set fixed to `DataSourceType` enum.
