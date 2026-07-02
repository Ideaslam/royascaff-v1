# Pages Registry — Linda

App key: `linda` · Repo: `linda-web` · API: `environment.apiUrl` → `/api/v1`

| Module | File | Routes |
|--------|------|--------|
| Auth | `auth.md` | `/auth/*` |
| Shell | `shell.md` | `/`, layout |
| Invitations | `invitations.md` | `/invitations/*`, `/admin/invitations/*` |
| Profile | `profile.md` | `/profile/*`, `/users/:id` |
| Sphere | `sphere.md` | `/sphere` |
| Projects | `projects.md` | `/projects/*` |
| Tasks | `tasks.md` | `/tasks/*` |
| Offers | `offers.md` | (embedded in task detail) |
| Board | `board.md` | `/projects/:id/board` |
| Mind Map | `mindmap.md` | `/mindmap` |
| Wallets | `wallets.md` | `/wallet`, `/projects/:id/wallet` |
| Notifications | `notifications.md` | `/notifications` |
| Admin | `admin.md` | `/admin/*` |
| GitHub | `github.md` | `/settings/github` |
| Activity | `activity.md` | `/activity` |

Layout: **auth layout** for `/auth/*`; **app shell** (sidebar + header) for all authenticated routes.
