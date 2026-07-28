# Modules — Templates slice (change-20260727-000023 after-state)

> Merge target: `project/plan/modules.md` §13 Templates (in-place at Step 5.6).

## Delta

- Section catalog **19 → 20** keys (`+ testimonial`)
- New feature: **website-template** design-first disk pack
- Formal / modern inherit shared catalog (including testimonial)
- Fixture render accepts `templateKey`

## 13. Templates (after-state slice)

- Scope: BE `src/pipeline-v3/templates/*` + disk `templates/pitch-landscape/v1/` + `templates/website-template/v1/` + `templates` collection + FE gallery
- Audience: system / gallery; ops smoke via fixture-render
- Entities: `templates`
- Depends on: PDF Export (PdfRenderService); Settings (workspace logo/name for pitch branding)

### Features (touched / added)

3. **pitch-landscape design** [backend-only] — unchanged contract; gains `partials/testimonial.hbs` (shared with formal)
4. **Section catalog** [backend-only] — **20** keys (prior 19 + `testimonial`); abstract + contentSchema; active v1 seed; `maxSections` 28
5. **Fixture render API** [backend-only] — `POST /api/data/templates/pitch-landscape/fixture-render` accepts optional `templateKey` (`pitch-landscape` \| `pitch-landscape-formal` \| `website-template`); fixtures cover all 20 sections + sample branding
6. **pitch-landscape-formal** [backend-only] — same 20-section catalog; shares pitch disk; formal tokens
9. **website-template design** [backend-only] — NEW; key `website-template`; display `{ ar: "عرض تقديمي — موقع", en: "Pitch — Website" }`; own disk `templates/website-template/v1/`; smart-watch style language (black `#000` / mint `#D6E3E1` / gray `#F7F7F7`, Mona Sans EN + Cairo/Tajawal AR); same 20 schemas; palette/branding overrides still apply via CSS vars

### Canonical active templates (bootstrap + seed)

| key | version | basePath |
|-----|---------|----------|
| `pitch-landscape` | 1 | `templates/pitch-landscape/v1` |
| `pitch-landscape-formal` | 1 | `templates/pitch-landscape/v1` |
| `website-template` | 1 | `templates/website-template/v1` |

Any other template docs must be deactivated on seed/boot (existing cleanup behavior).
