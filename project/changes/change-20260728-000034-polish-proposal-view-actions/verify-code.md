# Verify — change-20260728-000034-polish-proposal-view-actions

**Date:** 2026-07-28  
**Overall:** PASS

## Acceptance criteria

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Toolbar reads as two clusters (doc \| pipeline) with separator | PASS | `.actions-group--doc` / `--pipeline` + `.actions-sep` in `proposal-view.component.ts` |
| 2 | Consistent size, radius, gap; meaningful severities | PASS | All actions `size="small"`; outlined secondary for routine; warn outlined Retry; danger text Regenerate |
| 3 | Technical/Financial segmented control with brand selected state | PASS | `styleClass="actions-segment"` + checked styles use `--roya-blue` |
| 4 | Regenerate quiet destructive | PASS | `severity="danger" [text]="true"` (not solid/outlined loud) |
| 5 | Narrow wrap | PASS | flex-wrap on toolbar + groups; separator hidden ≤640px |
| 6 | No API/behavior change | PASS | Same handlers, permissions, `@if` visibility |

## Manual check
- Reload `/proposals/:id/view` (v3 Ready) and confirm clusters + segment highlight.
