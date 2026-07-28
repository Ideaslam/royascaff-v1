# Services — Templates (change-20260727-000023 after-state)

> Code: `roya-sales-ai-api-v2/src/pipeline-v3/templates/`, disk `templates/*/v1/`, bootstrap + `scripts/seed-templates.js`.
> Pattern: landing folder = **style reference only**; redesign all proposal section partials.

## Delta

- **Modify** SVC-TPL-04 / SVC-TPL-06 — shared catalog **20** sections (`+ testimonial`)
- **Modify** SVC-TPL-05 — fixture includes `testimonial`; render by `templateKey`
- **Create** SVC-TPL-08 — `website-template` catalog + own disk pack
- **Modify** bootstrap + seed — canonical keep-list includes `website-template`
- **Create** pitch `partials/testimonial.hbs` (formal inherits)

---

### SVC-TPL-04 · Shared section catalog [domain, internal, Templates]
- Status: planned
- File: `pitch-landscape.catalog.ts` (shared section array remains source of truth for map + AJV)
- After-state `PITCH_LANDSCAPE_SECTION_KEYS` includes prior 19 **plus** `testimonial` (after `case_studies`)
- `buildPitchLandscapeTemplateDoc` / `buildPitchLandscapeFormalTemplateDoc` unchanged shape; both get 20 sections via shared array
- `rules.maxSections` stays **28**; `requiredKeys` unchanged (testimonial optional)

#### New section def — `testimonial`

| Field | Value |
|-------|--------|
| key | `testimonial` |
| name | `{ ar: "شهادات", en: "Testimonials" }` |
| purpose | Client / market social proof quotes |
| whenToUse | After case studies or before financial when social proof strengthens close |
| researchKeys | `[]` (commercial optional; coverage gate already lists as alsoGood for case-studies) |
| repeatable | false |
| pages | `{ min: 1, max: 1 }` |

**contentSchema** (required: `title`, `quotes`):

```json
{
  "type": "object",
  "required": ["title", "quotes"],
  "properties": {
    "title": { "type": "string", "minLength": 4, "maxLength": 60 },
    "subtitle": { "type": "string", "minLength": 0, "maxLength": 160 },
    "quotes": {
      "type": "array",
      "minItems": 2,
      "maxItems": 4,
      "items": {
        "type": "object",
        "required": ["quote", "author"],
        "properties": {
          "quote": { "type": "string", "minLength": 20, "maxLength": 280 },
          "author": { "type": "string", "minLength": 2, "maxLength": 60 },
          "role": { "type": "string", "minLength": 0, "maxLength": 60 },
          "company": { "type": "string", "minLength": 0, "maxLength": 60 }
        }
      }
    }
  }
}
```

Use existing `textSchema` helpers in code.

#### Pitch disk partial (create)

`templates/pitch-landscape/v1/partials/testimonial.hbs`

- Same chrome as other pages (brand-mark, page-num, accent-bar)
- Title + optional subtitle
- Quote cards (2–4): quote text, author, role · company
- Reuse `.card` / `.muted` patterns from modern theme

---

### SVC-TPL-06 · pitch-landscape-formal
- Status: planned (inherit)
- No separate section list; verifies 20 sections after catalog change
- Uses pitch `testimonial.hbs` via shared `basePath`

---

### SVC-TPL-08 · website-template catalog + disk [domain, internal, Templates]
- Status: planned
- Method: `buildWebsiteTemplateDoc()` (+ bootstrap upsert)
- Rules:
  - `key: "website-template"`, `version: 1`, `status: "active"`
  - `name: { ar: "عرض تقديمي — موقع", en: "Pitch — Website" }`
  - Same `engine` / `type` / `orientation` / `page` / `rules` / `sections` as pitch base
  - `assets.basePath: "templates/website-template/v1"`
  - Theme tokens:

| token | value |
|-------|--------|
| `color.primary` | `#000000` |
| `color.secondary` | `#D6E3E1` |
| `color.accent` | `#000000` |
| `color.surface` | `#FFFFFF` |
| `color.text` | `#2C2C2C` |
| `font.heading` | `Mona Sans` (EN) / Cairo (AR via CSS stack) |
| `font.body` | `Mona Sans` / Tajawal |

#### Disk pack (create) — `templates/website-template/v1/`

| Path | Role |
|------|------|
| `layout.hbs` | Same CSS-var injection contract as pitch (`theme.primary`…`text`) |
| `theme.css` | Smart-watch style language for fixed 16:9 pages; page contract (`@page`, `.page`, `overflow: hidden`) |
| `README.md` | Design-first note + style source `05.smart-watch` (reference only) |
| `partials/<key>.hbs` | One file per catalog key (**20**) |

#### Style language (not landing sections)

Extract from `05.smart-watch/css/custom.css` and adapt to pitch pages:

- Palette: black primary, mint secondary panels (`#D6E3E1`), light gray page chrome (`#F7F7F7`), white cards
- Type: large bold titles, airy body; stack `"Mona Sans", "Cairo", "Tajawal", sans-serif`
- Motifs: soft mint blocks, pill/chip accents, icon-row / fact-stat strips, clean card grids, strong cover opener (light or mint field — not Roya blue gradient)
- Cover / footer: distinct website look (mint + black), still bind `workspace_*` / `client_*` — **no** hardcoded Safqa brand names
- All partials bind **identical** content fields as pitch schemas (same Handlebars paths)

#### Partial redesign map (content fields unchanged)

| Section key | Website layout hint |
|-------------|---------------------|
| cover | Centered hero title stack; client row; mint/black field |
| executive_summary | Lead + 2–3 fact/stat tiles (landing “facts” motif) |
| client_context | About + bullet list + mint callout panel |
| objectives_kpis | Objective cards + KPI table |
| services | Feature-style cards grid (landing features motif) |
| methodology | Numbered approach steps |
| timeline | Phase columns |
| insights_divider | Full-bleed mint/black chapter opener |
| market_analysis | Stat tiles + insight + points |
| competitor_analysis | Strengths / weaknesses columns + win callout |
| audience_insights | Persona cards + channel chips |
| market_trends | Trend cards (name / impact / response) |
| benchmarks | Clean metric table + insight |
| case_studies | Case cards |
| **testimonial** | Quote cards with large quote mark (landing testimonials motif) |
| social_audit | Channel cards + quick wins |
| action_plan | Phase list + first30Days + callout |
| financial | Pricing table (code-owned money) |
| next_steps | CTA steps (pill accent language) |
| footer | Back cover contacts; workspace branding vars |

---

### SVC-TPL-05 · Fixture render
- Status: planned
- `fixture-content.ts`: add `testimonial` section (AR + EN) with ≥2 quotes; place after case_studies in fixture order
- `getFixtureProposal(language, templateKey?)` — default `pitch-landscape`; when `website-template` / formal, set `templateKey` accordingly (same section contents)
- `TemplateRenderService.renderFixtureHtml/Pdf(language, templateKey?)` forwards key
- Fixture must validate against shared schemas (AJV)

---

### Bootstrap + seed (mandatory)

**`pipeline-v3-bootstrap.service.ts`**
- Import/call `buildWebsiteTemplateDoc`
- `CANONICAL_TEMPLATES` includes `{ key: "website-template", version: 1 }`

**`scripts/seed-templates.js`**
- Upsert website doc
- Expect section count **20** for all three builders
- `keep` array includes website-template
- Log active keys after seed

---

### Unchanged contracts

- SVC-TPL-01 AssetResolver — disk by basePath
- SVC-TPL-02 Render — branding + themeOverrides
- SVC-TPL-03 Page contract
- SVC-TPL-07 List active — no code change; website appears after seed
