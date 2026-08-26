# Verification — Portal Detail Views + Nav Reorder

## Plan Consistency
- [x] Pages spec updated in `actions/customer-portal/pages/dashboard.md` (sidebar order + four view notes)
- [x] No new endpoints, services, or data-model fields
- [x] Routes unchanged: `/tokens`, `/products/view/:id`, `/customers/view/:id`, `/payments`
- [x] Auth unchanged (`authGuard` + `merchantGuard` on layout)
- [x] Recon findings reflected (shared detail classes; token/payment detail CSS was missing)

## Code Verification
- [x] Pages/views at correct routes (`app.routes.ts`)
- [x] Token view panel uses `detail-hero` / `detail-secret` / cards; list + create/edit untouched
- [x] Product view is a hero + summary-card page, not a read-only form; Back / Edit kept
- [x] Customer view has identity hero, cards, payment history table; Edit + lazy history kept
- [x] Payment detail panel has amount hero + session/customer/products/metadata; Close / Refund kept
- [x] Sidebar: Dashboard → My Apps → nested Tokens → Products → Customers (`app.menu.ts`)
- [x] Active-state recursion marks Tokens on `/tokens` and keeps My Apps expanded
- [x] Shared primitives in `styles.css` (`--pu-*` tokens)
- [x] Frontend isolation: no new hardcoded external URLs; services unchanged
- [x] Layering: pages still call existing frontend services only
- [x] `ng serve` compile succeeded; `GET http://localhost:4301` → 200
- [x] Acceptance criteria met (code inspection)
- [x] UI screenshots — skipped (portal is auth-gated; no interactive browser tools in this session)

## Acceptance Criteria
1. List chrome unchanged — PASS (tokens/payments/products/customers list templates not rewritten)
2. Token view hero + copyable token + domain actions — PASS
3. Product view hero + cards, fields retained — PASS
4. Customer view hero + history table — PASS
5. Payment detail hero + grouped sections, Refund gated on completed — PASS
6. Nav order Dashboard → My Apps → Tokens — PASS
7. My Apps → `/apps`, Tokens → `/tokens` — PASS
8. No new APIs / no backend / no admin — PASS

## Result: PASS

**Overall: PASS**
