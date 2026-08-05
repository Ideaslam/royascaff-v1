# System Profile

## Product
- **Name**: Roya Safqa (صفقة)
- **Summary**: Deal intelligence platform for Roya Marketing — workspace-scoped sales CRM with AI proposal generation (Claude creative pipeline), clients/services/contracts, and delivery via email (Mailjet) and WhatsApp.
- **Type**: SaaS web app (multi-tenant workspaces)
- **Primary users**: workspace members with role-based permissions (admin / sales roles via Mongo roles+permissions); public proposal link viewers (unauthenticated)

## Applications

| Key | App | Type | Repo | Framework | UI lib | Auth |
|-----|-----|------|------|-----------|--------|------|
| `api` | Safqa API | api | `roya-sales-ai-api-v2` | NestJS 11 (Node 22) | — | JWT Bearer + workspace guard + permission mixin; bcrypt passwords |
| `web` | Safqa Web | web | `roya-sales-ai-frontend` | Angular 18 | PrimeNG 18 (Aura + RoyaPreset) | Same-backend JWT (localStorage session + refresh) |

## Repositories

| Repo | Role | Location | Branch |
|------|------|----------|--------|
| `roya-sales-ai-api-v2` | NestJS API (business logic, AI jobs, persistence) | `../roya-sales-ai-api-v2` (workspace sibling of `royascaff-v1`) | `dev` |
| `roya-sales-ai-frontend` | Angular SPA (Safqa UI) | `../roya-sales-ai-frontend` | `dev` |
| `royascaff-v1` | AI-Control engine + generated blueprint (`project/`) | `.` (this folder) | ❓ |

## Tech Stack

**Backend**: TypeScript, NestJS 11, Express platform, Mongoose 8 (custom persistence layer — not `@nestjs/mongoose`), MongoDB, Redis/ioredis (cache + BullMQ), custom Mongo job queue (`setInterval` poller for v2), BullMQ (Pipeline v3), handlebars (proposal templates), puppeteer-core (PDF), pdf-lib (PDF merge), class-validator/class-transformer, axios, ajv, bcrypt, @nestjs/jwt + jsonwebtoken (no Passport). Global prefix: `api`.

**Frontend**: Angular 18 standalone, PrimeNG 18 + @primeng/themes (Aura/RoyaPreset), primeicons, ngx-translate (en/ar, RTL), Chart.js + ng2-charts, xlsx; jspdf/html2canvas/pdfjs-dist present in package.json (❓ little/no `src/` usage yet).

**Source layout (API)**: `src/modules/` (HTTP), `src/services/`, `src/models/`, `src/dtos/`, `src/infrastructure/` (cache, claude, persistence, settings), `src/creative-pipeline/`, `src/pipeline-v3/`, `src/common/`, `src/config/environment.ts`; design-first templates at repo `templates/`.

**Source layout (Web)**: `src/app/core/`, `layout/`, `pages/`, `shared/`, `environments/`.

**Async / jobs**: (1) Legacy: Mongo-backed job queue + Claude Message Batches polling. (2) Pipeline v3: BullMQ on Redis (`pipeline.*` queues); Mongo holds business truth. Redis also used for cache.

## Brand Tokens

| Token | Value | Role |
|-------|-------|------|
| Product name | Roya Safqa / رويا صفقة | UI + `index.html` title |
| Tagline | Deal intelligence platform / منصة ذكاء الصفقات | Auth/marketing copy |
| Logo | `assets/logo.svg` (`BRAND.logoPath`) | Favicon + chrome |
| `--roya-blue-light` / `BRAND.colors.light` | `#BCE5F8` | Brand scale |
| Primary / `BRAND.colors.primary` | `#47B5E6` | Primary accent |
| Mid / `BRAND.colors.mid` | `#2C8DBE` | Brand scale |
| Dark / `BRAND.colors.dark` | `#1B5D85` | Brand scale |
| Deep / `BRAND.colors.deep` | `#114261` | Auth button / deep chrome |
| Darker / `BRAND.colors.darker` | `#0D2F47` | Brand scale |
| Typography | Cairo, Tajawal, IBM Plex Sans Arabic | Google Fonts (Arabic-first) |
| Theme | PrimeNG `RoyaPreset` + `.app-dark` | Light/dark toggle (`app-theme`) |

Defined in: `web` → `core/constants/brand.constants.ts`, `core/theme/roya.preset.ts`, `styles.css`.

## Environments

| Env | API (`apiBaseUrl`) | Notes |
|-----|--------------------|-------|
| local | `http://localhost:3000` | `ng serve` defaultConfiguration `local`; API `PORT` from env |
| development | `https://sales-api.vnod.net` | Angular `development` fileReplacements |
| production | `https://sales-api.roya.marketing` | Angular `production`; k8s/Jenkins deploy |

**API config**: `dotenv` + `src/config/environment.ts` (not Nest ConfigModule). Committed template: `roya-sales-ai-api-v2/.env.example` (copy → `.env`; README documents setup).

**Key env vars (names only)**: `PORT`, `NODE_ENV`, `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `APP_URL`, `ALLOWED_ORIGINS`, `MONGODB_URI`, `REDIS_URL`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_S3_ENDPOINT`, `AWS_S3_PUBLIC_URL`, `AWS_S3_BASE_FOLDER`, `AWS_S3_APP_FOLDER`, `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAILJET_FROM_EMAIL`, `MAILJET_FROM_NAME`, `META_WHATSAPP_*`, `SETTINGS_ENCRYPTION_KEY`, `CREATIVE_SECTION_MAX_TOKENS`, `CREATIVE_SECTION_TEMPERATURE`, `PIPELINE_WORKER_CONCURRENCY`, `PUPPETEER_EXECUTABLE_PATH` / `CHROME_PATH`.

**Claude API key**: stored encrypted in workspace settings (not env).

**Deploy**: Docker (`Dockerfile.build`, Node 22 Alpine, port 8080), Jenkins (`Jenkinsfile.dev` / `.production`), k8s (`k8s.deploy`), health `GET /api/public/status`.

**Web → API**: no proxy; browser calls `environment.apiBaseUrl` directly (CORS via `ALLOWED_ORIGINS`).

## Integrations

| Provider | Purpose | Notes |
|----------|---------|-------|
| Anthropic Claude | AI proposal / creative pipeline | `@anthropic-ai/sdk`; key from workspace settings (encrypted); OpenAI/Gemini stubs/legacy |
| Cloudflare R2 (S3-compatible) | Proposal HTML / file storage | AWS SDK v3; endpoint via `AWS_S3_*` |
| Redis | Cache | ioredis; not job queue |
| Mailjet | Transactional email | HTTP via axios (verify, reset, proposal send) |
| Meta WhatsApp Cloud API | Proposal messaging | `graph.facebook.com` |
| Font Awesome / Google Fonts | Frontend assets | CDN in `index.html` |

## System Conventions

- **Product branding**: User-facing name is **Roya Safqa**; API package/docs still say “ROYA Sales AI” / `roya.marketing` — treat as one product.
- **i18n**: `en` + `ar`; Arabic RTL (`dir="rtl"`); default lang code `en` with browser/localStorage override; `index.html` boots `lang="ar" dir="rtl"`.
- **Multi-tenancy**: Workspace-scoped JWT + `WorkspaceAuthGuard` / tenant context; permissions via role keys in Mongo.
- **API surface**: All HTTP under global prefix `/api`.
- **Frontend isolation**: SPA talks only to configured `apiBaseUrl`; no direct third-party SDK calls for Claude/Mailjet/WhatsApp/S3.
- **Blueprint root**: `royascaff-v1/project/` (beside `engine/`); app repos are workspace siblings.
- **Source of truth for stack/brand**: this file only — never `engine/`.
