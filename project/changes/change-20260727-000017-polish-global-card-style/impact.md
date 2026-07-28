# Impact Analysis — Global p-card = Create Project form cards

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Global CSS | partial | `roya-sales-ai-frontend/src/styles.css` | No shared `.p-card` chrome; tokens miss `--form-card-border` |
| Page (reference) | complete | `project-create.component.ts` `.form-card` (~443–469) | Shopify-like look is local `:host ::ng-deep` only |
| Pages (consumers) | partial | Most `p-card` pages (projects, creative, dashboard, proposals, …) | Default PrimeNG shadow/border; some duplicate `.form-card` locally (edit/dna/detail) |
| Special cases | complete | `proposal-view-card` zero padding; `.template-card` / `.option-card` tiles | Must remain overrides / out of scope |

Feature state: **partial**

## Affected Modules
- **Safqa Web shared styles** — global card chrome
- **Projects / DNA / Create** — remove redundant local card chrome once global
- All other pages using bare `p-card` — inherit automatically (no markup change required)

## Pack blueprint files to create
- [x] `blueprint/actions/web/pages/global-cards.md` — after-state UI notes
- [x] `blueprint/_index.md` + pack `status.md`

> Do **not** edit main `project/plan` or `project/actions` until merge.

## Code files to modify (implement later)

| App | Path | Action |
|-----|------|--------|
| web | `src/styles.css` | Add `--form-card-border` (+ dark); global `.p-card` chrome + title/subtitle |
| web | `pages/projects/project-create/project-create.component.ts` | Remove duplicate `.form-card` chrome rules (keep layout-only styles) |
| web | `pages/projects/project-edit/project-edit.component.ts` | Remove duplicate `.form-card` chrome |
| web | `pages/projects/project-dna/project-dna.component.ts` | Remove duplicate `.form-card` chrome |
| web | `pages/projects/project-detail/project-detail.component.ts` | Remove duplicate `.form-card` chrome |

Optional cleanup (same look either way): drop obsolete `styleClass="form-card"` where it only existed for chrome.

## Ripple effects
- Dashboard stat cards, list wrappers, Creative form cards all get the same border/radius/shadow
- Proposal slide cards keep zero inner padding via existing `.proposal-view-card` override
- Interactive tiles (`.template-card`, `.option-card`) unchanged

## Risk
- Complexity: **L**
- Cross-module: **N** (frontend styles only)
- Migration: **N**

## Recommendation
- **Modify**: global CSS + strip local duplicates
- **Complete**: Create Project reference look becomes system default

## Status target
- Global cards page notes → planned → done after implement

## Dependencies
- depends-on: — 
