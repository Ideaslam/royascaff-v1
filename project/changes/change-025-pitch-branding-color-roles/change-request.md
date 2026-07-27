# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend (+ frontend only if palette UI labels needed — default **backend-only**)
- **priority**: medium
- **request-id**: REQ-PALETTE
- **part**: —
- **depends-on**: change-022 (merged)
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Pipeline v3 DNA / branding; Template render (`pitch-landscape`); Assemble theme map
- Feature(s): Categorized DNA branding colors; pitch-landscape CSS role rearrange (primary-led + white/black fillers)
- Endpoint(s): none new (existing DNA / assemble path)
- Page(s)/View(s): none required (Create/Edit palette stays ordered list unless we add role labels later)
- Service(s): `resolveBrandingColors` / `colorsToThemeOverrides`; TemplateRender theme; `pitch-landscape` `theme.css`

## Description

**Problem:** Project palette / DNA branding is an ordered hex list mapped as `[0]=primary`, `[1]=secondary`, `[2]=accent`. The pitch-landscape theme still uses **Royacatalog blue** for heading/brand chrome via `--color-secondary` (`#114261`). When the user picks pink (often only 1–2 colors), `primary` updates small accents, but headings, brand-mark, and stats stay navy — so the deck reads as blue-primary, not the chosen brand.

**Deliver:**

1. **DNA branding color categories (roles)**
   - Store semantic roles on DNA branding, not only a flat list:
     - `primary` — brand lead (user’s first / chosen brand color)
     - `secondary` — supporting brand tone
     - `accent` — highlight / gradient partner
     - `surface` — page/card fill (default **white** `#FFFFFF`)
     - `text` — body/heading ink when not using brand (default **near-black** `#1A1A2E` or `#000000` for strong brand marks)
   - Keep ordered `colors[]` (or derive from roles) for backward compatibility with existing projects / UI.
   - Mapping from project `colorPalette` (ordered 1–5):
     - `[0] → primary`
     - `[1] → secondary` (if missing: **derive** from primary — darker shade — do **not** leave Roya navy)
     - `[2] → accent` (if missing: derive mid/light from primary or use secondary)
     - `surface` / `text` → neutrals (white / black family) unless later slots explicitly provided
   - When palette source is set, **do not** fall back to Roya blue defaults for empty secondary/accent slots.

2. **pitch-landscape template — use roles + neutrals**
   - Rearrange CSS so chrome follows **type**:
     - Headings (h1/h2), brand-mark, logo-adjacent type → **primary** (brand)
     - Supporting labels / h3 / page-num → **accent** or muted text (not hard-coded navy)
     - Accent bars / gradients → primary → accent (or primary → secondary)
     - Cards, side panels, empty columns, stat backgrounds → **surface** / white / light primary tint (no fixed sky-blue `#eaf6fc` / `#f4f9fc` as the default “gap” fill)
     - Table headers / dark bands → primary or near-black, with white text
   - Prefer white/black (and soft primary-tinted neutrals) to fill layout gaps so unused regions don’t look like leftover Roya blue.

3. **Assemble / render**
   - Map DNA role object → `themeOverrides` (`primary|secondary|accent|surface|text`) completely.
   - Proposal-level overrides still win per key when set.

**Out of scope:**
- Changing Create/Edit palette UX to labeled role pickers (optional follow-up)
- Creative pipeline 3-color picker
- Other templates beyond `pitch-landscape` (website-template already has its own tokens)
- Regenerating all historical proposals automatically (new assemble / DNA regen picks up roles)

**Locked decisions (proposed — confirm):**
- FE `colorPalette` remains ordered hex list; categorization happens in DNA / assemble
- Missing secondary/accent derived from primary when palette present (no Roya blue leak)
- Neutrals: surface white, text near-black, used for gaps/cards
- Headings switch from secondary → **primary**

## Acceptance Criteria

1. DNA branding exposes categorized color roles (`primary`, `secondary`, `accent`, `surface`, `text`) when colors are resolved (palette / logo / defaults).
2. With a user palette whose first color is pink (or any non-blue), assembled pitch-landscape headings and brand-mark use that **primary** color — not catalog navy.
3. When only 1 palette color is set, secondary/accent are derived from primary (or neutrals); Roya `#114261` / `#47B5E6` do **not** remain as heading/chrome defaults for that proposal.
4. Template gaps (cards, stat panels, soft backgrounds) use white / surface / light primary tint — not hard-coded sky-blue fills as the default look.
5. Accent bars / callout borders still read as brand (primary/accent), not orphaned pink while the page is navy.
6. Empty palette → existing Roya default chain still works.
7. No new HTTP routes or permissions; assemble + DNA regenerate continue to work.

## Notes

- Screenshot evidence: pink only on thin accent; navy on titles/logo; light blue stat boxes — classic secondary-as-heading + catalog fallback.
- Related: change-022 shipped index→role mapping but left template role assignment + incomplete-slot fallbacks blue-biased.
