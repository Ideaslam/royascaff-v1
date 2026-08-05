# Services Delta — Safqa API · Contracts (change-20260805-181832)

### SVC-CONTRACTS-01 · `renderContractHtml` + create-from-proposal branding
- Status: done (delta)
- Extend `workspaceBranding` input with:
  - `companyFormalName?: string`
  - `companyCr?: string`
  - `companyRepresentative?: string`
  - `companyCity?: string`
- Token map additions:

| Token | Source | Empty fallback |
|-------|--------|----------------|
| `workspace_formal_name` | `companyFormalName` | `companyName` then `-` |
| `workspace_cr` | `companyCr` | `........................` (same style as `client_cr`) |
| `workspace_representative` | `companyRepresentative` | `.....................` (same style as `client_representative`) |
| `workspace_city` | `companyCity` | `......................` |

- Create-from-proposal path: pass the four fields from `getPublicSettings(workspaceId)` into `workspaceBranding` alongside existing brand/contact fields.

### SVC-CONTRACT-TEMPLATES-01 · Default Roya template (`roya-default.html`)
- Status: done (delta)
- Party-1 paragraph: replace hardcoded formal name / CR number / representative / city with tokens:

```html
<strong>الطرف الأول:</strong>
{{workspace_formal_name}} والمالك للعلامة التجارية ({{workspace_name}})، وعنوانها {{workspace_city}} - في المملكة
العربية السعودية - الحاملة لسجل تجاري رقم: {{workspace_cr}}، وممثلها النظامي في توقيع هذا العقد السيد/ {{workspace_representative}} -
ويشار إليها فيما بعد بـ الطرف الأول أو باسمها التجاري ({{workspace_name}}).
```

- Signature table header: replace hardcoded `شركة وهج اليمامة للخدمات التسويقية` with `{{workspace_formal_name}}`.
- Re-run `npm run seed:contract-templates` (or equivalent upsert) so the live default template content updates.

## Delta
- New branding fields + 4 tokens in `contracts.data.service.ts`
- Default template hardcodes removed
- Seed script re-run required after HTML edit
