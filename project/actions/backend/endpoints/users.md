## Module: Users

`@Controller('users')`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-USR-01 | PATCH | /api/v1/users/me | JWT | `UpdateProfileDto` { name?, languagePreference?, avatarUrl? } | 200 `UserProfileDto` | SVC-USR.updateProfile() | Cannot change own role |
| EP-USR-02 | PATCH | /api/v1/users/me/password | JWT | `ChangePasswordDto` { currentPassword, newPassword } | 200 `{ message }` | SVC-USR.changePassword() | |
| EP-USR-03 | GET | /api/v1/users | JWT+admin | query: page, limit, search, role, isActive | 200 `Paginated<UserListItemDto>` | SVC-USR.adminList() | Never returns passwordHash or refreshTokenHash |
| EP-USR-04 | GET | /api/v1/users/:id | JWT+admin | `:id` param | 200 `UserDetailsDto` | SVC-USR.adminGet() | |
| EP-USR-05 | POST | /api/v1/users | JWT+admin | `CreateUserDto` { name, email, password, role } | 201 `UserDetailsDto` | SVC-USR.adminCreate() | role enum: admin, editor, viewer |
| EP-USR-06 | PUT | /api/v1/users/:id | JWT+admin | `:id` · `UpdateUserDto` { name?, email?, role?, isActive?, newPassword? } | 200 `UserDetailsDto` | SVC-USR.adminUpdate() | |
| EP-USR-07 | DELETE | /api/v1/users/:id | JWT+admin | `:id` param | 204 | SVC-USR.adminDelete() | Cascades owned data |
| EP-USR-08 | PATCH | /api/v1/users/:id/suspend | JWT+admin | `:id` param | 200 `UserDetailsDto` | SVC-USR.suspendUser() | (change-004) |
| EP-USR-09 | PATCH | /api/v1/users/:id/reactivate | JWT+admin | `:id` param | 200 `UserDetailsDto` | SVC-USR.reactivateUser() | |

**Notes:**
- [EP-USR-01] `languagePreference` enum: en, ar.
- [EP-USR-08] **(change-004):** Sets `isActive=false`, revokes `refreshTokenHash`, audits `USER_DEACTIVATE`. Login returns "Account is suspended". JWT validation returns `403` with `ACCOUNT_SUSPENDED` code (not 401). Auto-suspend (two consecutive unpaid payments) also calls this method.
- [EP-USR-09] Sets `isActive=true`, audits `USER_ACTIVATE`.
