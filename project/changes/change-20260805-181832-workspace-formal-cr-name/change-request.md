# Change Request

## Metadata
- **date**: 2026-08-05
- **change-type**: modify-feature
- **target-app**: all-apps
- **affected-repos**: backend+frontend
- **priority**: high
- **request-id**: REQ-SETTINGS-FORMAL
- **part**: —
- **depends-on**: change-20260805-171001
- **blocks**: —
- **pack-status**: merged

## Scope
- Module(s): Settings; Contracts (PDF / template tokens)
- Feature(s): Workspace legal / CR party identity for contracts & proposals
- Endpoint(s): existing Settings GET/PATCH (no new routes)
- Page(s)/View(s): web: Settings → Company tab
- Service(s): settings schema + contracts `renderContractHtml` token map; default Roya contract template seed

## Description

Today Settings stores brand/contact fields (`companyName`, `email`, `phone`, `address` → `{{workspace_name}}` etc.), while the default Roya contract HTML hardcodes the **full legal party-1 identity**:

- Formal CR company name: `شركة وهج اليمامة للخدمات التسويقية`
- CR number: `1009209357`
- Legal representative: `فهد ناصر السهلي`
- City: `الرياض`

Multi-tenant workspaces cannot put their own legal identity into contracts/proposals.

Add workspace Settings → Company fields for the **full legal party block**, expose matching placeholder tokens, and replace those hardcodes in the default Roya contract template. Keep `companyName` / `{{workspace_name}}` as the brand/trade name used in chrome, watermarks, and “trade name” references.

**New settings + tokens:**

| Setting (storage) | Schema key | Token | Example |
|-------------------|------------|-------|---------|
| `companyFormalName` | `company.formalName` | `{{workspace_formal_name}}` | شركة وهج اليمامة للخدمات التسويقية |
| `companyCr` | `company.cr` | `{{workspace_cr}}` | 1009209357 |
| `companyRepresentative` | `company.representative` | `{{workspace_representative}}` | فهد ناصر السهلي |
| `companyCity` | `company.city` | `{{workspace_city}}` | الرياض |

**Fallbacks when rendering:**
- `workspace_formal_name` → `companyName` if empty
- `workspace_city` → leave empty or derive from `address` only if address is a bare city (prefer empty placeholder dots like client fields when empty — match existing `client_cr` dash/dot fallback style)
- `workspace_cr` / `workspace_representative` → same empty fallback style as `client_cr` / `client_representative` (`........................`)

**Existing address:** keep `address` as the full postal/street address line; `companyCity` is the city used in formal party clauses (“وعنوانها {{workspace_city}}”).

## Acceptance Criteria
1. Settings → Company shows editable fields for formal/CR company name, CR number, legal representative, and city; all persist via existing Settings PATCH and appear on GET.
2. Contract HTML render exposes `{{workspace_formal_name}}`, `{{workspace_cr}}`, `{{workspace_representative}}`, `{{workspace_city}}` from the new settings keys, with the fallbacks above.
3. Default Roya contract template no longer hardcodes the four legal values; party-1 clause and signature header use the new tokens (brand/trade references continue to use `{{workspace_name}}`).
4. Contract template editor token picker lists the four new tokens.
5. i18n labels exist for en + ar for all four new settings fields.
6. Existing workspaces without the fields keep working (fallbacks); seed + fallback settings schema include the new fields.

## Notes (optional)
- Related in-flight pack `change-20260805-171001` (verified) also touches the default contract HTML — this pack depends on it for merge order; implement against current API code which already includes that pack’s template.
- Mirrors client party fields (`client_name` / `client_cr` / `client_representative` / `client_address`) on the workspace/seller side.
