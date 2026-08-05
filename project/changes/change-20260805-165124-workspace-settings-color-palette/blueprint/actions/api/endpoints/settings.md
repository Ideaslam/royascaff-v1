# Endpoints — Settings (pack delta)

> Auth unchanged. Prefix `/api`.

| ID | Method | Route | Auth | Input (delta) | Return (delta) | Service | Status | Notes |
|----|--------|-------|------|---------------|----------------|---------|--------|-------|
| EP-SETTINGS-01 | GET | /api/data/settings | authenticated | — | + `colorPalette?`, `colorRoles?`; `defaultColor` = primary when hydrated | SettingsDataService | planned | secrets still masked |
| EP-SETTINGS-02 | PATCH | /api/data/settings | permission:settings.manage | body may include `colorPalette?: string[]`, `colorRoles?: object`, `defaultColor?` | ok | SettingsDataService | planned | max 5; invalid hex → 400; no `logoUrl` |

### PATCH body examples

```json
{
  "colorPalette": ["#6f1926", "#b37d3f", "#868849", "#ffffff", "#1a1a2e"],
  "defaultFont": "Cairo"
}
```

Server stores derived:

```json
{
  "colorPalette": ["#6f1926", "#b37d3f", "#868849", "#ffffff", "#1a1a2e"],
  "colorRoles": {
    "primary": "#6f1926",
    "secondary": "#b37d3f",
    "accent": "#868849",
    "surface": "#ffffff",
    "text": "#1a1a2e"
  },
  "defaultColor": "#6f1926"
}
```

## Delta

- **Extend** GET/PATCH payload; no new routes
- **DTO** whitelist + validators for array/object theme fields
