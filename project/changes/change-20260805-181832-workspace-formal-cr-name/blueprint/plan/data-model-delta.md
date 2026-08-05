# Data model delta — workspace legal / CR party identity

## settings (after-state, company fields)

| Field | Type | Constraints | Ref |
|-------|------|-------------|-----|
| `companyName` | String | brand / trade name | → `{{workspace_name}}` |
| `companyFormalName` | String | optional; legal CR company name | → `{{workspace_formal_name}}` |
| `companyCr` | String | optional; commercial registration number | → `{{workspace_cr}}` |
| `companyRepresentative` | String | optional; legal signatory name | → `{{workspace_representative}}` |
| `companyCity` | String | optional; city in formal party clause | → `{{workspace_city}}` |
| `email` / `phone` / `address` | String | unchanged | existing tokens |

Schema keys (Company group order):

| key | storageKey | type | order |
|-----|------------|------|------:|
| `company.name` | `companyName` | text | 1 |
| `company.formalName` | `companyFormalName` | text | 2 |
| `company.cr` | `companyCr` | text | 3 |
| `company.representative` | `companyRepresentative` | text | 4 |
| `company.city` | `companyCity` | text | 5 |
| `company.email` | `email` | email | 6 |
| `company.phone` | `phone` | text | 7 |
| `company.address` | `address` | text | 8 |

Label keys: `settings.companyFormalName`, `settings.companyCr`, `settings.companyRepresentative`, `settings.companyCity`.

## contract_templates — placeholder token catalog (after-state, workspace slice)

From settings: `workspace_name` / `workspace_logo` / `workspace_email` / `workspace_phone` / `workspace_address` / **`workspace_formal_name`** / **`workspace_cr`** / **`workspace_representative`** / **`workspace_city`**.

(Other token groups unchanged.)

## Delta

- **Add** `settings.companyFormalName`, `companyCr`, `companyRepresentative`, `companyCity`
- **Add** tokens `workspace_formal_name`, `workspace_cr`, `workspace_representative`, `workspace_city`
- **Modify** default Roya template content to use those tokens instead of hardcoded legal party values
