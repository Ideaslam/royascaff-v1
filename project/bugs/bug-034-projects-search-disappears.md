# Bug #034 — Search input disappears when no matching projects are found

## Status
**DONE**
**Confirmed**: 2026-07-13

## Reported
- **Date**: 2026-07-13
- **Severity**: medium
- **Affected area**: customer-portal/projects/projects-list

## Description
On the Projects list page, typing a search query that matches no projects causes the search input to disappear. The user cannot clear or change the query without leaving the page. The empty-state UI also incorrectly shows “No projects yet” / “Create First Project” instead of a no-results message.

## Expected Behavior
- The search input remains visible while a search query is active, including when results are empty.
- Empty search results show a “no matching projects” message (not the create-first-project empty state).
- The true empty-workspace state (no projects at all, no search) still shows “Create First Project”.

## Steps to Reproduce (if applicable)
1. Open My Projects with at least one project.
2. Type a search query that matches nothing.
3. Observe: search input disappears; empty state prompts creating a first project.

## Root Cause
In `projects-list.page.html`, the stats row that contains the search input was gated on:

```html
@if (!loading() && projects().length > 0) {
```

When a search returned zero items, `projects().length === 0`, so the entire search UI was removed from the DOM. The same condition also hid the input whenever `loading()` was true (every debounced search). The empty-state block used the same `projects().length === 0` check with no distinction between “workspace has no projects” and “search returned no matches”.

## Fix Applied
1. **`projects-list.page.ts`** — Track trimmed search in `searchQuery`; expose `hasActiveSearch` and `showSearchBar` (`canSearch || hasActiveSearch`). `canSearch` stays true after the workspace is known to have projects so clearing an empty search does not unmount the input while reloading.
2. **`projects-list.page.html`** — Bind stats/search to `showSearchBar()`; split empty states into create-first vs no-results.
3. **`en.json` / `ar.json`** — Added `PROJECTS.LIST.NO_RESULTS_TITLE` and `NO_RESULTS_DESC`.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [x] User confirmed fix resolves the issue

## Related Files
- `roya-ai-dynamo-frontend/src/app/pages/projects/projects-list/projects-list.page.html`
- `roya-ai-dynamo-frontend/src/app/pages/projects/projects-list/projects-list.page.ts`
- `roya-ai-dynamo-frontend/public/i18n/en.json`
- `roya-ai-dynamo-frontend/public/i18n/ar.json`
