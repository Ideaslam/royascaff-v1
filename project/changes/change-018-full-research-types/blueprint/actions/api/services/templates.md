# Services — Templates (change-018 after-state)

> Touches: `pitch-landscape.catalog.ts`, disk partials, `fixture-content.ts`.
> Render/bootstrap paths unchanged (partials resolved by section key).

## Delta

- **Modify** SVC-TPL-04 / SVC-TPL-06 — catalog 19 sections; `maxSections: 28`
- **Modify** SVC-TPL-05 — fixture samples for 5 new keys (AR + EN)
- **Create** 5 HBS partials

---

### SVC-TPL-04 · pitch-landscape catalog [domain, internal, Templates]
- Status: planned
- After-state `PITCH_LANDSCAPE_SECTION_KEYS` includes prior keys **plus**:
  `market_trends`, `benchmarks`, `case_studies`, `social_audit`, `action_plan`
- `constraints.maxSections`: **28**
- Insert new research sections after `audience_insights` and before `financial` (order in catalog array; map still orders dynamically)

#### New section defs (abstract + contentSchema)

**`market_trends`** — researchKeys: `["trends"]`, not repeatable  
Required: `title`, `trends[]` (≥4 items: `{ name, impact, response }`), `summary` (≥40 chars)

**`benchmarks`** — researchKeys: `["benchmarks"]`  
Required: `title`, `rows[]` (≥3: `{ metric, industry, target, note? }`), `insight` (≥40 chars)

**`case_studies`** — researchKeys: `["case-studies"]`  
Required: `title`, `cases[]` (≥2: `{ pattern, approach, resultType, lesson }`)  
Rule: analogous playbooks only — no fabricated real-client brand names as facts

**`social_audit`** — researchKeys: `["social-analysis"]`  
Required: `title`, `channels[]` (≥1: `{ platform, finding, opportunity, score? }`), `quickWins` (list ≥2)

**`action_plan`** — researchKeys: `["action-plan"]`  
Required: `title`, `phases[]` (≥3: `{ name, duration, focus, outcomes[] }`), `first30Days` (list ≥3), `callout` (≥40 chars)

Schemas follow existing catalog helpers (`textSchema`, `listSchema`) — keep renderable with current theme CSS (cards, bullets, grids, tags). No new slot-registry dependency.

### Disk partials (create)

| File | Layout hint (match existing chrome) |
|------|-------------------------------------|
| `partials/market_trends.hbs` | title + trend cards (name / impact / response) + summary |
| `partials/benchmarks.hbs` | title + simple metric table + insight |
| `partials/case_studies.hbs` | title + case cards (pattern / approach / result / lesson) |
| `partials/social_audit.hbs` | title + channel cards + quickWins list |
| `partials/action_plan.hbs` | title + phase stepper-like list + first30Days + callout |

Each partial: same page chrome as `market_analysis.hbs` (brand-mark, page-num, accent-bar).

### SVC-TPL-05 · Fixtures
- Status: planned
- Add AR + EN sample content blocks for the five keys in `fixture-content.ts` so fixture-render still covers all shippable sections

### SVC-TPL-06 · pitch-landscape-formal
- Status: planned (inherit)
- No separate section list — formal builder clones / shares `PITCH_LANDSCAPE_SECTIONS`; verify after catalog change
