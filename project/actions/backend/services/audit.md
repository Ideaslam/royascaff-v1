## Module: Audit

### SVC-AUDIT · AuditLogService [internal, application, Audit]
Global fire-and-forget audit logger used by nearly every write service.

**Methods:**
- `log(dto: CreateAuditLogDto): Promise<void>` — writes audit entry; errors caught and ignored

**Deps:** AuditLogRepository
**Side effects:** single DB write per call (error-swallowed)
**Rules:** Audit writes are best-effort and must never propagate errors to callers · Globally available (no per-module import needed)
