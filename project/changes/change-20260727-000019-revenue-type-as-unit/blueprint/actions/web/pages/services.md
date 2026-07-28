# Pages — Safqa Web · Services (pack delta)

## Delta
Treat **revenue type** as the billing unit. Remove free-text Unit from catalog UI; persist `unit` as the selected revenue-type label for legacy consumers.

### Services List `PG-SERVICES-01`

- Route: `/services`
- Status: done
- Components: table — columns include revenue type; **no separate Unit column**
- Service: AppDataService → EP-SERVICES-01/06
- Guard: layout
- Notes:
  - Revenue type cell uses `getRevenueTypeLabel(row.revenueType)` (existing)
  - Price cell unchanged (`ratio` → `% of campaign value`)

### Service Edit `PG-SERVICES-02`

- Route: `/services/new`, `/services/:id/edit`
- Status: done
- Components: bilingual form with Revenue type `p-select` + Price; **no Unit text input**
- Service: AppDataService → EP-SERVICES-03/04/05
- Guard: layout
- Notes:
  - Options: `REVENUE_TYPE_OPTIONS` (`creative-form-options.ts`)
  - On save: `revenueType` = select value; `unit` = matching option **label** (empty string if unset / placeholder)
  - Form model may drop editable `unit`; still send derived `unit` in create/update payload
  - Load/edit: ignore stored free-text for editing; select binds to `revenueType` only
