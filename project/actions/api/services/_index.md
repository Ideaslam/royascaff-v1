# Services Registry — Safqa API

> Status: `planned` · `partial` · `done` · `deferred` — see `engine/conventions.md`.
> Deviation: global route prefix is `/api` (not `/api/v1`).

| Module | File | IDs | Status | Done/Total | Purpose |
|--------|------|-----|--------|-----------|---------|
| Auth | `auth.md` | SVC-AUTH-01..09 | done | 9/9 | login, tokens, profile, registration, password |
| Users | `users.md` | SVC-USERS-01 | done | 1/1 | workspace user CRUD data layer |
| Clients | `clients.md` | SVC-CLIENTS-01 | done | 1/1 | client CRM data + logos |
| Services | `services.md` | SVC-SERVICES-01 | done | 1/1 | service catalog |
| Service Categories | `service-categories.md` | SVC-SVCCAT-01 | done | 1/1 | category catalog |
| Proposals | `proposals.md` | SVC-PROPOSALS-01..06 | done | 6/6 | proposal data, ops, sending, v3 status/retry/rendered/regen |
| Contracts | `contracts.md` | SVC-CONTRACTS-01 | done | 1/1 | legal contracts |
| Roles | `roles.md` | SVC-ROLES-01 | done | 1/1 | roles CRUD/batch |
| Permissions | `permissions.md` | SVC-PERMS-01..SEED-01 | done | 2/2 | permission catalog + seed keys |
| Settings | `settings.md` | SVC-SETTINGS-01..03 | done | 3/3 | workspace settings + logo upload + schema + v3 flag (default true) |
| Cutover Backfill | `cutover-backfill.md` | SVC-CUTOVER-01 | done | 1/1 | legacy proposals → projects ops script |
| AI | `ai.md` | SVC-AI-01..04 | partial | 3/4 | Claude/chat; OpenAI stub |
| AI Jobs | `ai-jobs.md` | SVC-AIJOBS-01..03 | done | 3/3 | jobs, creative pipeline, poller |
| Pipeline v3 Foundations | `pipeline-v3-foundations.md` | SVC-PIPEV3-01..07 | done | 8/8 | BullMQ, repos, traces, schemas, prompts, PDF |
| Pipeline Traces | `pipeline-traces.md` | SVC-TRACES-00..03 | done | 4/4 | list+stats; Mongo aggregates (proposal/cost/filter) |
| Pipeline Analyze + Map | `pipeline-analyze-map.md` | SVC-PIPE-AM-01..07 | partial | 6/7 | Steps 1–2; full 8 research options; vision 1b partial |
| Pipeline Sections + Engine | `pipeline-sections-engine.md` | SVC-PIPE-S3-01..09 | done | 9/9 | Steps 3–5 + assemble colorRoles→themeOverrides; reconciler |
| Pipeline Regen + Translate | `pipeline-regen-translate.md` | SVC-PIPE-RT-01..06 | done | 6/6 | regen, translate, sibling, formal seed |
| Pipeline Durable Resume | `pipeline-resume.md` | SVC-PIPE-RESUME-01..04 | done | 4/4 | resume helper, incomplete sections, reconciler, fan-in |
| Projects | `projects.md` | SVC-PROJECTS-01..04 | done | 4/4 | CRUD + DNA versions + snapshot pin + RFP/images (version+legacy) |
| Templates | `templates.md` | SVC-TPL-01..08 | done | 8/8 | pitch primary-led theme + formal + website landing; 20 sections |
| Admin | `admin.md` | SVC-ADMIN-01..02 | done | 2/2 | admin AI jobs + data reset |
| Integrations | `integrations.md` | SVC-INT-01..05 | done | 5/5 | S3, Mailjet, WhatsApp, Redis, encryption |
| Infrastructure | `infrastructure.md` | SVC-INFRA-01..03 | done | 3/3 | maintenance, ownership, creative config |
