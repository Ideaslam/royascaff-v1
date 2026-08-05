# Endpoints — Safqa API · Admin

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-ADMIN-01 | GET | /api/admin | authenticated | — | admin landing | — | done | |
| EP-ADMIN-04 | POST | /api/admin/seed-config | permission:settings.manage | — | seeded | Config seed | done | |
| EP-ADMIN-05 | POST | /api/admin/users | permission:user.create | body | user | admin user create | done | |
| EP-ADMIN-06 | PATCH | /api/admin/users/:uid | permission:user.edit | body | user | admin user patch | done | |
| EP-ADMIN-07 | PATCH | /api/admin/users/:uid/password | permission:user.resetPassword | body | ok | PasswordService | done | |
| EP-ADMIN-08 | DELETE | /api/admin/users/:uid | permission:user.delete | param | ok | admin delete | done | |
| EP-ADMIN-09 | POST | /api/admin/debug-batch | authenticated | body | debug | Claude batches | done | |
| EP-ADMIN-10 | POST | /api/admin/s3-test | authenticated | — | ok | S3Service | done | |
| EP-ADMIN-11 | POST | /api/data/admin/reset | authenticated | — | wipe counts | AdminResetService | done | destructive |

## Removed

| ID | Route | Notes |
|----|-------|-------|
| EP-ADMIN-02 | GET /api/admin/ai-jobs | Retire; observability → AI Requests |
| EP-ADMIN-03 | GET /api/admin/ai-jobs/:id | Retire; keep core `/api/ai-jobs*` for chat |
