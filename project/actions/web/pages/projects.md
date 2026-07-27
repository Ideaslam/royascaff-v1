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
  - Creative-parity step cards: client select + Add client dialog; digital presence (6); 3 competitor URL fields; project details (name*, type, description*, KPIs, budget/duration selects); research checkboxes; catalog services with name/price/qty overrides + totals; drag/drop upload zones + image thumbnails
- Service: EP-PROJECTS-01,06,07,10; EP-TPL-02; AppDataService clients/services catalog
- Guard: `projects.create` + `pipelineV3Enabled`
- Notes:
  - Reuse Creative constants/i18n; competitors payload `[{ url }]`; description required
  - Navigates to `/proposals/:id/view` with stepper; primary AI proposal creation path
  - Shopify-like form cards (hairline border, no heavy shadow); full-width responsive grids

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: done
- Components: DNA summary; proposals table; New proposal (sibling); Regenerate DNA
- Service: EP-PROJECTS-03,09,10; proposals search filter by projectId
- Guard: `projects.view`
