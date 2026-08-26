# Impact Analysis — Portal Detail Views + Nav Reorder

## Code Reconnaissance

| Layer | State | Location | Gaps |
|-------|:-----:|----------|------|
| Schema | complete | unchanged | none — no data-model work |
| Service(s) | complete | `TokensService`, `ProductsService`, `CustomersService`, `PaymentsService` | none — reuse existing get/list/domain/refund methods |
| Endpoint(s) | complete | merchant tokens/products/customers/payments | none |
| Page(s) | complete | see files below | detail chrome is form-like or unstyled; nav order is Dashboard → Tokens → My Apps |

Feature state: **complete** (visual + nav modify)

### Confirmed artifacts

| Surface | Route / host | Implementation | Current issue |
|---------|--------------|----------------|---------------|
| Token view | `/tokens` side panel | `tokens.component.ts` (`viewDialog` / `viewedToken`) | Markup exists; **no view CSS** in `tokens.component.css` (form/domain styles only) |
| Product view | `/products/view/:id` | `product-view.component.ts` + `.css` | Full-page **read-only form** (`product-form-container`, `form-section-card`, muted `view-field` inputs) |
| Customer view | `/customers/view/:id` | `customer-view.component.ts` + `.css` | Same form-card layout; label/value rows, no hero |
| Payment operation view | `/payments` side panel | `payments.component.html` (`detailsDialog`) | Markup exists; **no detail CSS** in `payments.component.css` (filters only) |
| Sidebar | layout | `app.menu.ts` | Main Menu: Dashboard, **Tokens**, **My Apps**, Products, Customers. `updateActiveStates()` is **one level only** |
| Shared shell | global | `styles.css` (`page-container`, `page-header`, `form-section-card`, `--pu-*`) | No shared detail-hero / field-grid primitives |
| Side panel | shared | `side-panel.component.ts` | Keep as-is; views compose inside it |
| i18n | `en.json` / `ar.json` `menu.*` | Labels already exist | No new keys required |

### Plan-vs-code drift
- `dashboard.md` does not document sidebar item order or nested Tokens.
- Token/payment **list** pages already match global `page-container` / `page-header` / `content-card` — keep them.

## Affected Modules
- Apps & Multi-Tenancy — sidebar parent **My Apps** (`/apps`)
- Tokens & SDK Integration — token view panel + Tokens nested under My Apps
- Products — product view page
- Customers — customer view page
- Payments & Checkout — payment session detail panel

## Plan Docs to Update
- [x] `project/actions/customer-portal/pages/dashboard.md` — in-place: view UI notes + sidebar order
- [ ] `modules.md` — skip (no feature add)
- [ ] `data-model.md` / `services/` / `endpoints/` / `rules.md` / `description.md` — skip

## Code files

### Modify
| File | Action |
|------|--------|
| `payup-frontend-customer-control/src/core/pages/tokens/tokens.component.ts` | Restyle **view panel only** (hero, field grid, chips). Do not change list or create/edit panels. |
| `payup-frontend-customer-control/src/core/pages/tokens/tokens.component.css` | Add token-view styles (or rely on shared detail classes). |
| `payup-frontend-customer-control/src/core/pages/products/product-view/product-view.component.ts` | Hero + summary cards; keep fields, Back/Edit, loading/error. |
| `payup-frontend-customer-control/src/core/pages/products/product-view/product-view.component.css` | Detail layout; drop form-input look. |
| `payup-frontend-customer-control/src/core/pages/customers/customer-view/customer-view.component.ts` | Hero + cards; keep payment table, Edit, empty/error. |
| `payup-frontend-customer-control/src/core/pages/customers/customer-view/customer-view.component.css` | Align with shared detail language. |
| `payup-frontend-customer-control/src/core/pages/payments/payments.component.html` | Restyle **detail panel only**. |
| `payup-frontend-customer-control/src/core/pages/payments/payments.component.css` | Add missing payment-detail styles. Leave filter CSS untouched. |
| `payup-frontend-customer-control/src/core/layout/component/app.menu.ts` | Order: Dashboard → My Apps (command → `/apps`) → nested Tokens → Products → Customers. Recurse active-state into children; expand My Apps on `/tokens`. |
| `payup-frontend-customer-control/src/styles.css` | Shared detail primitives (`.detail-hero`, `.detail-card`, `.detail-fields`, `.detail-mono`, `.detail-chips`) + nested PanelMenu indent. |

### Create
None required (optional shared classes live in existing `styles.css`).

### Do not touch
List page chrome, create/edit forms, services, routes, backend, admin panel, checkout, i18n files (unless a tiny key is needed).

## Ripple map
| Caller / callee | Action |
|-----------------|--------|
| `app.menu.ts` `updateActiveStates()` | **Modify** — recurse `item.items`; set `expanded` on My Apps when Tokens is active |
| `styles.css` PanelMenu | **Modify** — nested submenu padding; parent vs child active |
| `app.topbar.ts` `titleMap` | Safe — `/apps` and `/tokens` already mapped |
| `app-side-panel` | Reuse — no API change |
| Domain add/verify/remove, refund, customer payment lazy load | Keep method calls; markup/class only |

## Reuse
- `--pu-*` tokens, `page-container` / `page-header` (lists), `form-section-card` as card primitive, `app-side-panel`, existing `p-tag` / `p-button`, `SkeletonComponent`

## Risk
- Complexity: **L**
- Cross-module: **Y** (layout + 4 pages, frontend only)
- Migration: **N**
- Nested PanelMenu: parent must navigate to `/apps` via `command` while remaining expandable; section headers stay `pointer-events: none` (only nested My Apps chevron is interactive)

## Recommendation
- **Create:** none
- **Complete:** none
- **Modify:** four detail views + sidebar + shared detail CSS in `styles.css` + `dashboard.md`
