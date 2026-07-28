# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: medium
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: change-20260727-000020 (soft — code already ships `settings.logoUrl`; pack may still be unmerged)
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Projects; Pipeline v3 Assemble / Template render (`pitch-landscape`)
- Feature(s): Project image purpose; pitch workspace branding + client logo via distinct template vars
- Endpoint(s): extend `POST /api/data/projects/:id/images`; add/patch image metadata (purpose/note) as needed
- Page(s)/View(s): `web`: Create/Edit Project — images step; (no Settings changes — reuse change-20260727-000020 logo)
- Service(s): ProjectsDataService; AssembleService; TemplateRenderService; DNA passthrough; FE ProjectsService + project-create

## Description

Pitch templates hardcode product brand text (“رويا صفقة · Roya Safqa” / “Safqa”) instead of the selling workspace. Project images also have no purpose, so a client logo cannot be placed correctly.

**Deliver:**

1. **Project form — image purpose**  
   On create/edit project images UI, each uploaded image gets:
   - **purpose** enum: `client_logo` | `product` | `reference` | `other` (default `other`)
   - optional free-text **userNote** (keep existing field)
   Persist on `project.images[]` and pass through DNA (`purpose` + `userNote`).

2. **Remove hardcoded Safqa brand marks**  
   Delete fixed copy such as `رويا صفقة · Roya Safqa` and section header `Safqa` brand-marks across `pitch-landscape` partials. Replace with workspace-driven vars (below). No product-name fallback in the PDF.

3. **Workspace template context (from Settings)** — distinct from client  
   Assemble loads workspace settings and injects a **root** Handlebars context (available in every partial), separate from `content.clientName` / proposal meta:

   | Template var | Source (`settings`) | Notes |
   |--------------|---------------------|--------|
   | `{{workspace_name}}` | `companyName` | Selling company name |
   | `{{workspace_logo}}` | `logoUrl` | URL string for `<img src="…">` |
   | `{{workspace_email}}` | `email` | |
   | `{{workspace_phone}}` | `phone` | |
   | `{{workspace_address}}` | `address` | |

   Client-side vars stay separate, e.g. `{{client_name}}` / `{{content.clientName}}`, `{{client_logo}}` — never conflated with workspace_*.

4. **Client logo from project image purpose**  
   First image with `purpose: client_logo` → `{{client_logo}}` (URL). Cover (and footer if useful) can show client logo next to client name. Missing → omit `<img>` (no broken image).

5. **Where workspace vars appear**  
   - **Cover** — workspace logo + name (replaces hardcoded brand mark); client name/logo separate  
   - **Footer** — workspace logo + name + contact (email/phone/address)  
   - **Section brand-marks** (every partial that currently shows “Safqa”) — use `{{workspace_name}}` and/or small `{{workspace_logo}}` instead  

**Out of scope:**
- Other templates beyond `pitch-landscape` v1
- Public proposal web chrome / auth screens
- Settings logo upload UI (change-20260727-000020)
- Inventing logos via AI

**Locked decisions:**
- Purpose = enum + optional `userNote`
- One effective client logo (first `client_logo`)
- Template vars: **snake_case root** `workspace_*` / `client_*` (not nested-only); must be distinct namespaces
- Soft dep on change-20260727-000020 `logoUrl`
- Auth: `projects.edit`
- Missing workspace/client logo → omit image, still render text fields that exist; generate continues
- **No** “Roya Safqa” / “Safqa” hardcoded fallback in pitch HTML

## Acceptance Criteria

1. Create/Edit Project images UI lets the user set **purpose** (and optional note) per image; values persist on reload.
2. `project.images[]` stores `purpose` + optional `userNote`; DNA skeleton includes the same.
3. Assembled HTML has **no** hardcoded `رويا صفقة` / `Roya Safqa` / standalone product brand-mark `Safqa` in cover or section headers.
4. Cover and footer (and former Safqa brand-mark slots) render via `{{workspace_name}}`, `{{workspace_logo}}`, and contact vars from Settings when present.
5. `{{client_name}}` / content client fields and `{{client_logo}}` are independent of workspace vars; client logo comes from first `purpose: client_logo` image.
6. Missing logo URLs → no broken `<img>`; generate still succeeds.
7. Multiple `client_logo` images → first wins for `{{client_logo}}`.
8. Users without `projects.edit` cannot change image purpose (same gate as upload).
9. Change-020 Settings/sidebar logo behavior remains unchanged.

## Notes

- Inject workspace + client alias map in `TemplateRenderService` root context (partials + layout), not only inside `content.*`.
- Upload path today forces `userNote: ""`; extend multipart purposes/notes and/or PATCH images metadata.
- Optional Handlebars helpers: `{{#if workspace_logo}}…{{/if}}` already works if vars are root strings.
