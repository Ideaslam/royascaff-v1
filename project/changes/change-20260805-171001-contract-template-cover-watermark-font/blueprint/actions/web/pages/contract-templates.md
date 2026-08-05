# Pages Delta — Safqa Web · Contract Templates (change-20260805-171001)

### Contract Template Edit `PG-CONTRACT-TEMPLATES-02`
- Status: done (delta)
- `contract-template-edit.component.ts` `TOKEN_GROUPS`: new group **"Design / Branding"** (`contractTemplates.tokenGroups.design`) added alongside Workspace / Client / Contract / Content, with tokens: `document_font_link`, `document_font`, `brand_primary`, `brand_secondary`, `brand_accent`, `brand_surface`, `brand_text`. `contract_total` is added to the existing **Content** group (alongside `services`/`financial_table`) since it's a financial-summary value, not a design token. Same click-to-insert-at-caret behavior as existing token chips; no other editor behavior change (still plain textarea, no live preview).

## Delta
- i18n: new key `contractTemplates.tokenGroups.design` in `assets/i18n/ar.json` + `en.json` (e.g. AR: "التصميم / الهوية", EN: "Design / Branding").
- No route, guard, or service change.
