# Bug #036 — Generate Dashboard button does nothing

## Status
**DONE** — **Confirmed**: 2026-07-14

## Reported
- **Date**: 2026-07-14
- **Severity**: high
- **Affected area**: customer-portal / `pages/projects/project-detail` (New Dashboard drawer)

## Description
Clicking **Generate Dashboard** in the New Dashboard drawer does nothing — no API request is sent, no loading state, and no visible error message. The button appears enabled when a data source is selected, but the click is silently ignored.

## Expected Behavior
1. If required fields are missing, show clear validation errors and prevent submission.
2. When all fields are valid and at least one data source is selected, call the create-dashboard API and navigate to the generating page.

## Steps to Reproduce
1. Open a project → click **New Dashboard**
2. Enter a dashboard name (e.g. "product overview")
3. Leave **Purpose / Description** empty
4. Select at least one synced data source
5. Click **Generate Dashboard** → nothing happens, no network request

## Root Cause
`createDashboard()` blocks submission when `dashboardForm.invalid` and calls `markAllAsTouched()`, but the template never surfaces the `required` error on `purposeDescription`.

```205:209:roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.ts
  createDashboard() {
    if (this.dashboardForm.invalid) {
      this.dashboardForm.markAllAsTouched();
      return;
    }
```

The form requires `purposeDescription` (required + minLength 10):

```89:92:roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.ts
  dashboardForm = this.fb.group({
    name: ['', [Validators.required]],
    purposeDescription: ['', [Validators.required, Validators.minLength(10)]]
  });
```

But the template only renders an error for `minlength`, not `required`:

```139:141:roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.html
        @if (dashboardForm.get('purposeDescription')?.touched && dashboardForm.get('purposeDescription')?.errors?.['minlength']) {
          <small class="field-error">{{ 'PROJECTS.DETAIL.DB_PURPOSE_MIN' | translate }}</small>
        }
```

When the field is empty, Angular sets a `required` error (not `minlength`), so after click the user sees no feedback. The Generate button is also only disabled for missing dataset selection — not for invalid form state — so it looks clickable:

```309:309:roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.html
      [disabled]="selectedDatasetIds().length === 0 || datasetsTotalAll() === 0"
```

## Fix Applied
1. **Template** — Show `required` error on `purposeDescription` before `minlength` error (same pattern as `name` field).
2. **Button** — Extended `[disabled]` to include `dashboardForm.invalid` so the button state matches submit eligibility.
3. **i18n** — Added `DB_PURPOSE_REQUIRED` key in `en.json` and `ar.json`.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/projects/project-detail/project-detail.page.html`
- `roya-ai-dynamo-frontend/public/i18n/en.json`
- `roya-ai-dynamo-frontend/public/i18n/ar.json`
