# Services — Pipeline v3 Sections/Assemble (pack delta)

### SVC-PIPE-S3-05 · AssembleService [domain, internal, PipelineV3]
- Status: planned
- Methods:
  - `runAssemble(job)` — existing assemble + PDF path, **plus**:
    1. Load public workspace settings (`SettingsDataService.getPublicSettings` or equivalent)
    2. Build branding map from settings + project/proposal + project.images
    3. Pass branding into `TemplateRenderService.renderProposalHtml`
- Branding resolution:
  | Key | Value |
  |-----|--------|
  | `workspace_name` | settings.companyName \|\| `""` |
  | `workspace_logo` | settings.logoUrl \|\| `""` |
  | `workspace_email` | settings.email \|\| `""` |
  | `workspace_phone` | settings.phone \|\| `""` |
  | `workspace_address` | settings.address \|\| `""` |
  | `client_name` | proposal.clientName \|\| project.clientName \|\| `""` |
  | `client_logo` | url of **first** `project.images` with `purpose === 'client_logo'` \|\| `""` |
- Also keep `images[id] → url` map for `resolveImage`
- Deps: **+ SettingsDataService** (or Settings repository/public getter); existing repos/render/pdf/s3
- Side effects: unchanged (CPU, browser, S3)
- Rules: no AI; missing logos → empty string (templates use `{{#if}}`); never inject product “Safqa” fallback

## Delta

- **Add** Settings load + branding payload into assemble → render
- **Add** `client_logo` resolution from image purpose
