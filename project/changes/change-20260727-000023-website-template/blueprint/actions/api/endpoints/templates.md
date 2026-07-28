# Endpoints — Templates (change-20260727-000023 after-state)

> Touches: `templates.controller.ts` fixture route only. `GET` list unchanged.

## Delta

- **Modify** EP-TPL-01 — accept optional `templateKey` in body; default `pitch-landscape`

---

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TPL-01 | POST | /api/data/templates/pitch-landscape/fixture-render | permission:`settings.manage` | `body: { language?: 'ar'\|'en', format?: 'html'\|'pdf', templateKey?: 'pitch-landscape'\|'pitch-landscape-formal'\|'website-template' }` | `200` `{ language, html, templateKey }` or PDF stream | TemplateRenderService | planned | route path kept for compat; `templateKey` selects catalog + disk |
| EP-TPL-02 | GET | /api/data/templates | authenticated | — | slim gallery items | TemplatesRepository.listActive | done | must include website after seed — no code change |

### EP-TPL-01 rules

- Invalid / inactive `templateKey` → 400 with clear message
- PDF filename includes template key + language
- No AI
