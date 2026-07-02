# Endpoints — Admin

## Module: Admin

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-109 | GET | /admin/dashboard | role:admin | — | `200 AdminDashboardDto` | `AdminService.getDashboard()` | — |
| EP-110 | GET | /admin/settings | role:admin | — | `200 SystemSettingsDto` | `AdminService.getSystemSettings()` | — |
| EP-111 | PATCH | /admin/settings | role:admin | `body: UpdateSystemSettingsDto` | `200 SystemSettingsDto` | `AdminService.updateSystemSettings()` | — |
