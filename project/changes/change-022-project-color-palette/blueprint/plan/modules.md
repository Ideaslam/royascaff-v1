# Modules — pack slice

## Projects

- **Color palette** [both] — optional `colorPalette` on create/patch; Branding card on Create + Edit; reusable shared palette component
- **DNA stale cue** [frontend] — after any successful Edit save, badge/dot on Workspace **Regenerate DNA**; clear after successful regen

## Pipeline v3 / Templates

- **DNA branding colors** [backend] — inject `dna.branding.colors` from palette → else derive from `client_logo` image → else Roya defaults; force-reconcile so AI merge cannot drop
- **Assemble theme map** [backend] — map `branding.colors[i]` → `themeOverrides` for `pitch-landscape` CSS vars (`--color-primary` etc.)

## Delta

- **Add** project color palette feature + Branding card
- **Extend** Analyze DNA branding + Assemble themeOverrides source
- **Depends on** change-021 for `purpose: client_logo` fallback path
- **Out of this pack**: Creative 3-color picker migration; shareable palette URLs; non–pitch-landscape templates
