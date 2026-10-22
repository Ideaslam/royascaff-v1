# Impact Analysis — change-082 Admin catalog detail pages + UX

## Code Reconnaissance
| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Package list API | complete | `api/.../controllers/subscriptions.controller.ts:93-109` → `catalog.listPackages` → `subscription-package.repository.ts:27-65` (paginated, `familyKey`/`isArchived`, `linkedPlanCount`) | no search/stage/latestOnly, no subscriber counts, no creator, no stats |
| Package detail API | complete, unused | `controller:111-115` → `repo.detail()` `:80-94` (`plans[]`, `lineage`) | no counts/creator; admin `getPackage()` never called |
| Plan list API | complete | `controller:66` `plans/all` → `subscription.repository.ts:45-51` (all docs, populated package) | no pagination/filters/counts/creator — **kept unchanged** (also used by `admin/admin-pages.service.ts:37`) |
| Plan detail API | none | — (`findPlanByIdWithPackage` exists in `subscription.repository.ts`) | new `GET plans/:id` |
| Subscriber counts | none | `usersubscriptions` (`currentPlanId`/`planId`, `status`) | aggregate per plan; package = sum over its plans |
| Admin Packages page | partial | `admin/src/app/pages/admin/packages/packages.page.ts` (742 lines) | no detail view; edit dialog drafts-only; clipped 9-col table; unlabeled limits; JSON features; no search/sort/paging |
| Admin Plans page | partial | `admin/src/app/pages/admin/plans/plans.page.ts` (931 lines) | same + sequential load, no package link |
| Admin models/service | partial | `admin/src/app/core/models/admin.models.ts:67-133`, `core/services/subscriptions-admin.service.ts` | missing fields (`maxSyncedRowsPerMonth`, `maxSyncsPerDay`, `updatedAt`, `createdByUserId`, counts) |
| Shell | complete | `admin/src/app/layouts/app-shell/app-shell.ts` (flat 13-item nav, chevrons not RTL-aware) | grouping, RTL |
| Global styles | complete | `admin/src/styles.css` (`table-card { overflow:hidden }` :141-147) | horizontal scroll |
| Untranslated strings | — | `clients.page.ts:35,131`, `workspaces.page.ts:149`, `ai-logs.page.ts` | i18n |

Feature state: partial (detail views none; lists partial).

## Affected Modules
- Subscriptions (catalog API) — repository/service/controller additions.
- admin-panel — packages + plans pages (list redesign), 2 new detail pages, routes, models/service, shell, styles, i18n, small clients/workspaces/ai-logs string fixes.

## Plan Docs to Update
- [ ] `actions/backend/endpoints/subscriptions.md` (+ `_index.md`): EP for `GET plans/:id`, `GET plans/catalog`; packages list/detail additions.
- [ ] `actions/backend/services/subscriptions.md`: SVC-SUB-CAT methods (`getPlan`, `listPlanCatalog`, counts, creator, stage filter).
- [ ] `actions/admin-panel/pages/packages.md`, `plans.md`: list redesign + detail pages; `_index.md` routes `/app/packages/:id`, `/app/plans/:id`.
- [ ] `actions/admin-panel/pages/` shell notes (navigation grouping) — in `_index.md`/overview spec as applicable.
- `plan/data-model.md`: no change (no new fields; counts are computed).

## Risk: complexity M-H, cross-module Y (API + admin), migration N
- Stage filter must mirror the frontend stage rules exactly (packages: archived → `isArchived`; live → `immutableAt` set; draft → otherwise. plans: retired → `retiredAt` set or `!isActive`; retiring → `retireAt`; live → `isPublished`; hidden → `immutableAt`; draft → otherwise).
- Family grouping + pagination: paginate by row but sort by `familyKey, version desc`, so a family may span a page boundary; `latestOnly` avoids it.

## Recommendation
- **Create**: `GET plans/:id`, `GET plans/catalog`; repo `listPlanCatalog`, `subscriberCounts`, creator lookup; admin `package-detail.page.ts`, `plan-detail.page.ts`; shared admin helpers (limit label, stage tag) in `src/app/shared/`.
- **Complete in place**: packages list repo (search/stage/latestOnly/stats/counts/creator), package detail (counts/creator); admin packages/plans list pages; models/service; shell nav; styles; i18n.
- **Modify (ripple)**: none for customer portal; `plans/all` untouched.
