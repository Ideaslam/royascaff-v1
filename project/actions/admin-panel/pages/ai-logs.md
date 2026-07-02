## Module: AI Logs

### AI Logs Page
- Route: `/app/ai-logs`
- Components: AiLogsPage (cost summary cards/chart, logs table with provider/model/tokens/cost/duration/status, detail drawer)
- Service: AiLogsService.getCostSummary() → `GET /api/v1/ai-logs/cost-summary`; AiLogsService.list() → `GET /api/v1/ai-logs`; AiLogsService.getDetail() → `GET /api/v1/ai-logs/:id`
- Guard: authGuard + adminGuard
