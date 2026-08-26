# Change Request

## Metadata
- **date**: 2026-08-26
- **change-type**: modify-page
- **target-app**: customer-portal
- **affected-repos**: frontend
- **priority**: medium

## Scope
- Module(s): Apps & Multi-Tenancy, Tokens & SDK Integration, Products, Customers, Payments & Checkout
- Feature(s): Client Tokens (view), Product Catalog (view), Customer Records (view), Session Management (detail), portal sidebar
- Endpoint(s): none (existing endpoints unchanged)
- Page(s)/View(s):
  - customer-portal: Token view side panel (`/tokens`)
  - customer-portal: Product view (`/products/view/:id`)
  - customer-portal: Customer view (`/customers/view/:id`)
  - customer-portal: Payment operation detail side panel (`/payments`)
  - customer-portal: sidebar menu (`app.menu.ts`)
- Service(s): none

## Description

Merchant portal detail surfaces feel like leftover forms or dense field stacks. List pages already use the global design system (`page-header`, list cards, filter bar, `--pu-*` tokens). Detail views should match that language and read as entity summaries, not edit forms.

**Who is affected:** merchant portal users (owner/admin/member/developer) viewing tokens, products, customers, and payment sessions.

**Desired behavior:**
1. **List / main pages stay on global styles** — Tokens, Products, Customers, and Payments list shells keep existing `page-header`, tables, and filter chrome. No list-layout rewrite.
2. **Shared detail language** across the four views:
   - Hero strip: entity title, status/environment tags, one primary action
   - Section cards using `--pu-*` tokens (surface, border, radius, shadow)
   - Label-above-value field grid (less per-field icon noise)
   - Copyable monospace values for token, session id, store code
   - Soft chips for scopes, tags, libraries
3. **Token view** (side panel): cleaner information grid, token value + copy as a featured block, libraries/scopes as compact chips, domains as quieter cards. Keep add / verify / generate-file / remove domain and Close / Edit Token.
4. **Product view** (full page): stop looking like a disabled create-form. Hero with title, status, price, store code. Two-column summary cards (media, inventory, shipping, publishing, SEO). Keep Back / Edit and existing fields.
5. **Customer view** (full page): hero with name, contact, member-since / payment count. Address and notes as cards. Payment history table stays, restyled to match. Keep Edit.
6. **Payment operation view** (side panel): stronger amount + status hero, then session, customer, products, and metadata sections in the same card language. Keep Close / Refund.
7. **Navbar:** Dashboard remains first. **My Apps** moves immediately after Dashboard. **Tokens** nests under My Apps (parent still opens `/apps`). Active-state highlighting must recurse into nested items so `/tokens` marks Tokens and expands My Apps.

**Out of scope:** backend, admin panel, checkout, new fields/endpoints, list-page redesign, create/edit form redesign, i18n copy overhaul (nav labels already exist).

**User story:** As a merchant, I open a token, product, customer, or payment and immediately see the important facts in a consistent layout. I find Tokens under My Apps, after Dashboard.

## Acceptance Criteria
1. Tokens, Products, Customers, and Payments **list** pages still use existing global page/list styles (no visual regression of the main list chrome).
2. Token view side panel shows a hero (name + environment + status), featured copyable token value, then Libraries / Scopes / Allowed Domains sections using portal tokens. Domain add, verify, generate-file, remove, Close, and Edit Token still work.
3. Product view `/products/view/:id` reads as a detail page (hero + summary cards), not a read-only form. Title, status, price, store code, media, inventory, shipping, publishing, SEO, and metadata remain visible when present. Back and Edit still work.
4. Customer view `/customers/view/:id` has a hero (name, contact, stats), address/notes/tags cards, and payment history table. Edit and lazy payment history still work, including empty and error states.
5. Payment operation side panel has an amount + status hero and grouped session / customer / products / metadata sections. Close and Refund (completed only) still work.
6. Sidebar order in Main Menu is: **Dashboard → My Apps → (nested) Tokens → Products → Customers**. Payments and Notifications sections are unchanged.
7. Clicking My Apps still navigates to `/apps`. Clicking Tokens navigates to `/tokens`. On `/tokens`, Tokens is the active item and My Apps stays expanded.
8. No new endpoints, services, or data-model fields. No admin-panel or backend change.

## Notes
Standard flow (not Fast-Track): frontend-only and no new APIs, but it touches multiple modules (Tokens, Products, Customers, Payments, layout).

Visual approach: reuse `styles.css` tokens and existing `app-side-panel` / `form-section-card` primitives; add a small shared detail-view class set if needed so the four views stay consistent. Reference: current token drawer (attached screenshot) plus portal indigo tokens (`--pu-primary` `#4f46e5`).
