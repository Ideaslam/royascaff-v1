# Pages — Safqa Web · Projects (pack delta)

## Delta
Add edit + DNA view pages; wire Edit / Delete / View DNA on workspace (and optional list archive). Reuse Create Project field patterns and Shopify-like cards.

### Project Workspace `PG-PROJECTS-03` (modify)
- Route: `/projects/:id`
- Status: planned
- After-state components / actions:
  - Breadcrumb: `Projects → {name}`
  - Header actions (permission-gated):
    - **Edit** → `/projects/:id/edit` (`projects.edit`)
    - **View DNA** → `/projects/:id/dna` (`projects.view`)
    - **Delete** → confirm → `ProjectsService.delete` / archive (`projects.delete`) → navigate `/projects`
    - Keep: New proposal, Regenerate DNA, Back (or rely on crumb)
  - Body: keep proposals table; DNA summary card links to DNA page; optional short facts strip (client, type, updated)
- Notes: ConfirmDialog for delete; soft archive only

### Project Edit `PG-PROJECTS-04` (new)
- Route: `/projects/:id/edit`
- Status: planned
- Components:
  - Breadcrumb: `Projects → {name} → Edit`
  - Form parity with Create (single scroll or same section cards — no generate/template step):
    - Client select + Add client
    - Digital presence (6)
    - Competitors (3 URL fields)
    - Project details: name*, type, description*, KPIs, budget, duration
    - Research checkboxes
    - Services catalog + overrides + totals
    - Optional: RFP/images re-upload (nice-to-have; if heavy, defer and keep files on create-only)
  - Save → `PATCH` via `ProjectsService.patch`; Cancel → workspace
- Guard: `projects.edit` + `pipelineV3Enabled` (or allow edit when viewing archived? — only active projects)
- Validation: same as create step 0/1 for required fields
- Notes: load project into form; do not start proposal generation from edit

### Project DNA / Facts `PG-PROJECTS-05` (new)
- Route: `/projects/:id/dna`
- Status: planned
- Components:
  - Breadcrumb: `Projects → {name} → DNA`
  - **Project values** sections (read-only cards): client, type, description/summary, KPIs, budget, duration, digital presence, competitors, research options, services + financial totals, RFP/images meta
  - **DNA** sections (read-only, structured): client, digitalPresence, competitors, project, research (selectedOptions + module status if present), services/financial from DNA; empty state when no `dna.data`
  - Actions: Regenerate DNA (`projects.edit`); Back to workspace
- Guard: `projects.view`
- Service: `ProjectsService.get` + `getDna` (or dna from get if embedded)
- Notes: no raw JSON dump as primary UI; optional collapsible “Raw DNA” at bottom for support

### Project List `PG-PROJECTS-01` (light touch)
- Status: planned
- Optional: row action Archive/Delete with confirm (`projects.delete`)
- Notes: not required if workspace delete is enough — prefer at least workspace; list optional

### Shared breadcrumb
- Lightweight component used by projects pages (and proposal view pack page)
- Trail items: `{ label, routerLink? }`; current page not a link
- Style: muted text, `/` or chevron separators; RTL-safe
