# Endpoints — Safqa API · Templates (Phase 5 thin)

## Delta

- **Create** EP-TPL-02 list active
- EP-TPL-01 fixture-render unchanged

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-TPL-02 | GET | /api/data/templates | authenticated (`projects.view` or any logged-in) | optional `?status=active` | `[{ key, version, name, orientation, theme?, previewImageUrl? }]` | TemplatesRepository.listActive | planned | gallery; no disk HTML |

## Response shape (after-state)

```jsonc
{
  "items": [
    {
      "key": "pitch-landscape",
      "version": 1,
      "status": "active",
      "name": { "ar": "…", "en": "…" },
      "orientation": "landscape",
      "type": "presentation",
      "assets": { "previewImageUrl": null }
    }
  ]
}
```
