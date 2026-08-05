# Endpoints — Admin · change-20260805-130757

> Pack slice: retire AI Jobs admin diagnostics only. Other EP-ADMIN-* unchanged.

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-ADMIN-02 | GET | /api/admin/ai-jobs | — | — | — | — | planned | **removed** |
| EP-ADMIN-03 | GET | /api/admin/ai-jobs/:id | — | — | — | — | planned | **removed** |

## After-state (admin.ai-jobs)

- Controllers must not register `GET ai-jobs` / `GET ai-jobs/:id` under `/api/admin`.
- `AiJobsAdminService` may remain unused or be deleted if nothing else imports it.
- Core chat/job APIs under `/api/ai-jobs*` stay (not admin).

## Delta

- Remove EP-ADMIN-02 and EP-ADMIN-03 from API surface and from main admin endpoints table at merge (mark removed / drop rows).
- FE must stop calling these routes.
