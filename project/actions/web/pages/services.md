# Pages — Safqa Web · Services

### Services List `PG-SERVICES-01`
- Route: `/services`
- Status: done
- Components: table — columns include revenue type + price; **no separate Unit column**
- Service: AppDataService → EP-SERVICES-01/06
- Guard: layout
- Notes:
  - Revenue type cell uses `getRevenueTypeLabel` (`creative-form-options.ts`)
  - Price: `ratio` → `% of campaign value`; else SAR amount

### Service Edit `PG-SERVICES-02`
- Route: `/services/new`, `/services/:id/edit`
- Status: done
- Components: bilingual form with Revenue type `p-select` + Price; **no Unit text input**
- Service: AppDataService → EP-SERVICES-03/04/05
- Guard: layout
- Notes:
  - Options: `REVENUE_TYPE_OPTIONS`
  - On save: `revenueType` = select value; `unit` = matching option **label** via `revenueTypeToUnit` (legacy consumers / PDF)
  - Select binds to `revenueType` only (free-text unit not editable)
