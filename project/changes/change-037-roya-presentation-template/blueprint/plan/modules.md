# Modules — Templates slice (change-037 after-state)

> Merge target: `project/plan/modules.md` § Templates (in-place at Step 5.6).

## Delta

- New feature: **roya-presentation** design-first disk pack (HAIA × Roya branding style)
- Template-local sections: **`team`**, **`risks`** (23 keys for this template only)
- Theme flag: **`theme.lockPalette`** — DNA / proposal color overrides skipped at assemble
- Canonical active templates: 3 → **4**

## Templates (after-state slice)

- Scope: BE `src/pipeline-v3/templates/*` + disk `templates/roya-presentation/v1/` + `templates` collection + assemble theme merge + FE gallery (list only)
- Audience: system / gallery; ops smoke via fixture-render
- Entities: `templates`
- Depends on: PDF Export; Settings (workspace chrome for footer / about_workspace); Projects DNA (palette ignored for this template)

### Features (touched / added)

4. **Section catalog** [backend-only] — shared set remains **21** keys for pitch/formal/website; `roya-presentation` = 21 + `team` + `risks` (**23**)
5. **Fixture render API** [backend-only] — allowlist includes `roya-presentation`; fixtures cover all 23 sections for that key
9. **website-template design** — unchanged
10. **roya-presentation design** [backend-only] — NEW; key `roya-presentation`; display `{ ar: "عرض تقديمي — رويا", en: "Roya Presentation" }`; own disk `templates/roya-presentation/v1/`; HAIA style language (deep purple `#1A1533`, red `#FF3B2F`, gold `#C9A24B`, lavender surfaces); **locked palette** (`theme.lockPalette: true`)
11. **Assemble theme merge** [backend-only] — when template has `lockPalette`, omit DNA + `proposal.themeOverrides` so catalog/disk tokens win

### Canonical active templates (bootstrap + seed)

| key | version | basePath | sections |
|-----|---------|----------|----------|
| `pitch-landscape` | 1 | `templates/pitch-landscape/v1` | 21 |
| `pitch-landscape-formal` | 1 | `templates/pitch-landscape/v1` | 21 |
| `website-template` | 1 | `templates/website-template/v1` | 21 |
| `roya-presentation` | 1 | `templates/roya-presentation/v1` | **23** |

Any other template docs must be deactivated on seed/boot (existing cleanup behavior).
