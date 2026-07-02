# System Profile

## Product

- **Name**: Linda
- **Type**: Internal tool
- **Users**: member, project_manager (per-project), sales (global), admin (global)

## Applications

| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `backend` | Linda API | api | `linda-api` | NestJS 11 + TypeScript 5.7 | — | JWT + role guards (planned); Google/GitHub OAuth (planned) |
| `linda` | Linda | web | `linda-web` | Angular 21.2 (standalone) | PrimeNG 21, ngx-translate (planned) | Bearer JWT via interceptor (planned) |

## Repositories

| Repo | Role | Location | Branch |
|------|------|----------|--------|
| `linda-api` | Backend API | `linda-api/` (workspace root) | `main` |
| `linda-web` | Web SPA | `linda-web/` (workspace root) | `main` |

Workspace root: `team-tracking/` — `.royascaff/` holds the AI-Control blueprint alongside the app repos.

## Tech Stack

### Current scaffold (in repo today)

**Backend** (`linda-api`): NestJS 11 default scaffold — `src/main.ts`, `src/app.module.ts`, `src/app.controller.ts`, Jest tests. No MongoDB, Redis, BullMQ, JWT, or global route prefix yet.

**Frontend** (`linda-web`): Angular 21.2 default scaffold — `src/app/` (standalone), `src/styles.css`, Vitest unit tests. No PrimeNG, ngx-translate, environments, or feature folders yet.

### Target stack (from product spec — to add in Phase 2+)

**Backend**: MongoDB (Mongoose), Redis, BullMQ (email, webhooks, notifications) — target layout: `src/modules/`, `src/integrations/`, `src/common/`

**Frontend**: PrimeNG 21, ngx-translate — target layout: `src/app/core/`, `src/app/features/`, `src/app/shared/`

**Graph UI**: Cytoscape.js (Sphere mind-map and network graph); Kanban via PrimeNG or dedicated drag-drop board component

## Brand Tokens

| Token | Value | Role |
|-------|-------|------|
| `--linda-primary` | `#4F46E5` | Primary actions, links, active nav |
| `--linda-secondary` | `#0F172A` | Headings, sidebar background |
| `--linda-accent` | `#14B8A6` | Sphere graph highlights, success states |
| `--linda-surface` | `#F8FAFC` | Page background |
| `--linda-border` | `#E2E8F0` | Cards, dividers |
| Product name | Linda | App title, emails, meta |

**Current**: default Angular styles in `linda-web/src/styles.css` — token file not created yet.

**Target**: `linda-web/src/styles/_tokens.scss`

## Environments

| Env | API URL | Web URL | Notes |
|-----|---------|---------|-------|
| local | `http://localhost:3000/api/v1` | `http://localhost:4200` | Default dev |
| dev | `https://api-dev.linda.io/api/v1` | `https://app-dev.linda.io` | Shared staging (planned) |
| prod | `https://api.linda.io/api/v1` | `https://app.linda.io` | Production (planned) |

**Config locations**

| App | Config | Status |
|-----|--------|--------|
| Backend | `linda-api/.env` (local), `.env.dev`, `.env.prod` | Not created yet |
| Web | `linda-web/src/environments/environment.{ts,dev,prod}.ts` | Not created yet |

**Backend port**: `3000` (`process.env.PORT ?? 3000` in `linda-api/src/main.ts`).

**Route prefix**: `/api/v1` — **planned** (scaffold serves `GET /` at root; global prefix not set yet).

**Secrets** (backend `.env`, planned): `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `REDIS_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `MASTER_ENCRYPTION_KEY`, `R2_*`, `MAILJET_*`, `ALLOWED_ORIGINS`.

## Integrations

| Provider | Purpose | Notes |
|----------|---------|-------|
| Google OAuth | Social login + account linking | Planned — `src/integrations/oauth/google/` |
| GitHub OAuth | Social login + repo/branch/commit linking | Planned — single OAuth app — `src/integrations/oauth/github/` |
| Cloudflare R2 | Attachment storage | Planned — presigned URLs via API — `src/integrations/storage/` |
| Mailjet | Transactional email (invites, password reset) | Planned — `src/integrations/mail/` |
| Payment Gateway | Future wallet top-ups | Planned — `PaymentProvider` interface; v1 = manual top-up only |
| Invitation Delivery (MCP) | Send/manage invite links | Planned — `InvitationDeliveryProvider` interface |
| Webhooks | Outbound event notifications | Planned — admin-configured endpoints |

All providers isolated behind interfaces; frontend calls Linda API only. None implemented in scaffold yet.

## System Conventions

- **Currency**: SAR only on all wallets and transactions
- **i18n**: EN primary UI; ngx-translate (planned); AR + RTL planned post-v1
- **Auth**: invite-only registration; admin must approve invitation before one-time link is sent
- **Roles**: global (`admin`, `sales`, `member`) and project-scoped (`project_manager` via `UserRoleAssignment`)
- **Source of truth**: `project/` blueprint; code follows specs in `project/actions/<key>/`
- **Third-party isolation**: no direct client calls to R2, Mailjet, GitHub API, or payment providers — all via backend
- **GitHub**: one OAuth application for both authentication and project board repo linking
