# Change Request

## Metadata
- **date**: 2026-07-28
- **change-type**: modify-feature
- **target-app**: api
- **affected-repos**: backend
- **priority**: high
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: verified
- **bug**: bug-014

## Scope
- Module(s): Pipeline v3 Templates (`pitch-landscape`, `website-template`); Assemble; Projects / DNA seed
- Feature(s): Client-first pitch branding; workspace intro section; client logo/image wiring
- Endpoint(s): none new (reuse existing generate/assemble paths)
- Page(s)/View(s): none (HTML/PDF template only; Settings/Clients UI unchanged)
- Service(s): AssembleService; ProjectsDataService (create / DNA seed); TemplateRenderService (if needed); pitch/website catalogs + Handlebars partials

## Description

**Problem (bug-014):** Users see PayUp (workspace Settings company + logo) on every pitch page and read it as “the client.” Client logo from DNA / Clients record often never appears because assemble only uses `purpose: client_logo` images and project/DNA create seeds `images: []`.

**Desired outcome — client-first deck:**

1. **Cover + content slides focus on the client**  
   - Cover hero: `client_logo` + `client_name` (and proposal title/meta).  
   - Remove workspace logo/name from per-section brand-marks (no PayUp chrome on every page).

2. **Dedicated workspace intro section**  
   - New catalog section key `about_workspace` (pitch-landscape + website-template if landing has equivalent slot).  
   - Content introduces the selling company using Settings-backed `workspace_*` vars + AI copy (who we are / why us).  
   - Placed near end (before `footer`), not on the cover.

3. **Footer = workspace contact / important info**  
   - Keep (and refine) footer as the home for `workspace_logo`, `workspace_name`, email, phone, address.  
   - Client name may remain as secondary close-out line.

4. **Client logo + images actually used**  
   - Assemble `client_logo` precedence: first DNA/project image `purpose: client_logo` → else `clients.logoUrl` for `proposal.clientId` / `project.clientId`.  
   - On project + DNA create: if client has `logoUrl` and no `client_logo` image yet, seed `{ purpose: "client_logo", url }` into `images[]`.  
   - Cover (and `client_context` if useful) always render `client_logo` when URL present.  
   - Pass DNA `images` map through render (already done); ensure cover/client sections surface logo; product/reference images remain available via `resolveImage` for AI content (no new gallery requirement unless cheap on cover).

**Out of scope:**
- Changing Settings company values (PayUp as agency name stays valid).
- Frontend Settings/Clients/Project form UI redesign.
- Creative pipeline v2 HTML path.
- Financial document template (`financial-cover-logo.png`) redesign (separate pack if needed).
- Preferring `client.company` over `client.name` for display name (unless trivial reuse already exists — do not expand scope).

**Locked decisions:**
- Namespaces stay distinct: `workspace_*` vs `client_*`.
- Workspace chrome removed from interior section headers; workspace appears in `about_workspace` + `footer` only.
- `about_workspace` is a real mapped section (not only static HTML inject), so it gets AI content + appears in section map.
- Backend-only; regenerate/re-assemble required for existing proposals to pick up template changes.
- Missing logos → omit `<img>`, never break generate.
- Applies to `pitch-landscape` v1; mirror brand-mark removal + workspace intro pattern on `website-template` v1 where the same workspace chrome exists.

## Acceptance Criteria

1. Assembled pitch HTML: interior section brand-marks do **not** show `workspace_logo` / `workspace_name` (client-focused headers or no agency mark).
2. Cover prominently shows `client_name` and `client_logo` when available; does **not** use workspace logo as the primary cover brand.
3. Deck includes an `about_workspace` section (before footer) that introduces the workspace company (name/logo + copy).
4. Footer still shows workspace logo/name and contact fields from Settings when present.
5. If Clients record has `logoUrl` and DNA/project has no `client_logo` image, assemble still sets `client_logo` from `clients.logoUrl`.
6. Creating a new project/DNA for a client with `logoUrl` seeds a `purpose: client_logo` image automatically.
7. Missing client/workspace logos never produce broken images; generate still succeeds.
8. Existing Settings sidebar / company logo upload behavior unchanged.
9. Bug-014 resolved for new generates: Zid (client) branding dominates cover/body; PayUp appears as agency only in workspace intro + footer.

## Notes

- Escalated from `bug-014-zid-proposal-shows-payup-branding.md`.
- Reverses the “workspace on every slide” placement from change-021 while keeping workspace vars and footer usage.
- Map/catalog/fixture updates required for `about_workspace` (schema, partial, seed template doc if applicable).
