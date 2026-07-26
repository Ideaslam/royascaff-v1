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
- Components: multi-step info → services → RFP/images → template gallery → generate
- Service: EP-PROJECTS-01,06,07,10; EP-TPL-02
- Guard: `projects.create` + `pipelineV3Enabled`
- Notes: navigates to `/proposals/:id/view` with stepper; primary AI proposal creation path

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: done
- Components: DNA summary; proposals table; New proposal (sibling); Regenerate DNA
- Service: EP-PROJECTS-03,09,10; proposals search filter by projectId
- Guard: `projects.view`
