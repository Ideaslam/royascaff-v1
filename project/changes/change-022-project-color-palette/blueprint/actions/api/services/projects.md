# Services — Safqa API · Projects (pack delta)

### SVC-PROJECTS-01 · ProjectsDataService create / update [domain, Projects]
- Status: planned
- Methods:
  - `create(…)` — accept optional `colorPalette`; normalize + validate; persist top-level on project doc
  - `update(…)` / patch — same for `colorPalette` (set array, or clear to `null`/`[]` only if product allows empty — **locked**: once set in UI must keep ≥1; API may accept `[]`/`null` for “never set” / legacy)
- Validation:
  - If present and non-empty: length **1–5**
  - Each entry: valid hex → normalize to `#RRGGBB` (uppercase or lowercase — pick one, prefer `#` + 6 hex lowercase)
  - Invalid hex or length → **400** reject save
- Deps: ProjectsRepository
- Side effects: none beyond Mongo write

### DNA branding inject (Analyze — dna-passthrough / orchestrator)
- Status: planned
- Rules (ordered):
  1. If `project.colorPalette` length 1–5 → `dna.branding.colors = palette`; `source: palette`
  2. Else if any image `purpose === 'client_logo'` → derive 1–5 colors from logo (simplest: vision/prompt on logo URL, or lightweight extract — **no heavy npm dep required**); `source: client_logo`
  3. Else → Roya defaults e.g. `["#47B5E6","#114261","#2C8DBE"]` (match catalog / `BRAND`); `source: roya_default`
- **Force-reconcile** after Claude `dna.core` merge: re-apply `branding.colors` (+ source) so AI cannot drop/overwrite the resolved palette
- Skeleton seed: may set `branding: { colors, source }` early; reconcile is authoritative
- Generate must not fail solely because palette/logo missing (Roya default path)

### SVC-PROJECTS · regenerateDna (existing)
- Status: done (no API change required for badge)
- Notes: FE owns stale badge; optional later `dnaNeedsRegen` flag **deferred** unless implementer prefers server field

## Delta

- **Add** `colorPalette` persist + validate on create/update
- **Add** DNA branding.colors resolution + force-reconcile
- **No** new service class required if helpers live next to dna-passthrough / small util
