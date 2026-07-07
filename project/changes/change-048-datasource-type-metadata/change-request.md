# Change Request — change-048

## Metadata

| Field | Value |
|-------|-------|
| change-id | change-048 |
| change-type | modify-data-model + new-feature |
| target-app | backend + customer-portal + admin-panel |
| affected-repos | `roya-ai-dynamo-api`, `roya-ai-dynamo-frontend`, `roya-ai-dynamo-frontend-admin` |
| priority | high |
| author | user |
| date | 2026-07-07 |

## Scope

Module **4 — Data (Multi-Source Data Management)** + **Module 21 — Admin — Color Templates** (pattern reuse) + new **Admin Module — Data Source Types** (admin CRUD page).

---

## Description

### Problem

Data source type metadata (logo, bilingual display name, bilingual instructions) is hardcoded in the frontend. There is no way for an admin to:
- Update the display name or logo for a source type without a code deploy.
- Disable a source type from being shown to customers (e.g. hide `zid` until the integration is ready).
- Provide localized setup guidance per source type.

### Desired Behavior

**New DB entity `datasource_type_meta`** — a global (non-workspace-scoped) collection that acts as a master lookup table, one document per `DataSourceType` enum value. Fields: `sourceType`, `titleEn`, `titleAr`, `logoUrl` (nullable — falls back to the existing frontend icon if absent), `instructionEn`, `instructionAr`, `isActive` (default true; when false the source type is hidden from the customer portal).

**Seed script** — a one-time, manually triggered script (`npm run seed:datasource-types` or similar) that upserts all 7 entries with sensible English/Arabic defaults. Not run on every server start.

**Backend endpoints:**
- `GET /data/source-types` — authenticated (any role); returns all `isActive = true` entries (name, logo, instructions) for the Customer Portal.
- Admin CRUD: `GET /admin/data-source-types`, `GET /admin/data-source-types/:type`, `PATCH /admin/data-source-types/:type` — admin role only; full read + update (no create/delete since the set is fixed to the enum).
- `PATCH /admin/data-source-types/:type/toggle` — admin-only; toggle `isActive` flag.

**Customer Portal:**
- Source picker ("Add New Data Source"): shows logo + `titleEn/Ar` from DB (falls back to icon + hardcoded label if logo absent or record missing).
- Setup wizard header: shows logo + title from DB.
- Data sources list page: source type chip/badge uses DB title.
- Source detail page: source type chip/badge uses DB title.
- Instructions shown as an expandable info panel or hover tooltip on the data sources list page and source detail page.
- Only `isActive = true` source types appear in the customer-facing source picker.

**Admin Panel — Data Source Types page:**
- List all 7 types with logo, titles, active status.
- Edit per type: update `titleEn`, `titleAr`, `logoUrl`, `instructionEn`, `instructionAr`.
- Toggle active/inactive (controls customer portal visibility).

### Who Is Affected

- **Customers** in the Customer Portal: see richer, admin-managed source type info; cannot connect to disabled types.
- **Admins** in the Admin Panel: can manage source type display without a code deploy.

### User Story

**Happy path (customer):** User opens "Add New Data Source" picker → sees logo + localized name for each active type → picks "Salla" → setup wizard shows Salla logo + title in header → detail page shows expandable instruction panel ("Connect your Salla store by...").

**Happy path (admin):** Admin opens Data Source Types → clicks "Zid" → updates Arabic title and sets a new logo URL → saves → customer portal immediately shows the new name/logo.

**Edge case:** If `logoUrl` is null or empty, the frontend falls back to the existing SVG/icon for that source type — no broken images.

**Edge case:** Admin disables "SQL Server" → it disappears from the customer portal source picker; existing SQL Server connections are unaffected (only the picker / new-connection flow is gated).

### Out of Scope

- Editing or adding new `DataSourceType` enum values (the set is fixed to the existing 7).
- Uploading logos via R2 from the Admin Panel (logo stored as a plain URL string; admin pastes a URL).
- Per-workspace source type configuration.
- Affecting existing active `DataConnection` records when a type is disabled (only hides from the new-connection picker).

---

## Acceptance Criteria

1. `datasource_type_meta` collection seeded with 7 documents (one per `DataSourceType`) via a manual seed script; each has `titleEn`, `titleAr`, `instructionEn`, `instructionAr`, `isActive: true`, `logoUrl: null` as initial values.
2. `GET /data/source-types` (authenticated) returns only `isActive = true` entries with `{ sourceType, titleEn, titleAr, logoUrl, instructionEn, instructionAr }`.
3. Admin `GET /admin/data-source-types` returns all 7 entries (including inactive).
4. Admin `PATCH /admin/data-source-types/:type` updates title/logo/instructions; returns updated document; non-admin returns 403.
5. Admin `PATCH /admin/data-source-types/:type/toggle` flips `isActive`; subsequent `GET /data/source-types` reflects the change.
6. Customer Portal source picker shows only active types and uses DB `titleEn/Ar`; if `logoUrl` is null the existing frontend icon is shown.
7. Setup wizard header uses DB `titleEn/Ar` + `logoUrl` (with icon fallback).
8. Data sources list page and source detail page source-type chip/badge uses DB title.
9. Expandable info / hover panel on data sources list and detail pages shows `instructionEn/Ar` (localized).
10. Admin Panel "Data Source Types" page lists all types and supports edit + toggle active with correct role enforcement.
11. No regression: existing `DataConnection` records and sync flows unaffected when a type is disabled.

---

## Notes

- Pattern: mirrors `widgetdefinitions` (global, seeded, admin-editable) and `subscriptionplans` (admin CRUD, no fixed enum).
- Bilingual fields follow the established `*Ar` companion convention (change-037).
- Seed script should be idempotent (upsert by `sourceType`).
- `DataSourceType` enum: `csv | google_sheets | shopify | salla | zid | sql_server | mongodb_atlas`.
- Fallback icon map already exists in the frontend (`source-icons` or equivalent); logo URL takes precedence when non-empty.
