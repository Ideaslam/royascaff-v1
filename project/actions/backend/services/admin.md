# Services — Admin

## Module: Admin

### SVC-041 · AdminService [application, internal, Admin]

- Methods:
  - `getDashboard(adminId): AdminDashboardDto` — pending invites count, recent activity, system stats
  - `updateSystemSettings(adminId, dto): SystemSettingsDto`
  - `getSystemSettings(): SystemSettingsDto`
- Deps: `InvitationsService`, `ActivityLogService`, `RolesService`, system settings repository
- Side effects: none
- Rules: admin-only
