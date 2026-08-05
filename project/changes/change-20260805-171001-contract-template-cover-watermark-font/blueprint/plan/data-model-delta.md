# Data Model Delta — change-20260805-171001-contract-template-cover-watermark-font

Scope: `contract_templates` token catalog (§10a) + `settings.defaultFont` enum (§11). No new collections, no new fields, no schema/type changes — purely additive token vocabulary + one new allowed enum value.

## 10a. contract_templates (after-state — token catalog only)

**Placeholder token catalog** (authoritative — editor's clickable token picker + `renderContractHtml`):

- Workspace (existing): `workspace_name` / `workspace_logo` / `workspace_email` / `workspace_phone` / `workspace_address`
- Client (existing): `client_name` / `client_address` / `client_cr` / `client_representative` / `client_contact_name` / `client_contact_phone` / `client_signature_label`
- Contract (existing): `contract_number` / `contract_date` / `contract_duration` / `contract_notes` / `technical_appendix_number` / `ad_commission_percent`
- Content (existing): `services` / `financial_table`
- **Design / Branding (new)**:
  - `document_font_link` — `<link>` tag(s) for the workspace's selected Google Font (`Cairo` \| `Tajawal` \| `Amiri`), resolved from `settings.defaultFont`
  - `document_font` — CSS `font-family` value matching the selected font (e.g. `'Amiri', serif`)
  - `brand_primary` / `brand_secondary` / `brand_accent` / `brand_surface` / `brand_text` — hex colors from `settings.colorRoles` (fallback to Roya defaults when the workspace has no palette), for the cover gradient / clause badges / table tints
  - `contract_total` — formatted grand-total amount (same figures as `financial_table`'s last row), for the post-cover "at-a-glance" summary strip

Any other `{{token}}` remains a free override key via the existing `overrides: Record<string,string>` mechanism.

## 11. settings (after-state — enum only)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `defaultFont` | String | theme; one of `Cairo` \| `Tajawal` \| `Amiri` (was `Cairo` \| `Tajawal`) | — |

## Delta
- `contract_templates` §10a token catalog: **add** 8 new tokens (`document_font_link`, `document_font`, `brand_primary`, `brand_secondary`, `brand_accent`, `brand_surface`, `brand_text`, `contract_total`). No change to existing tokens, no change to the `contract_templates` document shape.
- `settings` §11 `defaultFont`: **add** `Amiri` as a third allowed value in `settings-schema.ts` (`FALLBACK_SETTINGS_SCHEMA`) and the DB-seeded copy in `scripts/config-seed-data.js`. No storage/shape change — still a plain string field.
