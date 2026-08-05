# Pages Registry — Safqa Web

> Angular 18 routes from `app.routes.ts`. Main layout uses `canActivate: [authGuard]` (REQ-R change-20260726-000001).

| Module | File | Route prefix | Status | Done/Total | Purpose |
|--------|------|--------------|--------|-----------|---------|
| Auth | `auth.md` | `/login` … + MainLayout shell | done | 5/5 | login/register/verify/reset + authGuard on app shell |
| Global UI | `global-cards.md` | — | done | 1/1 | Shared `p-card` chrome (Create Project look) |
| Dashboard | `dashboard.md` | `/dashboard` | done | 1/1 | KPIs / charts |
| Proposals | `proposals.md` | `/proposals`, `/proposal` | done | 7/7 | list/view/edit + wizard + v3 stepper/actions + stuck Continue |
| Projects | `projects.md` | `/projects` | done | 5/5 | list / create / workspace DNA versions + picker / DNA form; edit legacy |
| Creative | `creative.md` | `/creative`, `/creative/output` | done | 2/2 | unified v2 create (EP-CREATIVE-V2-01); works with v3 flag on |
| Contracts | `contracts.md` | `/contracts` | done | 2/2 | list + edit |
| Clients | `clients.md` | `/clients` | done | 1/1 | client CRM |
| Services | `services.md` | `/services` | done | 2/2 | catalog list + edit; revenue type = unit |
| Service Categories | `service-categories.md` | `/service-categories` | done | 1/1 | categories |
| AI | `ai.md` | `/ai` | done | 1/1 | AI playground |
| AI Jobs | `ai-jobs.md` | — | cancelled | 0/0 | FE removed; observability → AI Requests |
| AI Requests | `ai-requests.md` | `/ai-requests` | done | 3/3 | projects overview (createdAt sort) + deep-link + detail |
| Users | `users.md` | `/users` | done | 1/1 | team members |
| Profile | `profile.md` | `/profile` | done | 1/1 | self profile |
| Roles | `roles.md` | `/roles-permissions` | done | 1/1 | roles & permissions UI |
| Settings | `settings.md` | `/settings` | done | 1/1 | workspace settings + company logo |
| Layout | `layout.md` | shell | done | 1/1 | sidebar workspace logo |
| Public | `public.md` | `/client/proposals/:id` | done | 1/1 | public proposal view |
| Maintenance | `maintenance.md` | `/maintenance` | done | 1/1 | maintenance page |
