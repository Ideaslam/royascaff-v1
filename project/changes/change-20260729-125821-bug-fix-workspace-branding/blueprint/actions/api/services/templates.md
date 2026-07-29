# Services — Templates (workspace brand, not Roya) — pack delta

### SVC-TPL-02 · TemplateRenderService [domain, internal, Templates]
- Status: planned
- Rules (after-state additions):
  - Root branding vars unchanged (`workspace_*` / `client_*` from Assemble)
  - **No hardcoded agency product names** on pitch / website / **roya-presentation** disks: no `Roya`, `Roya Safqa`, `رويا صفقة`, or `{{else}}Roya` fallbacks
  - Missing `workspace_name` / `client_name` → omit chrome text (empty), never invent a default brand
  - **Client-first** (unchanged intent): cover + interior chrome use `client_*`; workspace logo/name only in `about_workspace` + footer
  - Fixtures: sample workspace + client only (Example Agency / fixture contacts) — never Roya Safqa / `roya.marketing` as sample seller identity

### SVC-TPL-05 · Fixture render
- Status: planned
- Rules (after-state):
  - Footer `contacts` / `thanks` use sample agency strings (e.g. `hello@example.agency`, “Example Agency team” / Arabic equivalent)
  - Branding sample `workspace_name` remains Example Agency (already); keep consistent

## Disk rules — `roya-presentation/v1/partials` (implement checklist)

1. **Every** partial with `By {{#if workspace_name}}…{{else}}Roya{{/if}}` → use **client-first** chrome:
   - Prefer `{{#if client_name}}…{{client_name}}…{{/if}}` (or omit “By …” when empty)
   - **Never** `{{else}}Roya`
2. `about_workspace.hbs`:
   - Left chrome: `About {{workspace_name}}` when set; else omit / generic “About us” (EN) / “من نحن” (AR) — **not** “About Roya”
   - Right chrome: workspace name when set; no Roya fallback
3. Footer / cover already Settings-aware — leave role; only remove any remaining Roya literals if found

## Delta

- **Change** roya-presentation interior chrome → `client_name` (parity with pitch client-first); remove all `Roya` string fallbacks
- **Change** `about_workspace` chrome label → workspace-backed
- **Change** fixture footer sample identity away from Roya Safqa
- **Tighten** SVC-TPL-02 rule: no hardcoded Roya (not only Safqa / رويا صفقة)
