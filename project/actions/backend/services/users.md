## Module: Users

### SVC-USR · UsersService [internal, domain, Users]
Self-service profile/password management plus admin user CRUD and account state changes.

**Methods:**
- `updateProfile(userId: string, dto: UpdateProfileDto)` — updates own profile, returns sanitized user
- `changePassword(userId: string, dto: ChangePasswordDto)` — verifies current password, sets new hash, revokes sessions (blocked for OAuth-only accounts)
- `listUsers(filters): Promise<PaginatedResponseDto>` — paginated admin list
- `getUserById(id: string)` — fetch one user (admin), 404 if missing
- `createUser(dto: CreateUserDto, actorId?, ip?)` — admin-creates user with chosen role, audits USER_REGISTER
- `updateUser(id: string, dto: UpdateUserDto, actorId?, ip?)` — admin-updates name/email/role/isActive/password, audits USER_UPDATE
- `deleteUser(id: string, actorId?, ip?)` — hard-deletes user, audits USER_DELETE
- `suspendUser(id, actorId?, ip?)` — sets isActive=false, revokes refreshTokenHash, audits USER_DEACTIVATE (change-004)
- `reactivateUser(id, actorId?, ip?)` — sets isActive=true, audits USER_ACTIVATE
- `autoSuspendForUnpaidInvoices(userId, actorId?, ip?)` — internal: called when 2 consecutive unpaid payments detected, audits USER_AUTO_SUSPEND (change-004)

**Deps:** UserRepository · AuditLogService
**Side effects:** bcrypt hashing · audit writes · hard delete
**Rules:** Email stored lowercased, duplicate throws Conflict · changePassword requires matching current password, rejected for OAuth-only · Password changes clear refresh-token hash (force re-login) · Never returns passwordHash/refreshTokenHash/reset fields (safeUser sanitization)
