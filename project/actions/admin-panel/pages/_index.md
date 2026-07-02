# Pages — Admin Panel — Routing Registry

| Module | File | Pages | Routes |
|--------|------|-------|--------|
| Auth | auth.md | Admin Login, Admin Forgot Password, Admin Reset Password | `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` |
| Overview | overview.md | Overview | `/app/overview` |
| Client Management | clients.md | Clients | `/app/clients` |
| Subscriptions & Plans | subscriptions.md | Subscriptions (tabs: user subscriptions + plans) | `/app/subscriptions` |
| Payments | payments.md | Payments | `/app/payments` |
| Audit Logs | audit.md | Audit Log | `/app/audit` |
| AI Logs | ai-logs.md | AI Logs | `/app/ai-logs` |
| System Settings | settings.md | Admin Profile | `/app/settings/profile` |
| Workspaces & Color Templates | workspaces.md | Workspaces, Color Templates | `/app/workspaces`, `/app/color-templates` |
| Analytics Store | analytics-store.md | OLAP Benchmark | `/app/olap-benchmark` |

---

## Known Frontend Gaps

- Admin Panel `RegisterPage` component exists but is not routed.
- Global system settings not yet wired to a dedicated admin settings page.
- Admin UI for managing DataConnections, Datasets, and SyncRun history (planned for customer portal — not admin panel).
