# Bug #029 — Auth Pages Inconsistent Alignment & Spacing

## Status
**DONE** — **Confirmed**: 2026-07-13

## Reported
- **Date**: 2026-07-13
- **Severity**: medium
- **Affected area**: customer-portal/auth (login, register, forgot-password, reset-password, verify-email, check-email)

## Description
Auth pages have inconsistent vertical spacing, cramped form fields on some screens, and mixed alignment (headers/forms left-aligned while "Back to login" links are center-aligned). The forgot-password page (screenshot) shows a large gap between subtitle and form, and a centered back link that doesn't align with the left-aligned content above.

## Expected Behavior
All auth pages share consistent spacing rhythm: tight title/subtitle grouping, even gaps between form fields and actions, comfortable input/button padding, and coherent alignment (left-aligned for form pages; center-aligned for status/state pages).

## Steps to Reproduce (if applicable)
1. Open `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/check-email`.
2. Compare title-to-subtitle spacing, form field gaps, button padding, and footer link alignment across pages.

## Root Cause
1. **Duplicated SCSS with drift** — Each auth page defines its own copy of `.auth-form`, `.auth-title`, `.auth-sub`, etc. Values differ: `.field` gap is `8px` on login/register but `6px` on forgot/reset; submit-btn min-height/padding differs; forgot/reset lack `form { gap: 16px }` and PrimeNG input deep styles.
2. **Negative margin hack** — `.auth-sub { margin-top: -12px }` on all pages fights the parent `gap: 20px`, producing uneven spacing between header block and form (visible on forgot-password).
3. **Missing base styles** — `verify-email.page.scss` and `check-email.page.scss` use `.auth-form`, `.auth-title`, `.auth-sub`, `.submit-btn` in HTML but do not define most of those classes (only page-specific state styles exist).
4. **Mixed alignment** — `.auth-alt-link a { display: flex; justify-content: center }` on forgot/reset centers the back link while title/subtitle/labels are left-aligned.
5. **Partial prior fix** — Bug #024 addressed login/register padding only; other auth pages were not updated.

## Fix Applied
1. Created `auth-form.shared.scss` with unified spacing, input/button sizing, banners, and state blocks.
2. Wrapped title + subtitle in `.auth-header` on all auth pages (replaces negative margin hack).
3. Added `.auth-form--centered` for verify-email, check-email, and forgot-password success state.
4. Left-aligned back links on form pages; kept center alignment on login/register alt links and state pages.
5. Replaced duplicated per-page SCSS with shared import + page-specific overrides only.
6. Reduced auth-layout shell gap from 24px to 20px.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced (frontend build passes)
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/auth/auth-form.shared.scss` *(new)*
- `roya-ai-dynamo-frontend/src/app/layouts/auth-layout/auth-layout.ts`
- `roya-ai-dynamo-frontend/src/app/pages/auth/login/login.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/auth/login/login.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/auth/register/register.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/auth/register/register.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/auth/forgot-password/forgot-password.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/auth/forgot-password/forgot-password.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/auth/reset-password/reset-password.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/auth/reset-password/reset-password.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/auth/verify-email/verify-email.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/auth/verify-email/verify-email.page.scss`
- `roya-ai-dynamo-frontend/src/app/pages/auth/check-email/check-email.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/auth/check-email/check-email.page.scss`
