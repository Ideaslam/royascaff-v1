# Pages — Safqa Web · Projects (pack delta)

### Shared · ColorPaletteChooser `CMP-PALETTE-01`
- Status: planned
- Location: `src/app/shared/color-palette/` (standalone)
- Behavior (full mock, simplest custom impl — no heavy color lib):
  - Empty state: CTAs **Add color** / **Random palette**
  - Swatches (vertical strip): hex label; drag reorder; lock; edit; delete
  - Toolbar: Random palette; + Add color (hidden at 5); undo / redo
  - Edit popover: hex input; saturation/brightness square + hue slider; RGB inputs; Cancel / Save changes
  - Constraints: max **5**; once ≥1 color, cannot delete last; invalid hex → reject Save
  - Skip: “Copy link”, “Get color palette”
- API: `[(colors)]` / `colorsChange` as `string[]`; optional `disabled`
- i18n: en + ar; RTL-safe popover/swatches
- Style: match attached mock; sit inside Roya/`p-card` chrome

### Create Project `PG-PROJECTS-02`
- Route: `/projects/new`
- Status: planned
- Components delta:
  - New **Branding** `p-card` on info step (after project details card)
  - Hosts `CMP-PALETTE-01`; bound to form `colorPalette` (start `[]`)
  - Submit payload includes `colorPalette` when length 1–5; omit or send `[]` when empty
- Guard: unchanged
- Notes: does not block submit when empty (AI/logo/Roya fallback on DNA)

### Project Edit `PG-PROJECTS-04`
- Route: `/projects/:id/edit`
- Status: planned
- Components delta:
  - Same **Branding** card + `CMP-PALETTE-01`
  - Load `colorPalette` from project; save via patch
  - On **successful save** that changed any field (dirty check vs loaded snapshot): set client flag e.g. `dnaStale=true` (session/local for that projectId) before navigate to workspace
- Guard: unchanged

### Project Workspace `PG-PROJECTS-03`
- Route: `/projects/:id`
- Status: planned
- Components delta:
  - **Regenerate DNA** control shows badge/dot when `dnaStale` for this project
  - After successful `regenerateDna` → clear `dnaStale`
  - Leave Edit without save → no badge
- Optional: same cue on DNA page regenerate button if present
- Guard: unchanged

### FE ProjectsService / models
- Status: planned
- `Project` model + create/patch bodies: `colorPalette?: string[]`
- Methods unchanged except payload fields

## Delta

- **Create** shared ColorPaletteChooser
- **Modify** Create + Edit with Branding card
- **Modify** Workspace Regenerate DNA badge
- **i18n** keys for palette + Branding card (en/ar)
