# Bug #010 — Product edit actions sit at the bottom of a long form

## Status
**PENDING** — Fix in progress, awaiting confirmation

## Reported
- **Date**: 2026-09-03
- **Severity**: low
- **Affected area**: merchant portal / Products (`payup-frontend-customer-control` product create/edit form)

## Description
On the product edit (and create) page, Cancel and Update/Create sit in a footer after Inventory, Shipping, Variants, and SEO. The form is long, so the primary save action is below the fold. The current `.form-actions` block is not sticky — the comment in global CSS calls it “sticky-feeling,” but it is a normal in-flow row.

## Expected Behavior
- Cancel and Update/Create live in a sticky top bar that stays visible while scrolling (sits just below the app topbar).
- The bar looks like the rest of the portal: white surface, existing radius/shadow/tokens, title on the left, actions on the right.
- Create product uses the same bar (same component).
- Save still submits the form; Cancel still returns to `/products`.
- Customer form and settings `.form-actions` are unchanged.

## Steps to Reproduce (if applicable)
1. Open Products → Edit a product (or Add product).
2. Scroll the long form.
3. Cancel / Update product only appear after the last card.

## Root Cause
`product-form.component.ts` renders breadcrumb + a title-only `.page-header`, then the full two-column form, then `.form-actions` at the end of `<form>` (lines 54–57 and 556–570).

Shared CSS in `styles.css` (`/* Sticky-feeling action bar at the bottom of full-page forms */`) only right-aligns that footer. The window scrolls (`.layout-main-container` is not a scrollport). There is no `position: sticky` and no actions in the header.

## Fix Applied
Merged breadcrumb, title, and Cancel / Update-Create into a sticky `.product-form-toolbar` at the top of the form. Removed the bottom `.form-actions` row. Bar uses a solid surface, indigo edge, and stronger shadow so it reads against the page. Inventory/Shipping On/Off pills use primary when on; “Sell when out of stock” is its own row (no nested toggle). Customer form and settings footers were not changed.

## Verification
- [x] Fix implemented in code
- [x] No regressions introduced
- [ ] User confirmed fix resolves the issue

## Related Files
- `payup-frontend-customer-control/src/core/shared/components/form-save-bar/form-save-bar.component.ts`
- `payup-frontend-customer-control/src/core/shared/components/form-save-bar/form-save-bar.component.css`
- `payup-frontend-customer-control/src/core/pages/products/product-form/product-form.component.ts`
- `payup-frontend-customer-control/src/core/pages/products/product-form/product-form.component.css`
- `payup-frontend-customer-control/src/core/pages/customers/customer-form/customer-form.component.ts`
- `payup-frontend-customer-control/src/core/pages/customers/customer-form/customer-form.component.css`
