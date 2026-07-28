# Pages — Safqa Web · Projects (pack delta)

## Delta
Selected-service overrides gain a **revenue type** select (the unit). User can override name, unit (revenue type), price, and quantity on Create and Edit.

### Create Project `PG-PROJECTS-02` (modify)

- Route: `/projects/new`
- Status: done
- Components (services step only — rest unchanged):
  - Catalog multi-select unchanged
  - Selected overrides row: **name** | **revenue type `p-select`** | **price** | **qty** | delete
  - Totals unchanged (ratio excluded from sum)
- Service: unchanged endpoints
- Guard: `projects.create` + `pipelineV3Enabled`
- Notes:
  - Options: `REVENUE_TYPE_OPTIONS` (same as services)
  - On select from catalog: seed `revenueType` + derived `unit` (label) from catalog service
  - When user changes revenue type in override: update `revenueType` and re-derive `unit` from label
  - Submit payload per selected row: `name`, `price`, `qty`, `revenueType`, `unit` (derived)
  - Price display under catalog cards: `SAR / {unit or revenueType label}`; `ratio` → `(n%)`

### Project Edit `PG-PROJECTS-04` (modify)

- Route: `/projects/:id/edit` (existing)
- Status: done
- Components: same override row as Create — name | revenue type select | price | qty | delete
- Service: existing project update
- Guard: existing project edit permissions
- Notes:
  - Load: bind select to stored `revenueType`; if missing, leave placeholder (legacy free-text `unit` still sent until user picks a type)
  - Save payload mirrors Create fields

### Unchanged in this pack
- `PG-PROJECTS-01` list, `PG-PROJECTS-03` workspace, `PG-PROJECTS-05` DNA view
- Template gallery / generate / uploads
