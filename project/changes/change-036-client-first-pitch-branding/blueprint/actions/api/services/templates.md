# Services — Templates (client-first branding pack delta)

### SVC-TPL-02 · TemplateRenderService [domain, internal, Templates]
- Status: planned (placement via disk; render API unchanged)
- Rules (after-state additions):
  - Root branding vars unchanged (`workspace_*` / `client_*`)
  - Disk partials enforce **client-first** placement (see disk rules below)
  - Fixtures include `about_workspace` section content for AR + EN

### SVC-TPL-04 · pitch-landscape catalog seed
- Status: planned
- Rules (after-state):
  - **21** section defs (was 20) including new `about_workspace`
  - `requiredKeys`: `["cover", "financial", "about_workspace", "footer"]`
  - `about_workspace`:
    - purpose: Introduce the selling workspace / agency
    - whenToUse: Near end before footer
    - repeatable: false
    - pages: min 1 max 1
    - contentSchema (pitch lengths): required `title`, `intro`, `highlights` (array of short strings, 3–5 items); optional `tagline`
  - Disk: `templates/pitch-landscape/v1/partials/about_workspace.hbs`
  - Cover: primary brand = `client_logo` + `client_name` (no workspace brand-mark as hero)
  - Interior partials: remove `workspace_logo` / `workspace_name` from `.brand-mark` (page-num chrome may remain; optional subtle client name — prefer empty/minimal chrome)
  - Footer: keep workspace logo/name + contact

### SVC-TPL-06 · pitch-landscape-formal catalog seed
- Status: planned
- Rules: clones pitch sections (inherits `about_workspace`); `requiredKeys` must include `about_workspace`; shares pitch disk partials

### SVC-TPL-05 · Fixture render
- Status: planned
- Rules: fixtures for all **21** shippable pitch sections incl. `about_workspace`; branding sample has both workspace + client

### SVC-TPL-08 · website-template catalog + landing disk
- Status: planned
- Rules (after-state):
  - Add `about_workspace` section def + `requiredKeys` includes it
  - Disk: `templates/website-template/v1/partials/about_workspace.hbs`
  - `layout.hbs` sticky header: prefer `client_logo` / `client_name` (not workspace) as navbar brand
  - Footer: keep workspace logo/name + contacts
  - Cover: keep client_name / client_logo emphasis

## Disk rules (implement checklist)

**pitch-landscape `v1/partials`:**
1. `cover.hbs` — client logo + name as primary; drop workspace brand-mark from cover (or demote to non-hero if layout needs a tiny mark — default: **omit**)
2. Every interior section with `.brand-mark` workspace vars → remove workspace logo/name (keep page number)
3. New `about_workspace.hbs` — workspace logo/name + AI content fields
4. `footer.hbs` — unchanged role (workspace contact home)

**website-template `v1`:**
1. `layout.hbs` header → client branding
2. New `about_workspace.hbs` section
3. `footer.hbs` — workspace remains

## Delta

- **Add** `about_workspace` to pitch / formal / website catalogs + disk partials + fixtures
- **Change** requiredKeys (+ about_workspace)
- **Change** remove per-page / sticky-header workspace chrome; client-first cover + website header
- **Keep** footer workspace branding
