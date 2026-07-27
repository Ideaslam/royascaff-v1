# Blueprint Index — change-021-project-image-purpose-pitch-branding

> Pack owns only the artifacts below. Status: `planned` · `partial` · `done` · `deferred`.
> Source: change-request + impact (workspace_* / client_* template vars; remove Safqa hardcodes).

| Layer | File (under blueprint/) | IDs / Names | Status | Done/Total | Purpose |
|-------|-------------------------|-------------|--------|-----------|---------|
| plan | `plan/data-model.md` | projects.images.purpose | done | 1/1 | purpose enum on images[] |
| plan | `plan/modules.md` | Image upload + pitch branding | done | 1/1 | feature slice |
| service | `actions/api/services/projects.md` | SVC-PROJECTS-03 + DNA | done | 1/1 | upload/patch purpose |
| endpoint | `actions/api/endpoints/projects.md` | EP-PROJECTS-07,11 | done | 1/1 | multipart + PATCH images |
| service | `actions/api/services/pipeline-sections-engine.md` | SVC-PIPE-S3-05 | done | 1/1 | assemble Settings branding |
| service | `actions/api/services/templates.md` | SVC-TPL-02 + HBS | done | 1/1 | root vars + cover/footer/marks |
| page | `actions/web/pages/projects.md` | PG-PROJECTS-02 | done | 1/1 | purpose UI + FE upload |

**Pack Done/Total**: 7/7

## Out of pack

- Settings logo upload (change-020)
- Image delete endpoint
- Non–pitch-landscape templates
- Public proposal web chrome
