# Services — Templates / pitch-landscape (pack delta)

### SVC-TPL-02 · TemplateRenderService [domain, internal, Templates]
- Status: planned
- Methods: `renderProposalHtml` (extended input)
- Input add:
  - `branding?: { workspace_name, workspace_logo, workspace_email, workspace_phone, workspace_address, client_name, client_logo }`
- Rules:
  - Merge branding onto **root** context for **every** partial compile and layout (so `{{workspace_name}}` works without nesting)
  - Keep `content.*`, `meta.clientName`, `images`, `financial` as today
  - Alias: also expose `client_name` even when `content.clientName` exists (distinct namespace for workspace vs client)
- Fixture path: supply sample branding strings/empty logos so fixture-render does not rely on hardcoded Safqa

### pitch-landscape HBS contract (disk)

**Remove** all hardcoded product marks:
- Cover: `رويا صفقة · Roya Safqa`
- Section chrome: `Safqa` inside `.brand-mark`

**Cover** (`cover.hbs`):
- Workspace: `{{#if workspace_logo}}<img src="{{workspace_logo}}" …>{{/if}}` + `{{workspace_name}}`
- Client: `{{client_name}}` (or keep `content.clientName` for AI title block) + optional `{{#if client_logo}}…{{/if}}`
- Title/subtitle/date unchanged from content/meta

**Footer** (`footer.hbs`):
- Workspace logo + `{{workspace_name}}`
- Contacts: `{{workspace_email}}`, `{{workspace_phone}}`, `{{workspace_address}}` (omit empty lines)
- Keep AI `content.title` / thanks / client line as designed — client line uses `client_name` / `content.clientName`, not workspace

**Section brand-marks** (all partials with `.brand-mark`):
```hbs
<div class="brand-mark">
  {{#if workspace_logo}}<img class="brand-logo" src="{{workspace_logo}}" alt="" />{{/if}}
  {{#if workspace_name}}{{workspace_name}}{{/if}}
</div>
```
- If both empty → empty brand-mark (no Safqa fallback)
- Add minimal CSS for `.brand-logo` (height ~5–6mm) in `theme.css` if needed

## Delta

- **Extend** TemplateRenderService root context with branding keys
- **Modify** cover, footer, and all Safqa brand-mark partials
- **Update** fixtures branding
- **No** product-name fallback in PDF HTML
