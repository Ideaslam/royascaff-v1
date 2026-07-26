# Pages — Safqa Web · Proposals

### Proposals List `PG-PROPOSALS-01`
- Route: `/proposals`
- Status: done
- Components: table/filters
- Service: AppDataService → EP-PROPOSALS-01/02/08
- Guard: layout (authGuard commented)
- Notes: paginated list

### Proposal View `PG-PROPOSALS-02`
- Route: `/proposals/:id/view`
- Status: done
- Components: VisualEditor / HTML preview
- Service: AppDataService → EP-PROPOSALS-05, document HTML
- Guard: layout

### Proposal Edit `PG-PROPOSALS-03`
- Route: `/proposals/:id/edit`
- Status: done
- Components: forms, visual editor
- Service: AppDataService → EP-PROPOSALS-05/07/09/10/11/13/14
- Guard: layout

### Proposal Wizard Entry `PG-PROPOSALS-04`
- Route: `/proposal`
- Status: done
- Components: proposal creation flow entry
- Service: AppDataService / creative services → EP-PROPOSALS-06, AI jobs
- Guard: layout
