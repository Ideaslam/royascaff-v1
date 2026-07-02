# System Profile

## Product
- **Name**: Roya AI Dynamo  **Type**: SaaS  **Users**: workspace_owner, workspace_member, admin

## Applications
| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `backend` | API | api | `roya-ai-dynamo-api` | NestJS | — | JWT (access + refresh) |
| `customer-portal` | Customer Portal | web | `roya-ai-dynamo-frontend` | Angular | — | same-backend JWT |
| `admin-panel` | Admin Panel | web | `roya-ai-dynamo-frontend-admin` | Angular | — | same-backend JWT, role:admin only |

## Repositories
| Repo | Role | Location |
|------|------|----------|
| `roya-ai-dynamo-api` | Backend API | `roya-ai-dynamo-api/` |
| `roya-ai-dynamo-frontend` | Customer Portal | `roya-ai-dynamo-frontend/` |
| `roya-ai-dynamo-frontend-admin` | Admin Panel | `roya-ai-dynamo-frontend-admin/` |

## Tech Stack
**Backend**: TypeScript + NestJS, MongoDB (app data), BullMQ (async jobs), Redis (cache), Cloudflare R2 (file storage), ClickHouse / BigQuery (OLAP datasets — pluggable via strategy)
**Frontend**: Angular (customer portal + admin panel)
**AI**: Anthropic Claude (pluggable provider interface)
**Auth**: JWT with access + refresh tokens; Google + Microsoft OAuth

## Environments
- Config: `roya-ai-dynamo-api/src/config/config.ts` + `env.validation.ts`
- Secrets via environment variables (never committed)
- Three envs: `development`, `test`, `production`

## Integrations
| Provider | Purpose | Notes |
|----------|---------|-------|
| Anthropic Claude | AI generation (dashboards, mapping, clean-data) | pluggable via `AiProvider` interface |
| ClickHouse | OLAP dataset storage + analytical queries | pluggable via `OlapEngine` strategy |
| BigQuery | OLAP dataset storage + analytical queries | pluggable via `OlapEngine` strategy |
| Cloudflare R2 | File storage (CSV uploads, exports) | `StorageProvider` interface |
| Mailjet | Transactional email | `MailProvider` interface |
| Payup | Payments / subscriptions | `PaymentProvider` interface |
| Google OAuth | Social login | via Passport strategy |
| Microsoft OAuth | Social login | via Passport strategy |
| Redis | Result cache + job queue broker | IoRedis |

## System Conventions
- All API routes prefixed `/api/v1/`
- Response envelope: `{ success, data, message }` via `ResponseTransformInterceptor`
- Pagination: `{ items, total, page, limit }`
- Multi-tenancy: workspace-scoped Mongo collections (`ws_{slug}_*`); OLAP tables `ds_{workspaceSlug}_{datasetId}`
- Auth: `JwtAuthGuard` global; `@Roles(UserRole.ADMIN)` for admin-only routes
- Source of truth for planning: `project/` (this folder); code must match plan at all times
