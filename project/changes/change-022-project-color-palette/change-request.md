# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: new-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: low
- **request-id**: REQ-PALETTE
- **part**: —
- **depends-on**: change-021 (merged — `purpose: client_logo` for AI color fallback)
- **blocks**: —
- **pack-status**: verified

## Scope
- Module(s): Projects; Pipeline v3 DNA / branding; Template render (`pitch-landscape`)
- Feature(s): Project color palette chooser; DNA branding from palette or client logo; pitch CSS vars from branding colors; DNA-stale badge on Regenerate
- Endpoint(s): extend project create/patch (no new routes); existing DNA regenerate
- Page(s)/View(s): `web`: Create Project, Edit Project (Branding card); Project Workspace (Regenerate DNA badge)
- Service(s): ProjectsDataService; DNA / branding pipeline step; TemplateRender / Assemble; FE ProjectsService + reusable palette component

## Description

Proposal colors today are not driven by a project-level palette. Users need to choose a palette that fits the **project** (not only the client), store it, and have DNA branding + pitch templates use it.

**Deliver:**

1. **Reusable color palette component** (full mock UX, simplest implementation — no heavy libs)
   - Vertical swatches; hex labels; add / delete / reorder (drag); lock; random palette; undo / redo
   - Edit popover: hex + visual picker (saturation/brightness square + hue) + RGB inputs; Cancel / Save
   - Empty until user picks; empty state CTAs: “Add color” / “Random palette”
   - Skip mock footers: “Copy link”, “Get color palette”
   - Max 5 colors — hide “+ Add color” at 5; once any color is set, must keep ≥1 (no clear-all to empty via delete of last)
   - Invalid hex → reject save (UI + API validation)
   - en/ar + RTL-safe; PrimeNG / Roya card chrome

2. **Create / Edit Project — Branding card**
   - Own card on create (`/projects/new`) and edit (`/projects/:id/edit`)
   - Bind to `colorPalette: string[]` (ordered hex list)
   - Optional: omit / `[]` / null when user never picks → AI fallback
   - When set: length **1–5**, normalized `#RRGGBB`

3. **Persist on project**
   - Field `colorPalette?: string[]` on project create/patch
   - Load on Edit; round-trip on save

4. **DNA branding**
   - If `colorPalette` present (1–5) → `dna.branding.colors` = that list (passthrough / inject)
   - If null/empty → AI (or extraction) builds branding colors from project image(s) with `purpose: client_logo` (change-021)
   - If no client logo either → **Roya brand defaults** (profile tokens); generate continues

5. **Pitch template / PDF CSS (in scope)**
   - Wire branding colors into `pitch-landscape` CSS variables / theme so proposal chrome uses the palette
   - Flexible list: map by index/order into template roles (AI/template assignment of semantic roles can refine later; ship a deterministic mapping e.g. `[0]=primary`, `[1]=secondary`, … with Roya fallbacks for missing slots)

6. **Regenerate DNA badge (Edit / Workspace)**
   - After a **successful project save that changed any field** (not only branding), show a badge/dot on **Regenerate DNA**
   - Clear badge only after **successful DNA regenerate**
   - Leave Edit without save → no badge

**Out of scope:**
- Creative pipeline 3-color picker migration / parity
- Shareable palette URLs (“Copy link”)
- New permissions or new HTTP routes
- Audit logging of palette changes
- Other templates beyond `pitch-landscape` v1

**Locked decisions:**
- `request-id`: REQ-PALETTE; priority low
- Hard dep on change-021 (`client_logo`)
- Full mock UX minus Copy link / Get palette CTAs
- Simplest FE approach (custom + native color inputs as needed)
- Auth unchanged: `projects.create` / `projects.edit` / `projects.view`

## Acceptance Criteria

1. Create and Edit Project show a **Branding** card with the reusable palette component (empty until user picks; Add / Random empty CTAs).
2. Palette supports add/delete/reorder/lock/random/undo/redo and edit popover (hex + picker + RGB); max 5 (Add hidden at 5); cannot delete last remaining color; invalid hex rejected on Save.
3. Project create/patch persists `colorPalette` (1–5 hexes when set; omit/null/`[]` when never set); Edit loads existing values.
4. DNA branding uses `colorPalette` when set; when empty, derives colors from `purpose: client_logo` image(s); when neither, uses Roya defaults; generate does not fail solely for missing palette.
5. Assembled `pitch-landscape` HTML/CSS reflects branding colors (CSS vars / theme) from DNA branding.
6. After any successful project field save from Edit, Workspace **Regenerate DNA** shows a badge/dot; badge clears only after successful DNA regenerate.
7. en + ar strings; RTL layout does not break swatches or popover.
8. No new permissions/endpoints; create/submit and pipeline v3 still work when palette omitted.
9. “Copy link” / “Get color palette” not present in the form.

## Notes

- Pack is **blocked** until change-021 is `verified` or `merged` (client logo purpose required for AI fallback).
- Component should live under shared UI so Create/Edit both import it.
- Deterministic index→role CSS mapping is enough for v1; richer AI role naming can be a follow-up.
