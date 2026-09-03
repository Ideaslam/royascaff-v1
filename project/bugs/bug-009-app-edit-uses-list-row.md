# Bug #009 — App edit drawer uses list row instead of details

## Status
**DONE**
**Confirmed**: 2026-09-03

## Reported
- **Date**: 2026-09-03
- **Severity**: high
- **Affected area**: merchant portal / Applications (`payup-frontend-customer-control` apps list + edit drawer)

## Description
The Applications table is the list-with-basic-info view. Opening **Edit Application** does not load full details. Brand Name is empty and Checkout Display checkboxes show defaults (all checked), so saved values look like they never persisted.

Saving from that stale form can also overwrite real checkbox values with the defaults.

## Expected Behavior
- List uses `GET /v1/apps/list` (basic fields only).
- Edit uses `GET /v1/apps/:appId` (full details) before the form is shown.
- Every edit field is populated from details and sent on update: name, description, brandName, brandLogo, and all checkout display flags.

## Steps to Reproduce (if applicable)
1. Open Applications.
2. Edit an app that has a brand name and at least one checkout checkbox unchecked.
3. Drawer shows empty Brand Name and all checkboxes checked.
4. Click Update without re-entering Brand Name — checkboxes can be written back as `true`.

## Root Cause

Backend already has the two endpoints. List projection is correct (`_id`, `name`, `brandLogo`, `description`, `isActive`, `createdAt`). Details (`GET /:appId`) and update (`PUT /:appId`) already accept `brandName` and all `show*` flags.

`editApp()` spread the **list row** and never called `appsService.getApp()`. Missing `brandName` stayed empty. Missing `show*` fields defaulted to `true`.

`saveApp()` only included `brandName` / `description` when truthy, so a reopen-and-save could omit brand name. Checkboxes were always sent — with those default `true` values.

Checkbox labels also shared the same `id` as the PrimeNG host, so clicking the title/description did not toggle the input.

## Fix Applied

In `apps.component.ts`:

1. `editApp(app)` fetches `GET /v1/apps/:appId` via `appsService.getApp()`, shows a loading state, then patches the form from the details response.
2. `saveApp()` always sends `description` and `brandName` (including empty string), plus all checkout flags.
3. After create/update/logo upload, only list fields are written back into `apps: AppListItem[]`.
4. Checkout option labels use unique `inputId` values so clicking the text toggles the checkbox.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `payup-frontend-customer-control/src/core/pages/apps/apps.component.ts`
- `payup-frontend-customer-control/src/core/pages/apps/apps.component.css`
- `payup-frontend-customer-control/src/styles.css`
