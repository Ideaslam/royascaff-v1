# Pages — Safqa Web · Projects (pack delta)

## Delta
Rewrite **Create Project** (`PG-PROJECTS-02`) to match Creative form richness and UX while keeping the 4-step wizard + generate pipeline.

### Create Project `PG-PROJECTS-02`

- Route: `/projects/new`
- Status: done
- Components:
  - Step cards with Creative-like section headers
  - Client `p-select` (filter) + **Add client** → `CreateClientDialogComponent`
  - Digital presence grid (website, Instagram, X, LinkedIn, TikTok, Snapchat)
  - Competitors: 3 separate URL inputs with badges
  - Project details: name*, type select, description* (textarea), KPIs, budget `p-select`, duration `p-select`
  - Research checkboxes (launch set: market / competitor / audience)
  - Services: catalog from API (search + category groups), multi-select; selected rows allow override name/price/qty; show subtotal/tax/grand
  - Files: drag/drop upload zones; RFP file meta; image thumbnail strip + remove
  - Template gallery + language (unchanged behavior)
- Service:
  - `AppDataService` → clients lite/list, services list/categories
  - `ProjectsService` → create, uploadRfp, uploadImages, createProposal, listTemplates
- Guard: `projects.create` + `pipelineV3Enabled`
- Notes:
  - Reuse `PROJECT_TYPE_OPTIONS`, `PROJECT_BUDGET_OPTIONS`, `PROJECT_DURATION_OPTIONS` from `creative-form-options.ts`
  - Reuse Creative i18n keys where possible (`creative.fields.*`, `creative.digitalPresence`, etc.)
  - Submit `info` shape per pack data-model; competitors as `[{ url }]`
  - Validation step 0: clientId, name, description required
  - Validation step 1: ≥1 selected/overridden service with name + price > 0
  - RTL-safe grids; Safqa brand tokens; upload zones bordered dashed, filled state with check icon
  - Navigates to `/proposals/:id/view` after generate (unchanged)

### Unchanged in this pack
- `PG-PROJECTS-01` list, `PG-PROJECTS-03` workspace
