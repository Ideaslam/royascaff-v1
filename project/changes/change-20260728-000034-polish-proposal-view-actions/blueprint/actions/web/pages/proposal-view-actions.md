# Proposal View — Terminal Actions Toolbar (polish)

### Proposal View v3 actions `PG-PROP-V3-02` (delta)
- Route: `/proposals/:id/view` (v3 terminal)
- Status: done
- Components: grouped toolbar in `ProposalViewComponent`
- Guard: unchanged (`proposal.view` / `projects.edit` / `projects.create`)

## After-state UI

Toolbar is one flex row that wraps, with **two clusters**:

1. **Document cluster** (`.actions-group--doc`)
   - Technical | Financial `p-selectButton` — segmented chrome, selected = brand primary fill
   - Language `p-selectButton` when `langOptions.length > 1`
   - Download PDF (technical only) — secondary + `pi-file-pdf`
   - Open HTML — secondary + `pi-external-link`

2. **Pipeline cluster** (`.actions-group--pipeline`)
   - Continue (when `showContinue`) — primary + `pi-play`
   - Retry failed sections — warn + `pi-replay`
   - Translate — secondary outlined + `pi-language`
   - New template — secondary + `pi-clone`
   - Regenerate — danger outlined/text + `pi-refresh` (quiet destructive)

Between clusters: thin vertical rule (`.actions-sep`) that hides when the row wraps to a single group-per-line feel (or simply a wider gap + optional border).

### Tokens / chrome
- Gap 8px inside groups, 16px between groups
- Button height consistent (`size="small"` or shared host CSS)
- SelectButton: 12px radius, hairline border `#e3e5e8` / token, selected uses `--roya-blue` / deep text
- No new cards; toolbar sits above existing `proposal-view-card` iframe

## Delta
- Before: flat wrap of mixed severities (warn orange + primary blue + red outline + greys); select looks like one grey blob
- After: two labeled groups, brand-coherent severities, icons on all actions, segmented doc/lang controls

## Unchanged
- Handlers, dialogs, permissions, visibility rules, polling, iframe behavior
