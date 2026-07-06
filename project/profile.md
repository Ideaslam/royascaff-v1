# System Profile

> The single home for this system's concrete facts: applications, repositories, tech stack, brand
> tokens, environments, and integrations. The **engine** (`../engine/`) is generic and refers to the
> values here — it never hardcodes them. When an app, repo, stack, brand color, or provider changes,
> update it **here**, not in the engine.

---

## Product

- **Name**: Roya AI Dynamo
- **Summary**: An AI-powered SaaS platform that turns uploaded CSV files into custom, interactive
  dashboards automatically — no manual configuration. The system analyzes data types and structure and
  generates meaningful visualizations in one step.
- **Type**: SaaS responsive web application (desktop, tablet, mobile views).
- **Primary users**: Business users, data analysts, team managers, and administrators.

---

## Applications

| Key | App | Type | Repo | Framework | UI library | Auth strategy |
|-----|-----|------|------|-----------|-----------|---------------|
| `customer-portal` | Customer Portal | web | `roya-ai-dynamo-frontend` | Angular 21 (standalone) | PrimeNG 21 + PrimeIcons | same-backend JWT |
| `admin-panel` | Admin Panel | web (admin) | `roya-ai-dynamo-frontend-admin` | Angular 21 (standalone) | PrimeNG 21 + PrimeIcons | same-backend JWT + admin role |
| `backend` | API | api | `roya-ai-dynamo-api` | NestJS (Node + TypeScript) | — | JWT (issuer) |
| `landing-site` | Marketing Landing | web (static) | `roya-dynamo-landing` | HTML + CSS + JS | Tailwind CSS (CDN) | none (public) |

`target-app` values used in change requests resolve against this table. `all-apps` = all four repos.

### App key ↔ action specs

The **Key** is also the folder name under `project/actions/`. Each app's specs live in its own folder, by type:

| Type value | Action folder | Spec files |
|------------|---------------|-----------|
| `api` | `project/actions/<key>/` | `services.md`, `endpoints.md` |
| `web` | `project/actions/<key>/` | `pages.md` |
| `mobile-ios` / `mobile-android` / `mobile-cross-platform` | `project/actions/<key>/` | `views.md` |

So `backend` → `project/actions/backend/{services,endpoints}.md`, `customer-portal` → `project/actions/customer-portal/pages.md`, etc. Adding a new app means adding a row here **and** creating its folder under `project/actions/`.

### Adding a mobile app (supported)

A mobile app is a first-class application in this system. To add one, append a row to the table above with a `mobile-*` **Type**, its own **Key** (e.g. `customer-mobile`), repo, framework (e.g. React Native + Expo, Flutter), and UI library (the platform's native component library). Its screens are specified in `project/actions/<key>/views.md` (see `engine/templates/views-template.md`). Mobile apps reuse the shared `backend` API — no duplicated business logic — and follow the same API-only traffic rule (no direct external provider calls). *No mobile app exists in the repos yet; the structure is ready for one.*

---

## Repositories

| Repo | Role | Location (workspace root) | Active branch |
|------|------|---------------------------|---------------|
| `roya-ai-dynamo-api` | Backend API, business logic, jobs | `../../roya-ai-dynamo-api` | `subscription` |
| `roya-ai-dynamo-frontend` | Customer-facing web app | `../../roya-ai-dynamo-frontend` | `subscription` |
| `roya-ai-dynamo-frontend-admin` | Admin web app | `../../roya-ai-dynamo-frontend-admin` | `subscription` |
| `roya-dynamo-landing` | Marketing landing page (static) | `../../roya-dynamo-landing` | `main` |

---

## Tech Stack

**Backend (`roya-ai-dynamo-api`)**
- Node.js + NestJS, TypeScript, modular architecture with DI, RESTful API
- MongoDB via Mongoose ODM (document store; per-CSV collections for dynamic data rows)
- Redis-backed background jobs via Bull/BullMQ
- Layered: controller → service → repository (per `../engine/rules/backend-rule.md`)
- Source layout: `src/{modules, common, config, database, integrations}`

**Landing site (`roya-dynamo-landing`)**
- Static HTML/CSS/JS — no build step required for v1
- Tailwind CSS via CDN; custom CSS for brand tokens
- Navigation URLs via `js/config.js` (`registerUrl`, `loginUrl`)
- Deployable to any static host (Cloudflare Pages, S3, nginx)

**Frontend (both Angular apps)**
- Angular 21, standalone components, reactive forms, RxJS
- PrimeNG 21 (primary UI library) + PrimeIcons; `@primeng/themes`
- Charts: `chart.js`; dashboard grid: `angular-gridster2`
- i18n: `@ngx-translate/core` (Arabic / RTL supported)
- Source layout: `src/app/{core, shared, pages, layouts}`
- All API traffic goes through `environment.apiUrl` — no direct external URLs in components/services
  (per `../engine/rules/frontend-rule.md`)

---

## Brand Tokens

Defined in `roya-ai-dynamo-frontend/src/styles.css`.

| Token | Value | Role |
|-------|-------|------|
| `--roya-main` | `#ff6043` | Main / coral |
| `--roya-primary` | `#5922ea` | Primary / purple |
| `--roya-primary-light` | `#7c52f0` | Primary (light) |
| `--roya-secondary` | `#282828` | Secondary / dark |
| `--text-primary` | `#1a1a2e` | Body text |
| `--text-secondary` | `#64748b` | Muted text |

Typography: heading weight 600; PrimeNG theme customized with the brand colors above.

---

## Environments

- Config lives in Angular `environment.ts` files (frontend) and `.env` / config module (backend).
- Frontend base URL: `environment.apiUrl` (every HTTP call must be prefixed with it).
- Backend reads all secrets/providers from environment variables, validated at startup.
- Environments: `development`, `staging`, `production`.

---

## Integrations

Every provider is isolated behind an interface/adapter (per `../engine/rules/backend-rule.md` and the
system rules in `rules.md`). The frontend never calls these directly — all traffic routes through the API.

| Provider | Purpose | Notes |
|----------|---------|-------|
| Claude AI | Data analysis + dashboard generation | Provider-agnostic interface (swappable: OpenAI, Azure OpenAI); model via env var |
| MailJet | Transactional email | Welcome, generation-complete, share, password reset |
| Cloudflare R2 | Object storage (CSV, exports, PDFs) | S3-compatible (swappable: AWS S3, Azure Blob, GCS) |
| Redis | Cache + job queue + sessions + rate limiting | BullMQ queues |
| Payment Gateway (PayUp) | SaaS subscription billing | Provider-agnostic `PaymentProvider` interface; default provider `PayUp` (backend integration). Provider via `PAYMENT_PROVIDER`; PayUp keys `PAYUP_PUBLIC_KEY` / `PAYUP_SECRET_KEY`; base URL auto-selected by `NODE_ENV` (sandbox vs prod), overridable by `PAYUP_API_BASE_URL`. Hosted-checkout flow with public return endpoints; subscription activated via a durable BullMQ event after confirmed payment. |
| Google Analytics (GA4) | Product analytics | Client tracking |
| Grafana / Prometheus | Monitoring & observability | API latency, error rates, job + AI cost metrics |
| OAuth Providers | Social login | Google, Microsoft (OAuth 2.0) |

---

## System Conventions

- Internationalization via `ngx-translate`; RTL (Arabic) must be tested for complex UI.
- Backend is the source of truth for all calculated/business values; frontend displays only.
- New apps reuse `roya-ai-dynamo-api` — no duplicated business logic.