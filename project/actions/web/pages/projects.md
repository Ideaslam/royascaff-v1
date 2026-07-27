# Pages — Safqa Web · Projects

> Pipeline v3 FE — **primary** create path post-cutover. Gated by `projects.*` + `settings.pipelineV3Enabled` (default true).

### Project List `PG-PROJECTS-01`
- Route: `/projects`
- Status: done
- Components: table; Create CTA when flag on
- Service: ProjectsService → EP-PROJECTS-02
- Guard: layout; `projects.view`
- Notes: flag-off banner → Creative fallback (escape hatch)

### Create Project `PG-PROJECTS-02`
- Route: `/projects/new`
- Status: done
- Components:
  - Multi-step info → services → RFP/images → template gallery → generate
  - Creative-parity step cards: client select + Add client dialog; digital presence (6); 3 competitor URL fields; project details (name*, type, description*, KPIs, budget/duration selects); research checkboxes; catalog services; drag/drop upload zones + image thumbnails
  - Selected-service overrides: **name | revenue type `p-select` | price | qty | delete** + totals
- Service: EP-PROJECTS-01,06,07,10; EP-TPL-02; AppDataService clients/services catalog
- Guard: `projects.create` + `pipelineV3Enabled`
- Notes:
  - Reuse Creative constants/i18n (`REVENUE_TYPE_OPTIONS`); competitors payload `[{ url }]`; description required
  - On catalog select: seed `revenueType` + derived `unit` (label); override re-derives `unit`
  - Submit payload: `name`, `price`, `qty`, `revenueType`, `unit` (derived)
  - Price display: `SAR / {unit or revenueType label}`; `ratio` → `(n%)`
  - Navigates to `/proposals/:id/view` with stepper; primary AI proposal creation path
  - Card chrome is global (`styles.css` / `PG-UI-CARD-01`); full-width responsive grids

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: done
- Components: DNA summary; proposals table; New proposal (sibling); Regenerate DNA
- Service: EP-PROJECTS-03,09,10; proposals search filter by projectId
- Guard: `projects.view`

### Project Edit `PG-PROJECTS-04`
- Route: `/projects/:id/edit`
- Status: done
- Components: same info/services fields as create; selected overrides match Create (**name | revenue type | price | qty**)
- Service: EP-PROJECTS-03,04
- Guard: `projects.edit`
- Notes:
  - Load binds revenue-type select; skips invalid/empty service rows (legacy `[[]]` corruption)
  - Save payload mirrors Create service fields
