# Endpoints — Safqa API · AI

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-AI-01 | POST | /api/ai/claude | authenticated | body | AI text | ClaudeService | done | |
| EP-AI-02 | POST | /api/ai/openai | authenticated | body | error | stub | partial | not configured |
| EP-AI-03 | POST | /api/ai/chat | authenticated | body | chat result | Claude* | done | |
| EP-AI-04 | POST | /api/ai/test | authenticated | body | test result | Claude* | done | diagnostics |
