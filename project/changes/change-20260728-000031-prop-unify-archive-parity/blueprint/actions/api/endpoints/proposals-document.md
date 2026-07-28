# Endpoints — Proposals document parity · change-20260728-000031

Status: **planned** (behavior only; routes unchanged)

| ID | Method | Route | Change |
|----|--------|-------|--------|
| EP-PROPOSALS-01 | GET | `/api/data/proposals` | List rows include `pipelineVersion`, `projectId`, `language` via projection |
| EP-PROPOSALS-12 | GET | `/api/proposals/document-html` | Technical resolve falls back to `renderedByLang[lang].htmlUrl` when URL maps empty |
| EP-PROPOSALS-10 | PUT | `/api/proposals/:id/technical` | After upload, sync `renderedByLang[lang].htmlUrl` for v3 / when map present |
| EP-PROPOSALS-11 | PUT | `/api/proposals/:id/financial` | Unchanged contract; still updates financial URL maps |

Auth / permissions: unchanged.

## Delta

- No new routes
- Resolve + patch behavior as in `proposals-document` service blueprint
