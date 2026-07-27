# Blueprint Index — change-022-project-color-palette

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact (palette → DNA branding → pitch themeOverrides).

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/data-model.md` | projects.colorPalette; dna.branding.colors | done | 1/1 | persist palette + DNA colors |
| plan | `plan/modules.md` | Color palette + DNA theme | done | 1/1 | feature slice |
| service | `actions/api/services/projects.md` | SVC-PROJECTS create/patch + DNA inject | done | 1/1 | validate/persist + branding resolve |
| service | `actions/api/services/pipeline-assemble.md` | SVC-PIPE-S3-05 theme map | done | 1/1 | colors → themeOverrides |
| endpoint | `actions/api/endpoints/projects.md` | EP-PROJECTS-01,04 | done | 1/1 | create/patch I/O |
| page | `actions/web/pages/projects.md` | CMP-PALETTE-01; PG-02/03/04 | done | 1/1 | Branding card + badge |

**Pack Done/Total**: 6/6

## Out of pack

- change-021 image purpose / client_logo (hard dependency — merged)
- Creative pipeline 3-color picker migration
- Shareable palette URLs
- Non–pitch-landscape templates
- New permissions / new HTTP routes
