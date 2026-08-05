# Blueprint Index — change-20260805-165124-workspace-settings-color-palette

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact (workspace Theme palette → colorRoles + DNA fallback).

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| data-model | `plan/data-model-delta.md` | settings.colorPalette / colorRoles; DNA precedence | done | 1/1 | persist workspace roles |
| service | `actions/api/services/settings.md` | SVC-SETTINGS-01 hydrate/patch | done | 1/1 | normalize + sync defaultColor |
| service | `actions/api/services/branding-resolve.md` | resolveBrandingColors + DNA skeleton | done | 1/1 | workspace before Roya |
| endpoint | `actions/api/endpoints/settings.md` | EP-SETTINGS-01/02 payload | done | 1/1 | GET/PATCH theme fields |
| page | `actions/web/pages/settings.md` | PG-SETTINGS-01 Theme palette | done | 1/1 | app-color-palette max 5 |

**Pack Done/Total**: 5/5

## Out of pack

- Project create/edit palette UX (already done)
- New HTTP routes / permissions
- Forced seed migration job for all workspaces
- Template CSS changes
