# Impact Analysis — Workspace Auto Free Subscription

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | `user-subscription.schema.ts`, `subscription-plan.schema.ts` | No changes needed |
| Service(s) | partial | `workspace.service.ts`, `subscriptions.service.ts` | `createWorkspace` does not assign subscription; no `findActiveFreePlan` helper |
| Endpoint(s) | complete | `workspace.controller.ts` (POST /workspaces), `auth.service.ts` (register) | Both call `createWorkspace` — fix at service layer covers both |
| Page(s) | — | — | No frontend changes |

**Feature state:** partial — free-plan activation exists (`activateFromPayment`), workspace creation exists, but they are not wired together.

## Affected Modules

- **Workspace** — `createWorkspace()` calls subscription auto-assign after workspace bootstrap
- **Subscriptions** — new `assignDefaultFreePlan(workspaceId)` + repository `findActiveFreePlan()`

## Plan Docs to Update

- [x] `project/plan/modules.md` — Create Workspace feature bullet
- [x] `project/actions/backend/services/workspace.md` — `createWorkspace` method description
- [x] `project/actions/backend/services/subscriptions.md` — new `assignDefaultFreePlan` method

## Ripple Effects

| Caller | Action |
|--------|--------|
| `AuthService.register()` | Covered — calls `createWorkspace` |
| `WorkspaceController.createWorkspace()` | Covered — calls `createWorkspace` |
| `SubscriptionLimitService` | Benefits — new workspaces immediately have active subscription for limit checks |
| Admin workspace list | No change — shows subscription once assigned |

## Risk

- **Complexity:** Low
- **Cross-module:** Yes (Workspace → Subscriptions), single call, no circular init issues (`forwardRef` already in place)
- **Migration:** No — existing workspaces without subscriptions are out of scope

## Recommendation

- **Modify:** `WorkspaceService.createWorkspace` — inject `SubscriptionsService`, call auto-assign
- **Modify:** `SubscriptionsService` — add `assignDefaultFreePlan(workspaceId)`
- **Modify:** `SubscriptionRepository` — add `findActiveFreePlan()`
- **Modify:** planning docs (3 files, in-place)
