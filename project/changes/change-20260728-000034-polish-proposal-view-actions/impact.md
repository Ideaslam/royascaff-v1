# Impact Analysis — Proposal View actions polish

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Terminal actions | partial | `proposal-view.component.ts` `.proposal-view-actions` | Flat row; mixed severities; no grouping |
| Styles | partial | same file `styles` | Only flex gap; no selectButton chrome |

Feature state: **partial** (behavior done; chrome noisy)

## Affected Modules
- Proposal View (v3 terminal toolbar)

## Pack blueprint files
- [x] `blueprint/actions/web/pages/proposal-view-actions.md`
- [x] `blueprint/_index.md`

## Code files to modify

| App | Path | Action |
|-----|------|--------|
| web | `pages/proposals/proposal-view/proposal-view.component.ts` | Group markup + severities/icons + toolbar styles |

## Ripple effects
- None (display/layout only)

## Risk
- Complexity: **L**
- Cross-module: **N**
- Migration: **N**

## Recommendation
- **Modify**: template + host styles in `ProposalViewComponent` only
