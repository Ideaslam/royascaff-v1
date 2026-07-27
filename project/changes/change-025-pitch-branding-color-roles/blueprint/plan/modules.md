# Modules — branding color roles + pitch theme (pack after-state)

## Projects / DNA branding
- Resolve ordered `colors[]` as today (palette → client_logo → Roya defaults)
- Always build `colorRoles` from that list + derive/neutral rules
- Force-reconcile `colors` + `colorRoles` + `source` after AI merge

## Assemble / Template render
- Map `colorRoles` → full `themeOverrides` (`primary|secondary|accent|surface|text`)
- Fallback: if DNA has only `colors[]` (legacy), derive roles at assemble time
- Proposal `themeOverrides` key still wins when non-empty

## pitch-landscape (presentation)
- Chrome follows **role type**:
  - Headings (h1/h2), brand-mark → **primary**
  - h3 / page-num / soft labels → **accent** or muted text
  - Accent bars / gradients → primary → accent
  - Cards, stats, persona, soft panels → **surface** / white / light primary tint (CSS `color-mix` or alpha on primary)
  - Table headers / strong bands → primary (white text) or text-on-primary
  - Cover / footer / insights divider → primary-led gradients (no hard-coded Roya navy hex)
- Neutrals (white / near-black) fill layout gaps so unused regions are not sky-blue leftovers

## Delta

- **Extend** DNA branding with roles; **Modify** assemble map + pitch-landscape theme assignment
