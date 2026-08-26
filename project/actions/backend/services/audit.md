## Module: Audit

### SVC-AUDIT · AuditLogService [internal, application, Audit]
Global immutable audit logger. Ordinary product telemetry may be best-effort; financial and subscription lifecycle events are durable.

**Methods:**
- `log(dto: CreateAuditLogDto): Promise<void>` — writes audit entry; errors caught and ignored
- `buildLifecycleEvent(dto): AuditEvent` — creates actor/source/correlation/before/after/invoice/period event persisted in the caller's transaction/outbox

**Deps:** AuditLogRepository
**Side effects:** ordinary audit write or caller-owned transactional/outbox write
**Rules:** ordinary non-financial audit may not block the primary action · financial/lifecycle state must not commit without its immutable audit/outbox event · no update/delete API · globally available

Package/Plan create, draft update, clone, publish, unpublish, archive, retirement schedule/reschedule/cancel/effect, usage-period advance, and retirement notification delivery record explicit actions with platform-admin/system actor, required reason where user-triggered, correlation/idempotency key, and before/after version identity.
