# Pages — Admin Panel — Routing Registry

| Module | File | Pages | Routes |
|--------|------|-------|--------|
| Auth | auth.md | Admin Login, Admin Forgot Password, Admin Reset Password | `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` |
| Overview | overview.md | Overview | `/app/overview` |
| Client Management | clients.md | Clients | `/app/clients` |
| Subscriptions | subscriptions.md | Workspace subscriptions and lifecycle | `/app/subscriptions` |
| Subscription Packages | packages.md | Immutable entitlement Package catalog; Package detail *(change-082)* | `/app/packages`, `/app/packages/:id` |
| Subscription Plans | plans.md | Plan catalog; Plan detail *(change-082)* | `/app/plans`, `/app/plans/:id` |
| Billing & Payments | payments.md | Invoices and payment attempts | `/app/payments` |
| Audit Logs | audit.md | Audit Log | `/app/audit` |
| AI Logs | ai-logs.md | AI Logs | `/app/ai-logs` |
| System Settings | settings.md | Admin Profile | `/app/settings/profile` |
| Workspaces & Color Templates | workspaces.md | Workspaces, Color Templates | `/app/workspaces`, `/app/color-templates` |
| Analytics Store | analytics-store.md | OLAP Benchmark | `/app/olap-benchmark` |
| Template Catalog *(change-049)* | template-catalog.md | Template Catalog (industries → fields → templates) | `/app/template-catalog` |
| Migrations *(change-081)* | migrations.md | Migrations (read-only status, dry-run report, errors, rollback state) | `/app/migrations` |
| Data Source Types *(change-048, change-072)* | data-source-types.md | Data Source Types (titles, logo, instructions, Active, Coming soon) | `/app/data-source-types` |

**Navigation** *(change-082)*: the sidebar groups items under headers — Overview · **Customers** (Workspaces, Users, Clients) · **Billing** (Subscriptions, Packages, Plans, Payments) · **Platform** (Data source types, Migrations, OLAP benchmark) · **Monitoring** (Audit, AI logs) · Settings. Collapse chevrons and drawers/toasts follow the reading direction (RTL in Arabic).

---

## Known Frontend Gaps

- Admin Panel `RegisterPage` component exists but is not routed.
- Global system settings not yet wired to a dedicated admin settings page.
- Admin UI for managing DataConnections, Datasets, and SyncRun history (planned for customer portal — not admin panel).
