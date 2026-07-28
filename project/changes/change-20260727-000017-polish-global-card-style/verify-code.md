# Verify Code — change-20260727-000017-polish-global-card-style

- **date**: 2026-07-27
- **result**: PASS
- **request-id**: —

## Checks

| Acceptance | Evidence | Status |
|------------|----------|--------|
| Global `.p-card` matches Create Project look | `styles.css`: border `--form-card-border`, radius 12px, `box-shadow: none`, padding 1.25rem, title deep blue | PASS |
| Bare `p-card` pages inherit without styleClass | Global selector `.p-card` (not `.form-card` only) | PASS |
| Create/Edit/DNA/Detail drop local chrome | No remaining `:host ::ng-deep .form-card` rules under `pages/projects/` | PASS |
| `proposal-view-card` zero padding kept | Component override still sets body/content `padding: 0` | PASS |
| Light + dark tokens | `--form-card-border` on `:root` (`#e3e5e8`) and `.app-dark` (`#3f3f46`); dark title uses `--auth-text` | PASS |

## Gaps / notes

- Visual spot-check in running FE recommended (dashboard / clients / create project).
- `styleClass="form-card"` left on templates as harmless alias; chrome comes from global CSS.

## Verdict

**PASS** — ready for merge gate (P.5).
