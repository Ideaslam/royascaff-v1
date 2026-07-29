# Services — Templates (change-20260729-113947 after-state)

> Code: per-template catalogs under `src/pipeline-v3/templates/<key>/`, disk `templates/<key>/v1/`, `fixtures/fixture-content.ts`, `scripts/seed-templates.js`.

## Delta

- **Modify** each of 4 catalogs — append template-local visual section defs; `rules.maxSections: 32`
- **Create** partials on pitch / website / roya disks (formal shares pitch)
- **Modify** theme.css on those three disks — banner / full-bleed / gallery layout
- **Modify** SVC-TPL-05 fixtures — `images` map + visual sections for all templates
- **Modify** seed `expectedByKey` — pitch/formal/website **24**; roya **26**
- **Do not** add keys to `SHARED_SECTION_KEYS` or into the shared pitch section array used as the clone source without per-template override

---

### Isolation rule

```
SHARED_SECTION_KEYS  → unchanged (21 keys)
PITCH_LANDSCAPE_SECTIONS (shared clone source) → unchanged
Each catalog appends its OWN local defs (may copy schema text; own objects)
```

Suggested insert point in each catalog build: after `insights_divider` (visual chapter break). Roya keeps existing `team`/`risks` inserts.

---

### Baseline contentSchema (each template owns a copy; capacity may diverge later)

#### `banner` — image-only divider

| Field | Value |
|-------|--------|
| key | `banner` |
| name | `{ ar: "لافتة", en: "Banner" }` |
| purpose | Full-width visual divider using a project image |
| whenToUse | Between chapters when project images exist; image-only, no copy |
| researchKeys | `[]` |
| repeatable | **true** |
| pages | `{ min: 1, max: 1 }` |

```json
{
  "type": "object",
  "required": ["imageRef"],
  "properties": {
    "imageRef": { "type": "string", "minLength": 1, "maxLength": 80 }
  }
}
```

#### `full_bleed_banner`

| Field | Value |
|-------|--------|
| key | `full_bleed_banner` |
| name | `{ ar: "لافتة بعرض كامل", en: "Full-bleed banner" }` |
| purpose | Full-bleed visual with short title overlay |
| whenToUse | Strong chapter openers when a hero image is available |
| researchKeys | `[]` |
| repeatable | **true** |
| pages | `{ min: 1, max: 1 }` |

```json
{
  "type": "object",
  "required": ["title", "imageRef"],
  "properties": {
    "title": { "type": "string", "minLength": 4, "maxLength": 80 },
    "subtitle": { "type": "string", "minLength": 0, "maxLength": 160 },
    "imageRef": { "type": "string", "minLength": 1, "maxLength": 80 }
  }
}
```

#### `images_gallery`

| Field | Value |
|-------|--------|
| key | `images_gallery` |
| name | `{ ar: "معرض الصور", en: "Images gallery" }` |
| purpose | Visual proof grid from project images |
| whenToUse | When ≥2 project images exist and proof/visuals strengthen the pitch |
| researchKeys | `[]` |
| repeatable | **true** |
| pages | `{ min: 1, max: 1 }` |

```json
{
  "type": "object",
  "required": ["title", "images"],
  "properties": {
    "title": { "type": "string", "minLength": 4, "maxLength": 60 },
    "intro": { "type": "string", "minLength": 0, "maxLength": 280 },
    "images": {
      "type": "array",
      "minItems": 2,
      "maxItems": 6,
      "items": { "type": "string", "minLength": 1, "maxLength": 80 }
    }
  }
}
```

`images[]` items are `imageRef` strings (project/DNA image **ids**).

---

### Per-template catalog rules

| Template | Catalog file | Defs after | maxSections | Partials disk |
|----------|--------------|------------|-------------|---------------|
| pitch-landscape | `pitch-landscape.catalog.ts` | 24 | 32 | own |
| pitch-landscape-formal | `pitch-landscape-formal.catalog.ts` | 24 | 32 | **shared pitch** |
| website-template | `website-template.catalog.ts` | 24 | 32 | own |
| roya-presentation | `roya-presentation.catalog.ts` | 26 | 32 | own |

Website: after `cloneSections(PITCH_LANDSCAPE_SECTIONS)`, append website-local visual defs (do not rely on pitch clone for these keys).  
Formal: same — append formal-local copies (schemas may match pitch at ship).  
Roya: keep team/risks; append visual defs.

---

### Disk partials (status: planned)

**Create** under each owning disk:

| Partial | Behavior |
|---------|----------|
| `banner.hbs` | One full-area image via `{{resolveImage content.imageRef}}`; no title text; follow template chrome |
| `full_bleed_banner.hbs` | Background/hero image + `title` + optional `subtitle` |
| `images_gallery.hbs` | `title` + optional `intro` + CSS grid of `{{#each content.images}}` → `resolveImage` |

**CSS** (pitch / website / roya `theme.css`):
- Pitch: reuse `.page` + brand-band patterns; gallery as 2–3 column cards; full-bleed as cover-like band
- Website: `lp-section` / landing fluid patterns; gallery responsive grid
- Roya: `.hp-*` language (eyebrow optional on full-bleed/gallery; banner can be image-only band)

Empty `resolveImage` → hide img or show muted placeholder block that still satisfies page contract (prefer `{{#if}}` around img).

---

### SVC-TPL-05 · Fixture render (modify)

- Add fixture `images` map with ≥3 sample ids (e.g. `fix_img_1`…`fix_img_3`) pointing at stable public placeholder URLs (or existing fixture assets if any).
- For **all** templateKeys, insert after `insights_divider` (or before `about_workspace` if divider missing):
  - one `banner` (`imageRef: fix_img_1`)
  - one `full_bleed_banner` (title + subtitle + `fix_img_2`)
  - one `images_gallery` (title + intro + `[fix_img_1, fix_img_2, fix_img_3]`)
- Re-number `order` after splice (same pattern as roya team/risks).
- Return `images` on `RenderProposalInput`.

---

### Seed / bootstrap

`scripts/seed-templates.js` `expectedByKey`:

```js
{
  "pitch-landscape": sharedCount + 3,           // 24
  "pitch-landscape-formal": sharedCount + 3,    // 24
  "website-template": sharedCount + 3,          // 24
  "roya-presentation": sharedCount + 2 + 3,     // 26 (team+risks+visual)
}
```

Bootstrap already uses `buildAllTemplateDocs()` — no allowlist change if docs rebuild from catalogs.

---

### READMEs

Update hard-coded “21” / “23” section counts in template READMEs that mention catalog size.
