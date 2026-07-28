# Change Request

## Metadata
- **date**: 2026-07-29
- **change-type**: modify-feature
- **target-app**: all-apps (backend + admin-panel + customer-portal)
- **affected-repos**: backend+frontend+admin
- **priority**: medium

## Scope
- Module(s): Data
- Feature(s): Data Source Type Metadata
- Endpoint(s): EP-DATA-47 (`GET /data/source-types`), EP-DSTYPE-01..04 (admin list/get/patch/toggle); connect/create paths that accept `sourceType` (guard against coming-soon)
- Page(s)/View(s):
  - `admin-panel`: Data Source Types (`/app/data-source-types`)
  - `customer-portal`: source type pickers (connect data-source drawer, add-connection type picker, any equivalent type selection UI)
- Service(s): SVC-DSTYPE (`DatasourceTypeMetaService` / repository); customer + admin frontend datasource-type services

## Description

### Problem / motivation
Admins need to announce upcoming connectors in the customer portal before they are ready to use — without allowing users to select or connect them.

### Who is affected
- **Admins** — toggle visibility (`isActive`) and **Coming soon** on each datasource type
- **Customer portal users** — see announced types with a Coming soon badge; cannot select/connect them

### Desired outcome
Reuse existing `isActive` as “show to user”. Add boolean `comingSoon` on `datasource_type_meta`, controllable from the admin panel. Active + coming-soon types appear in the customer picker with a Coming soon tag/note and are non-selectable; backend also rejects connect/create for those types.

### Behavior matrix
| `isActive` | `comingSoon` | Customer portal |
|------------|--------------|-----------------|
| false | any | Hidden |
| true | false | Visible + selectable |
| true | true | Visible + “Coming soon” badge/note + **not selectable** |

### Current behavior
- Admin manages bilingual titles, logo, instructions, and `isActive` on `/app/data-source-types`
- `isActive = false` hides the type from `GET /data/source-types` (EP-DATA-47)
- No coming-soon state

### Desired behavior
1. **Data model**: add `comingSoon: boolean` (required, default `false`) on `datasource_type_meta`
2. **Admin panel**: show Coming soon toggle (table + edit dialog); PATCH accepts `comingSoon`; optional dedicated toggle endpoint or include in existing PATCH/toggle patterns
3. **Customer API (EP-DATA-47)**: continue returning only `isActive = true` entries, **including** those with `comingSoon = true`; response includes `comingSoon`
4. **Customer UI**: all source-type pickers render coming-soon types with a bilingual Coming soon tag/note; click/select disabled; no navigation into connect wizard for that type
5. **Backend enforcement**: any create-connection / create-source / setup entry that accepts `sourceType` returns a clear 4xx (e.g. 400/403) if that type is `comingSoon` or inactive — not UI-only
6. **Existing data**: types already connected remain usable; marking a type coming-soon later does **not** break existing Connections / DataSources

### Out of scope
- Adding new `DataSourceType` enum values / connectors
- Changing sync, schema discovery, or wizard flows for ready (non–coming-soon) types
- Renaming or removing `isActive`
- Landing site changes

### Constraints
- Must not break existing Connections / DataSources for live types
- Seed script remains idempotent (`comingSoon: false` for current seeds unless admin later sets otherwise)
- EN/AR i18n for the Coming soon label in customer portal
- Follow existing admin Data Source Types UI patterns (PrimeNG toggle/table)

### User story
- **Happy path**: Admin sets Meta Ads to Active + Coming soon → customer sees Meta Ads in the picker with a Coming soon badge → click does nothing / is disabled → user cannot start connect. Admin later clears Coming soon → type becomes selectable and connect works.
- **Edge**: User crafts API call with a coming-soon `sourceType` → API rejects with clear error. Type with `isActive = false` stays hidden regardless of `comingSoon`.

### Permissions
- Admin-only write for `comingSoon` / `isActive` (existing admin JWT + role)
- Customer read via existing authenticated EP-DATA-47
- No new public endpoints

### Data changes
- Field: `datasource_type_meta.comingSoon` — Boolean, required, default `false`
- No new collections; no migration script required beyond schema default (existing docs get `false` on read/update; seed upserts include `comingSoon: false`)

## Acceptance Criteria
1. Admin can set/clear **Coming soon** for each datasource type from the admin Data Source Types page; value persists via admin API.
2. `GET /api/v1/data/source-types` returns active types including coming-soon ones, each with `comingSoon` boolean.
3. Customer portal type pickers show coming-soon types with a Coming soon tag/note (EN/AR) and they are not selectable.
4. Backend rejects create-connection / create-source (and equivalent entry points) for a `sourceType` that is coming-soon or inactive, with a clear client-visible error.
5. Existing Connections / DataSources for a type remain usable if that type is later marked coming-soon.
6. Inactive types (`isActive = false`) remain hidden from the customer portal regardless of `comingSoon`.
7. Default for all existing/seeded types is `comingSoon: false` (no unintended lockout of current connectors).

## Notes (recommended defaults chosen with user approval)
- **Section 2**: modify Data Source Type Metadata; backend enforcement required; ripple = all customer type pickers (connect drawer + connections type picker).
- **Section 3**: one new boolean field only; no third-party / async / AI.
- **Section 4**: no auth model change; admin write / customer read as today; no new audit requirement.
- **Section 5**: API reject for coming-soon connect; existing linked records unaffected; no rollback path beyond admin toggle.
- **Section 6**: match existing admin toggles + customer PrimeNG `p-tag` patterns; no Figma; RTL/i18n via existing ngx-translate keys.
