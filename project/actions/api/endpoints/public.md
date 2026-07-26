# Endpoints — Safqa API · Public

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-PUBLIC-01 | GET | /api/public/status | public | — | health + maintenanceMode | MaintenanceService | done | k8s probe |
| EP-PUBLIC-02 | GET | /api/public/proposals/:id/links | public | param: id | public proposal links/content | Proposals* | done | client view |
