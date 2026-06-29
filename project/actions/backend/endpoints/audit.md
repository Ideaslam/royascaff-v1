## Module: Audit

`@Controller('audit')` · class-level `@Roles(ADMIN)`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AUDIT-01 | GET | /api/v1/audit | JWT+admin | query: userId?, action?, entityType?, entityId?, from?, to?, page?, limit? | 200 `Paginated<AuditLogDto>` | SVC-AUDIT.findPaginated() | Read-only; no write/update/delete endpoints |
