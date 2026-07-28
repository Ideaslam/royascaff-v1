# Endpoints — Templates (change-037 after-state)

> Touches: `templates.controller.ts` fixture allowlist only. `GET` list unchanged.

## Delta

- **Modify** EP-TPL-01 — allow `templateKey: "roya-presentation"`

---

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TPL-01 | POST | /api/data/templates/pitch-landscape/fixture-render | permission:`settings.manage` | `body: { language?, format?, templateKey?: 'pitch-landscape'\|'pitch-landscape-formal'\|'website-template'\|'roya-presentation' }` | `200` html or PDF | TemplateRenderService | planned | add key to `FIXTURE_TEMPLATE_KEYS` |
| EP-TPL-02 | GET | /api/data/templates | authenticated | — | slim gallery items | TemplatesRepository.listActive | done | includes roya-presentation after seed — no code change |

### EP-TPL-01 rules

- Invalid / inactive `templateKey` → 400 with clear message
- PDF filename includes template key + language
- No AI
