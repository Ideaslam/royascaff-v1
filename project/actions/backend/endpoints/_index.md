# Endpoints — Routing Registry

| Module | File | IDs | Count |
|--------|------|-----|-------|
| Auth | auth.md | EP-AUTH-01..08 | 8 |
| Users | users.md | EP-USR-01..09 | 9 |
| Projects | projects.md | EP-PROJ-01..05 | 5 |
| Data (CSV Management) | data.md | EP-DATA-01..08 | 8 |
| Dashboards | dashboards.md | EP-DASH-01..13 | 13 |
| Sharing | sharing.md | EP-SHARE-01..04 | 4 |
| Export | export.md | EP-EXPORT-01..03 | 3 |
| Notifications | notifications.md | EP-NOTIF-01..04 | 4 |
| Subscriptions | subscriptions.md | EP-SUB-01..21 | 21 |
| Payments | payments.md | EP-PAY-01..07 | 7 |
| Audit | audit.md | EP-AUDIT-01 | 1 |
| Settings | settings.md | EP-SET-01..02 | 2 |
| Admin | admin.md | EP-ADMIN-01..04 | 4 |
| AI Logs | ai-logs.md | EP-AILOG-01..03 | 3 |
| Workspace | workspace.md | EP-WS-01..21 | 21 |
| Color Templates | color-templates.md | EP-CTPL-01..05 | 5 |
| Analytics Store (Admin Benchmark) | analytics-store.md | EP-AS-01..02 | 2 |
| **Total** | | | **120** |

---

## Known Gaps

- **[EP-AUTH-03] Auth OAuth callback is a stub** — `POST /api/v1/auth/oauth/callback` accepts the payload but only returns a static message; not wired to `AuthService.oauthLogin`.
- **[EP-EXPORT-01] PDF export has no worker** — `POST /api/v1/dashboards/:id/export/pdf` queues a job, but no worker processes PDF export jobs yet; export never completes.
