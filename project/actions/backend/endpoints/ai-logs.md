## Module: AI Logs

`@Controller('ai-logs')` · class-level `@Roles(ADMIN)`

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-AILOG-01 | GET | /api/v1/ai-logs | JWT+admin | query: provider?, model?, status?, from?, to?, page?, limit? | 200 `Paginated<AiLogDto>` | SVC-AILOG.findPaginated() | |
| EP-AILOG-02 | GET | /api/v1/ai-logs/cost-summary | JWT+admin | query: from?, to? | 200 `AiCostSummaryDto` | SVC-AILOG.costSummary() | |
| EP-AILOG-03 | GET | /api/v1/ai-logs/:id | JWT+admin | `:id` param | 200 `AiLogDto` | SVC-AILOG.findById() | 404 if missing |
