# Data model delta — settings color palette + roles

## settings (after-state, theme fields)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `defaultColor` | String | hex; **alias of** `colorRoles.primary` (compat) | theme |
| `defaultFont` | String | Cairo \| Tajawal | theme |
| `colorPalette` | `string[]` \| null | 1–5 hex `#rrggbb` when set; empty/null = unset | theme |
| `colorRoles` | Object \| null | present whenever palette (or migrated defaultColor) resolves | theme |

### `settings.colorRoles`

| Role | Type | Required when palette set | Derive |
|------|------|---------------------------|--------|
| `primary` | `#rrggbb` | yes | `colorPalette[0]` |
| `secondary` | `#rrggbb` | yes | `[1]` or darken(primary) |
| `accent` | `#rrggbb` | yes | `[2]` or lighten(primary) |
| `surface` | `#rrggbb` | yes | `[3]` or `#ffffff` |
| `text` | `#rrggbb` | yes | `[4]` or `#1a1a2e` |

Reuse API helpers: `normalizeColorPalette`, `colorsToColorRoles` (`pipeline-v3/analyze/branding-colors.ts`).

### DNA branding resolve precedence (after-state)

`resolveBrandingColors(project, workspaceSettings?)`:

1. `project.colorPalette` (1–5) → source `palette`
2. first `client_logo` image → source `client_logo`
3. workspace `colorPalette` / `colorRoles` / legacy `defaultColor` → source `workspace`
4. Roya catalog defaults → source `roya_default`

## Delta

- **Add** `settings.colorPalette`, `settings.colorRoles`
- **Keep** `defaultColor` synced to `colorRoles.primary`
- **Modify** DNA branding precedence to include workspace before Roya defaults
