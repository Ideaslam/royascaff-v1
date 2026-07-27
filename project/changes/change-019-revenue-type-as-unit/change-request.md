# Change Request

## Metadata
- **date**: 2026-07-27
- **change-type**: modify-feature
- **target-app**: web
- **affected-repos**: backend+frontend
- **priority**: medium
- **request-id**: REQ-PROP-V3
- **part**: —
- **depends-on**: —
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Services catalog; Projects (Create / Edit pipeline v3); display helpers that show `unit`
- Feature(s): Revenue type is the canonical unit; project service overrides include name / unit / price / qty
- Endpoint(s): existing project/services create-update (no new routes)
- Page(s)/View(s): `web`: service-edit, services list; project-create, project-edit
- Service(s): FE display helpers; optional BE sync of `unit` from `revenueType` label for legacy consumers

## Description

**Problem:** Services have both a **Revenue type** select (`project` / `recurring` / `retainer` / …) and a free-text **Unit** field (`Project / month / hour`). These overlap — revenue type already defines the billing unit. Project Create/Edit (pipeline v3) overrides only name, price, and quantity; users cannot override unit/revenue type per project.

**Outcome:**
1. **Services catalog** — Remove the free-text Unit input from service create/edit. Revenue type select is the unit. Remove/hide the Unit column on the services list (keep Revenue type). On save, derive/persist `unit` from the selected revenue-type **label** (Arabic labels as today) so existing PDF/prompt consumers that read `unit` keep working without a separate user field.
2. **Project Create + Project Edit (pipeline v3)** — Selected-services override row becomes: **name | revenue type (unit select) | price | quantity | delete**. Selecting a service seeds `revenueType` (and derived `unit`) from the catalog; user can override all four fields before submit. Payload continues to send `name`, `price`, `qty`, `revenueType`, and derived `unit`.
3. **Display** — Price/unit display helpers use revenue-type label when `unit` is empty (ratio still shows `%`).

**Defaults applied (user said proceed):**
- Scope: Services UI + Project Create/Edit; not a full Creative-flow redesign.
- Data: keep `unit` field in API/DB for compatibility; auto-fill from revenue type label (no free-text editor).
- Apply override select on both Create and Edit.
- FE primary; light BE touch only if project DNA/normalize needs revenueType→unit consistency.

**Out of scope:**
- New revenue-type enum values
- DB migration to drop `unit`
- Creative legacy wizard redesign (unless the same service-edit form is shared)
- New API endpoints

## Acceptance Criteria
1. Service create/edit has no free-text Unit field; Revenue type select remains required/available.
2. Saving a service stores `revenueType` and sets `unit` to the matching revenue-type label (or empty when unset).
3. Services list does not show a separate Unit column (Revenue type column remains).
4. Project Create selected-overrides row includes editable name, revenue-type select, price, and quantity.
5. Project Edit selected-overrides row matches Create (name, revenue-type select, price, quantity).
6. Project submit/save payload includes overridden `name`, `revenueType`, derived `unit`, `price`, and `qty`.
7. Price display for selected services uses revenue-type label (or derived unit); ratio type still shows percentage.
8. Existing projects/services with legacy free-text `unit` still load without error; override UI shows revenue type when present.

## Notes (optional)
- Screenshot reference: services form Revenue type dropdown (مشروع / متكرر / عقد شهري) with adjacent Unit free-text to remove.
- Options source: `REVENUE_TYPE_OPTIONS` in `creative-form-options.ts`.
- i18n: prefer translating option labels if already wired; otherwise keep current Arabic labels consistent with existing select.
