# System Profile

## Product

- **Name**: Linda
- **Type**: Internal tool
- **Users**: member, project_manager (per-project), sales (global), admin (global)

## Applications

| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `backend` | Linda API | api | `linda-api` | NestJS 11 + TypeScript 5.7 | — | JWT + role guards (implemented); OAuth (deferred) |
| `linda` | Linda | web | `linda-web` | Angular 21.2 (standalone) | CSS tokens (PrimeNG planned) | Bearer JWT via interceptor (implemented) |

## Repositories

| Repo | Role | Location | Branch |
|------|------|----------|--------|
| `linda-api` | Backend API | `linda-api/` (workspace root) | `main` |
| `linda-web` | Web SPA | `linda-web/` (workspace root) | `main` |

Workspace root: `team-tracking/` — `.royascaff/` holds the AI-Control blueprint alongside the app repos.

## Tech Stack

### Current implementation (in repo today)

**Backend** (`linda-api`): NestJS 11 + MongoDB (Mongoose). Global prefix `/api/v1`, JWT auth, role guards, 18 modules under `src/modules/` (auth, users, projects, tasks, wallets, sphere, board, mindmap, offers, comments, notifications, attachments, invitations, roles, admin, webhooks, github, activity-log). ~76/95 endpoints implemented — see `project/status.md`.

**Frontend** (`linda-web`): Angular 21.2 standalone app with auth layout + app shell, feature routes for projects, tasks, board, sphere, mindmap, wallet, admin, etc. Basic CSS tokens in `styles.css`. ~24/29 pages exist as routes but many are **partial** (minimal UI, missing OAuth/password-reset flows) — see `project/status.md`.

### Still planned / deferred

**Backend**: Redis, BullMQ (async email/webhooks), OAuth login endpoints, refresh/logout/password-reset, full integration adapters under `src/integrations/`

**Frontend**: PrimeNG 21, ngx-translate, password-reset + OAuth callback pages, richer UI states per spec

**Graph UI**: Cytoscape.js (Sphere mind-map and network graph); Kanban polish

## Brand Tokens

| Token | Value | Role |
|-------|-------|------|
| `--linda-primary` | `#4F46E5` | Primary actions, links, active nav |
| `--linda-secondary` | `#0F172A` | Headings, sidebar background |
| `--linda-accent` | `#14B8A6` | Sphere graph highlights, success states |
| `--linda-surface` | `#F8FAFC` | Page background |
| `--linda-border` | `#E2E8F0` | Cards, dividers |
| Product name | Linda | App title, emails, meta |

**Current**: CSS custom properties in `linda-web/src/styles.css` (`--linda-primary`, etc.)

## Environments

| Env | API URL | Web URL | Notes |
|-----|---------|---------|-------|
| local | `http://localhost:3000/api/v1` | `http://localhost:4200` | Default dev |
| dev | `https://api-dev.linda.io/api/v1` | `https://app-dev.linda.io` | Shared staging (planned) |
| prod | `https://api.linda.io/api/v1` | `https://app.linda.io` | Production (planned) |

**Config locations**

| App | Config | Status |
|-----|--------|--------|
| Backend | `linda-api/.env` (local), `.env.example` | Created |
| Web | `linda-web/src/environments/environment.ts` | Created |

**Backend port**: `3000` (`process.env.PORT ?? 3000` in `linda-api/src/main.ts`).

**Route prefix**: `/api/v1` — set in `linda-api/src/main.ts`.

**Build status dashboard**: `project/status.md` — re-sync after code changes with `node .royascaff/scripts/sync-build-status.mjs`.

## Integrations

| Provider | Purpose | Notes |
|----------|---------|-------|
| Google OAuth | Social login + account linking | **Deferred** — endpoints not wired |
| GitHub OAuth | Social login + repo linking | **Partial** — settings/project link API exists; spec route drift |
| Cloudflare R2 | Attachment storage | **Partial** — local upload fallback in attachments module |
| Mailjet | Transactional email (invites, password reset) | **Planned** — not integrated |
| Payment Gateway | Future wallet top-ups | **Planned** — v1 = manual top-up only |
| Invitation Delivery (MCP) | Send/manage invite links | **Partial** — invite flow in API; delivery logged in dev |
| Webhooks | Outbound event notifications | **Partial** — admin CRUD; async delivery planned |

All providers isolated behind interfaces where implemented; frontend calls Linda API only.

## System Conventions

- **Currency**: SAR only on all wallets and transactions
- **i18n**: EN primary UI; ngx-translate (planned); AR + RTL planned post-v1
- **Auth**: invite-only registration; admin must approve invitation before one-time link is sent
- **Roles**: global (`admin`, `sales`, `member`) and project-scoped (`project_manager` via `UserRoleAssignment`)
- **Source of truth**: `project/` blueprint; **build state** in `project/status.md` + per-artifact status in `project/actions/**`
- **Third-party isolation**: no direct client calls to R2, Mailjet, GitHub API, or payment providers — all via backend
- **GitHub**: one OAuth application for both authentication and project board repo linking
