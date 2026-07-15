# Change Request

## Metadata
- **date**: 2026-07-15
- **change-type**: modify-page
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: medium

## Scope
- Module(s): Projects (Create Dashboard UI), Data (lite list projection)
- Feature(s): Create Dashboard — synced dataset picker
- Endpoint(s): `GET /api/v1/data/datasets/lite` (enrich response only; no new route)
- Page(s)/View(s): customer-portal: project-detail (New Dashboard side drawer)
- Service(s): DatasetService / DatasetRepository `findSelectableLitePaginated` (projection); DataService.listDatasetsLite (FE types)

## Description

### Problem
The New Dashboard dataset picker is hard to use for multi-table and multi-source selection: selection indicators look like single-choice radios, there is no select-all per data source, the selected tray at the top consumes vertical space as selections grow, duplicate table names are hard to disambiguate, and type-only grouping/filtering makes managing tables across sources awkward.

### Who is affected
- Customer Portal users creating a dashboard from Project Detail
- Not affected: Admin Panel, landing site, template-based create flow, data-source setup/import wizards

### Desired behavior
Redesign the dataset picker inside the existing Create Dashboard side drawer so users can:

1. Select multiple tables easily (clear checkbox multi-select)
2. Select **all tables in the same data source** via group-header **Select all / Deselect all**
3. Select tables across **multiple data sources** without losing selection when filtering/searching
4. Manage selection via a **compact sticky summary** (“N tables · M sources”) that expands to show removable chips — replacing the large top selected tray
5. Distinguish tables by showing **data source name** (and type icon) in the list hierarchy

**Backend (minimal):** Enrich `GET /data/datasets/lite` items with `dataSourceId` and `dataSourceName` so the UI can group and bulk-select by data source. Raise usable default page size on the FE so group select-all covers a practical set of loaded tables. Create dashboard API and payload (`datasetIds[]`) remain unchanged.

### Out of scope
- Create-from-template dataset matching UI
- Setup wizard entity-select / import flows
- New endpoints or data-model entities/fields
- Dashboard generation pipeline / AI logic
- Admin panel

### User story
As a Customer Portal user, when I create a dashboard I can quickly pick many tables from one data source or across several, with select-all per source and a compact way to review what I chose, then generate as today.

### Permissions / data
- Auth unchanged (JWT, workspace-scoped lite list)
- Only synced/selectable datasets (existing `analyticsTable != null` rule)
- No sensitive-data or audit changes

## Acceptance Criteria
1. Dataset list in New Dashboard drawer is grouped by **Data Source** (name + type icon), not only by source type
2. Each group header provides **Select all** / **Deselect all** for tables currently loaded in that group
3. Individual rows use **checkbox** multi-select (not radio-style circles)
4. Selection survives type-filter and search changes (selected IDs retained when items leave the current page/view)
5. Compact sticky selection summary shows count of tables and distinct sources; expands to manage/remove chips and clear all
6. Duplicate/ambiguous table names are disambiguated via data source context in the UI
7. `GET /data/datasets/lite` returns `dataSourceId` and `dataSourceName` on each item; existing fields still present
8. Generate Dashboard still requires ≥1 dataset and posts the same `datasetIds` create payload
9. Loading, empty (“connect data first”), and no-results states still work
10. New UI strings are in EN + AR and layout remains RTL-safe
11. Name + purpose fields and drawer chrome behavior (cancel, backdrop, size) remain unchanged

## Notes
- Priority: medium — UX friction on a core create flow
- Visual approach: match existing Roya / PrimeNG patterns; reference = current screenshot + agreed UX table
- Select-all scope: loaded items in the group (pagination retained); default page size increased for usability
- Plan doc updates: `project/actions/customer-portal/pages/projects.md` (+ lite endpoint/response note if documented under Data endpoints)
