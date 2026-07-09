# Bug #024 — Auth Login/Register Field & Button Padding Too Tight

## Status
**PENDING** — Fix applied, awaiting user confirmation

## Reported
- **Date**: 2026-07-09
- **Severity**: low
- **Affected area**: customer-portal/auth (login, register)

## Description
On the login and register pages, input fields and buttons look cramped: little internal padding in inputs, tight label-to-input spacing, fields stacked too close inside the form, and OAuth buttons vertically squashed.

## Expected Behavior
Comfortable padding on inputs and buttons; consistent vertical rhythm between labels, fields, and primary/OAuth actions.

## Steps to Reproduce (if applicable)
1. Open `/auth/login` and `/auth/register`.
2. Observe input text hugging borders and tight gaps between fields/buttons.

## Root Cause
1. Global `.p-inputtext` only sets `border-radius` — no padding override; PrimeNG default padding is too tight for these auth forms.
2. Auth page SCSS sets `.p-password` width only — password inputs inherit the same tight padding.
3. `<form>` is a single flex child of `.auth-form`, so field siblings inside the form do **not** get `.auth-form`’s `gap: 20px` — fields stack with minimal/default spacing.
4. `.oauth-btn` uses `padding: 10px 0` (vertical only, no horizontal) and feels shorter than the primary submit button.

## Fix Applied
In `login.page.scss` and `register.page.scss`:
1. Added `form { display: flex; flex-direction: column; gap: 16px; }` for even field/button spacing.
2. Increased `.field` label gap to `8px`.
3. Deep-styled `.p-inputtext` / `.p-password` inputs with `padding: 12px 14px` and `min-height: 44px`.
4. Bumped `.submit-btn` and `.oauth-btn` padding + min-height for consistent control height.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/auth/login/login.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/auth/register/register.page.scss`
