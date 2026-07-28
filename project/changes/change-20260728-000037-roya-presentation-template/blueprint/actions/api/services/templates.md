# Services — Templates (change-20260728-000037 after-state)

> Code: `roya-sales-ai-api-v2/src/pipeline-v3/templates/`, disk `templates/roya-presentation/v1/`, bootstrap + `scripts/seed-templates.js`.
> Style source: workspace-root `HAIA x Roya l Branding Proposal (2).html` — **reference only**; rebuild partials as clean HBS/CSS.

## Delta

- **Create** SVC-TPL-09 — `roya-presentation` catalog + own disk pack (23 sections)
- **Modify** catalog-registry / bootstrap / seed — register + keep-list + per-template section counts
- **Modify** SVC-TPL-05 — fixture allowlist + `team`/`risks` fixture content
- Pitch / formal / website catalogs **unchanged** (still 21 keys)

---

### SVC-TPL-09 · roya-presentation catalog + disk [domain, internal, Templates]

- Status: planned
- File: `src/pipeline-v3/templates/roya-presentation/roya-presentation.catalog.ts`
- Method: `buildRoyaPresentationTemplateDoc()`

#### Catalog doc shape

| Field | Value |
|-------|--------|
| key | `roya-presentation` |
| version | `1` |
| status | `active` |
| name | `{ ar: "عرض تقديمي — رويا", en: "Roya Presentation" }` |
| engine | `handlebars.v1` |
| type | `presentation` |
| orientation | `landscape` |
| page | same mm / safe area as pitch-landscape |
| assets.basePath | `templates/roya-presentation/v1` |
| rules | same as pitch: requiredKeys cover/financial/about_workspace/footer; maxSections 28; researchCoverageRequired |
| theme.lockPalette | **`true`** |
| theme.tokens | primary `#FF3B2F`, secondary `#1A1533`, accent `#C9A24B`, surface `#EFEBFB`, text `#1A1533` |

#### Sections build

```
cloneSections(PITCH_LANDSCAPE_SECTIONS) + team + risks
```

Do **not** add `team`/`risks` to `SHARED_SECTION_KEYS`.

#### New section def — `team`

| Field | Value |
|-------|--------|
| key | `team` |
| name | `{ ar: "فريق العمل", en: "Team" }` |
| purpose | Delivery team / roles for the engagement |
| whenToUse | After methodology when stakeholders need to see who delivers |
| researchKeys | `[]` |
| repeatable | false |
| pages | `{ min: 1, max: 1 }` |

**contentSchema** (required: `title`, `members`):

```json
{
  "type": "object",
  "required": ["title", "members"],
  "properties": {
    "title": { "type": "string", "minLength": 4, "maxLength": 60 },
    "intro": { "type": "string", "minLength": 0, "maxLength": 280 },
    "members": {
      "type": "array",
      "minItems": 3,
      "maxItems": 8,
      "items": {
        "type": "object",
        "required": ["role", "focus"],
        "properties": {
          "role": { "type": "string", "minLength": 2, "maxLength": 60 },
          "focus": { "type": "string", "minLength": 8, "maxLength": 200 },
          "deliverables": { "type": "string", "minLength": 0, "maxLength": 160 }
        }
      }
    }
  }
}
```

#### New section def — `risks`

| Field | Value |
|-------|--------|
| key | `risks` |
| name | `{ ar: "المخاطر والافتراضات", en: "Risks & Assumptions" }` |
| purpose | Clear-eyed risks with mitigations + delivery assumptions |
| whenToUse | Before financial / next steps when scope complexity warrants |
| researchKeys | `[]` |
| repeatable | false |
| pages | `{ min: 1, max: 1 }` |

**contentSchema** (required: `title`, `risks`, `assumptions`):

```json
{
  "type": "object",
  "required": ["title", "risks", "assumptions"],
  "properties": {
    "title": { "type": "string", "minLength": 4, "maxLength": 60 },
    "subtitle": { "type": "string", "minLength": 0, "maxLength": 160 },
    "risks": {
      "type": "array",
      "minItems": 2,
      "maxItems": 6,
      "items": {
        "type": "object",
        "required": ["title", "mitigation"],
        "properties": {
          "title": { "type": "string", "minLength": 4, "maxLength": 100 },
          "mitigation": { "type": "string", "minLength": 8, "maxLength": 220 }
        }
      }
    },
    "assumptions": {
      "type": "array",
      "minItems": 2,
      "maxItems": 8,
      "items": { "type": "string", "minLength": 8, "maxLength": 200 }
    }
  }
}
```

---

#### Disk pack (create) — `templates/roya-presentation/v1/`

| Path | Role |
|------|------|
| `layout.hbs` | Same CSS-var injection contract as pitch (`theme.primary`…`text`) |
| `theme.css` | HAIA style language for fixed 16:9; page contract (`@page`, `.page`, `overflow: hidden`) |
| `README.md` | Design-first note + style source HAIA HTML (reference only) + palette-lock note |
| `partials/<key>.hbs` | One file per catalog key (**23**) |

#### Style language (not PDF dump)

Extract from HAIA reference and adapt:

- Dark-first cover (`#1A1533`) with bold stacked titles; eyebrow labels (`BRAND · IDENTITY · …`)
- Red (`#FF3B2F`) accent bars / CTAs; gold (`#C9A24B`) for stats / premium markers
- Light lavender pages (`#EFEBFB` / `#E7E2F6`); muted purple secondary copy (`#6F6796`)
- Motifs: large number callouts, service grids, persona cards, phased timeline, pricing line tables, “BY ROYA” chrome on inner pages
- Cover: **client-first** (client logo + name); no workspace brand-mark on cover (change-20260728-000036)
- `about_workspace`: agency intro + track-record numbers
- Footer: workspace contact chrome
- All shared-key partials bind **identical** content fields as pitch schemas
- Hardcode HAIA palette in CSS where needed; CSS vars still set from locked catalog tokens (assemble will not override)

#### Partial redesign map

| Section key | Layout hint (from reference or invented) |
|-------------|------------------------------------------|
| cover | Dark full-bleed; client hero; eyebrow; bold title stack; red/gold accents |
| executive_summary | Lead narrative + large gold/red stat tiles |
| about_workspace | Agency intro + track-record number strip |
| services | “Nine core services” style card grid |
| case_studies / testimonial | Clients & partners / quote proof |
| client_context | Fact rows (contact, sector, scope…) + challenge callout |
| audience_insights | Persona cards (primary / secondary) |
| objectives_kpis | 0→target metric rows / KPI table |
| action_plan | Scope-of-work week packages |
| methodology | Stage cards + parallel-work note |
| timeline | Phased delivery timeline |
| **team** | Role cards (role / focus / deliverables) — from “Creative team” slide |
| **risks** | Risk cards (RISK / mitigation) + assumptions list |
| financial | One-time + retainer line-item tables |
| next_steps | “Let’s …” CTA steps |
| footer | Contact back cover |
| insights_divider | Dark chapter opener with eyebrow |
| market_analysis / competitor_analysis / market_trends / benchmarks / social_audit | Invented in same language (cards, gold numbers, lavender panels) |

---

### Catalog registry

`catalog-registry.ts`:

- Import `ROYA_PRESENTATION_SECTIONS` + `buildRoyaPresentationTemplateDoc`
- `TEMPLATE_SECTIONS["roya-presentation"] = …`
- `buildAllTemplateDocs()` includes the new builder

---

### SVC-TPL-05 · Fixture render

- Status: planned
- `FIXTURE_TEMPLATE_KEYS` adds `roya-presentation`
- `fixture-content.ts`: when key is `roya-presentation`, include `team` + `risks` fixture sections (AR + EN); shared 21 sections reuse existing fixture payloads
- Fixture must validate against per-template schemas (AJV via `getSectionDef(key, templateKey)`)

---

### Bootstrap + seed (mandatory)

**`pipeline-v3-bootstrap.service.ts`**
- `CANONICAL_TEMPLATES` includes `{ key: "roya-presentation", version: 1 }`
- `buildAllTemplateDocs` already upserts

**`scripts/seed-templates.js`**
- Upsert roya-presentation doc
- Per-template expected counts: pitch/formal/website = `SHARED_SECTION_KEYS.length` (21); `roya-presentation` = **23**
- `keep` array includes `roya-presentation`
- Log active keys after seed

---

### Unchanged contracts

- SVC-TPL-01 AssetResolver — disk by basePath
- SVC-TPL-03 Page contract
- SVC-TPL-07 List active — no code change; roya-presentation appears after seed
- Pitch / website / formal disk + schemas — no edits
