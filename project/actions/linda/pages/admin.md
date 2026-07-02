# Pages — Admin

## Module: Admin

### Admin Dashboard Page

- Route: `/admin`
- Components: `AdminDashboardComponent`, `PendingInvitesWidgetComponent`, `SystemStatsComponent`
- Service: `AdminApiService` → EP-109; `InvitationsApiService` → EP-015
- Guard: `AdminGuard`
- UI states: loading cards; links to invitation queue, roles, webhooks, settings

### Role Management Page

- Route: `/admin/roles`
- Components: `RoleAssignmentsTableComponent`, `AssignGlobalRoleDialogComponent`, `AssignProjectManagerDialogComponent`
- Service: `RolesApiService` → EP-034, EP-035, EP-036, EP-037
- Guard: `AdminGuard`
- Notes: RULE-016 admin-only assignment

### System Settings Page

- Route: `/admin/settings`
- Components: `SystemSettingsFormComponent`
- Service: `AdminApiService` → EP-110, EP-111
- Guard: `AdminGuard`

### Webhooks Management Page

- Route: `/admin/webhooks`
- Components: `WebhooksTableComponent`, `WebhookFormDialogComponent`
- Service: `WebhooksApiService` → EP-113, EP-114, EP-115, EP-116
- Guard: `AdminGuard`
- Notes: RULE-013 outbound event config
