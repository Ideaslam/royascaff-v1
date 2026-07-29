# Modules — Templates + Pipeline Map/Section (pack after-state)

> Pack slice only. Merge into main `project/plan/modules.md` at Step 5.6.

## Delta

- Templates feature **4** (section catalog): each of the four templates adds **template-local** keys `banner`, `full_bleed_banner`, `images_gallery` (not in `SHARED_SECTION_KEYS`); counts **21→24** (pitch/formal/website) and **23→26** (roya); `maxSections` **28→32**
- Templates feature **5** (fixture): fixtures include sample `images` map + one instance of each visual section
- Creative/Pipeline feature **8** (map): skip visual keys when insufficient project images; prompt documents visual keys + `imageRefs`; max sections 32
- Creative/Pipeline feature **10** (section): validate `imageRef` / gallery refs against available image ids

---

## 13. Templates (touched after-state)

### Features (delta lines)

4. **Section catalog (per template)** [backend-only] — shared base **21** keys unchanged in `SHARED_SECTION_KEYS`; each template additionally owns local `banner` + `full_bleed_banner` + `images_gallery` (**24** defs for pitch/formal/website; **26** for `roya-presentation` = 21 shared + team + risks + 3 visual); `maxSections` **32**; visual keys are `repeatable: true`, not in `requiredKeys`
5. **Fixture render API** [backend-only] — fixtures supply `images` id→url map and visual section content using those ids for all templates

### Canonical active templates (after)

| key | basePath | mode | sections |
|-----|----------|------|----------|
| `pitch-landscape` | `templates/pitch-landscape/v1` | presentation 16:9 | **24** |
| `pitch-landscape-formal` | `templates/pitch-landscape/v1` (shared disk) | presentation 16:9 | **24** |
| `website-template` | `templates/website-template/v1` | landing | **24** |
| `roya-presentation` | `templates/roya-presentation/v1` | presentation 16:9 | **26** |

### Disk note
- Formal **reuses** pitch partials/CSS for visual sections (existing shared `basePath`).
- Pitch / website / roya each ship unique `banner.hbs`, `full_bleed_banner.hbs`, `images_gallery.hbs` + theme CSS.

---

## 6. Creative / AI (touched after-state)

### Features (delta lines)

8. **Map worker (Step 2)** [backend-only] — `maxSections` **32**; after AI map (and on repair/inject), **strip** `banner` / `full_bleed_banner` / `images_gallery` when usable project/DNA images &lt; 1 (banner/full-bleed) or &lt; 2 (gallery); prompt guides optional visual dividers + optional map `imageRefs`
10. **Section fan-out (Step 3)** [backend-only] — for visual section keys, after clamp/validate: every `imageRef` (and each string in `images[]` for gallery) must be an id present in available DNA/project images; invalid → fail section validation (repair/retry path as today)
