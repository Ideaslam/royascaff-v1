# Services — Pipeline v3 Assemble branding (pack delta)

### SVC-PIPE-S3-05 · AssembleService [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `runAssemble(job)` — load ready sections; inject financials; resolve DNA images; load Settings workspace branding; resolve `client_logo`; map DNA colorRoles → themeOverrides; render HTML/PDF; upload; enqueue export
- Branding resolution (root Handlebars):
  | Key | Source |
  |-----|--------|
  | `workspace_name` | settings.companyName |
  | `workspace_logo` | settings.logoUrl |
  | `workspace_email` / `workspace_phone` / `workspace_address` | settings |
  | `client_name` | proposal.clientName \|\| project.clientName |
  | `client_logo` | (1) first DNA/project image with `purpose === 'client_logo'` and url → (2) else Clients record `logoUrl` for `proposal.clientId` \|\| `project.clientId` → (3) else `""` |
- Also keep `images[id] → url` map for `resolveImage` (DNA images preferred, else project.images)
- Deps: TemplateRenderService, PdfRenderService, ProposalsRepository, ProjectsRepository, ProjectDnaVersionsRepository, SettingsDataService, **ClientsRepository**
- Side effects: CPU, browser, S3
- Rules:
  - no AI; missing logos → empty string (`{{#if}}`); never inject product “Safqa” fallback
  - Clients lookup failure → log warn, continue with empty `client_logo`
  - Placement of vars is owned by disk templates (client-first cover/body; workspace in about_workspace + footer)

## Delta

- **Change** `client_logo` resolution: add Clients.`logoUrl` fallback after purpose image
- **Add** ClientsRepository dependency on AssembleService
