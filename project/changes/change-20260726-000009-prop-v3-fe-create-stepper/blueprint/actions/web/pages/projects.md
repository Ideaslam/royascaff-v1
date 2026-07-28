# Pages — Safqa Web · Projects (Phase 5)

## Delta

- **Create** PG-PROJECTS-01..03
- Nav: sidebar under Proposals section when `projects.view` + (flag on OR always show list but create gated)
- i18n: ar/en keys under `projects.*` / `pipeline.*`

---

### Project List `PG-PROJECTS-01`
- Route: `/projects`
- Status: planned
- Components: PrimeNG table; status tag; Create button (`projects.create` + flag)
- Service: ProjectsService → EP-PROJECTS-02
- Guard: layout; `*appHasPermission="'projects.view'"`
- Notes: empty state → CTA create; row click → workspace

### Create Project `PG-PROJECTS-02`
- Route: `/projects/new` (or wizard dialog from list)
- Status: planned
- Components: PrimeNG `p-stepper` / `p-steps`:
  1. **Info** — client picker, name, type, competitors ≤3, researchOptions (market/competitor/audience)
  2. **Services** — line items → financials client-preview (server recomputes)
  3. **Attachments** — RFP file + images (multipart after project id exists — create project first then upload, or create-then-patch)
  4. **Template** — gallery cards from `GET /templates`; language `ar`|`en`
  5. **Generate** — `POST …/projects/:id/proposals` → navigate to proposal view/stepper
- Service: ProjectsService → EP-PROJECTS-01,06,07,10; Templates list EP-TPL-02
- Guard: `projects.create` + `pipelineV3Enabled`
- Notes: no designStyle/pageCount; on 403 flag → toast + link to settings/creative

**Create sequence (after-state):**
1. `POST /api/data/projects` → `projectId`
2. optional `POST …/rfp`, `POST …/images`
3. `POST …/proposals { templateKey, language }` → proposal
4. route `/proposals/:id/view` (or `/projects/:projectId/proposals/:id`) showing stepper

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: planned
- Components: header (name, client, DNA version/status); proposals table; actions: New proposal (template gallery dialog), Regenerate DNA (confirm → EP-PROJECTS-09)
- Service: EP-PROJECTS-03,08,09,10; proposals filtered by `projectId` if list API supports — else client filter from proposals search
- Guard: `projects.view`
- Notes: sibling create uses `templateKey` + `sourceProposalId` / `fromStep: "map"`

## Deferred

| Item | Pack |
|------|------|
| Full project edit form polish | later polish |
| Contracts tab on workspace | if contracts already link projectId — optional |
