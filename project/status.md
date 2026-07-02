# Project Status

_Last updated: 2026-07-02 — synced from linda-api + linda-web code via `.royascaff/scripts/sync-build-status.mjs`_

> **Read this first when resuming work.** Rolled up from per-artifact status in `project/actions/**` and each `_index.md`. Vocabulary: `engine/conventions.md` → **Build Status**.

## Snapshot

| App | Services | Endpoints | Pages/Views | Overall |
|-----|----------|-----------|-------------|---------|
| backend (`linda-api`) | 11/41 | 76/95 | — | partial |
| linda (`linda-web`) | — | — | 0/29 | partial |

## By Module

| Module | Services | Endpoints | Pages/Views | Status |
|--------|----------|-----------|-------------|--------|
| Activity | — | — | 0/2 | partial |
| Activity Log | 1/1 | 2/2 | — | done |
| Admin | 1/1 | 3/3 | 0/4 | partial |
| Attachments | 0/2 | 5/5 | — | partial |
| Auth | 1/5 | 4/12 | 0/5 | partial |
| Board | 1/1 | 2/2 | 0/1 | partial |
| Comments | 1/1 | 4/4 | — | done |
| GitHub | 0/3 | 0/8 | 0/1 | partial |
| Invitations | 0/3 | 6/6 | 0/2 | partial |
| Mind Map | 1/1 | 2/2 | 0/1 | partial |
| Notifications | 0/2 | 3/3 | 0/1 | partial |
| Offers & Negotiation | 0/3 | 6/6 | — | partial |
| Profile | — | — | 0/2 | partial |
| Projects | 1/3 | 9/9 | 0/3 | partial |
| Roles | 0/2 | 5/5 | — | partial |
| Shell | — | — | 0/2 | partial |
| Sphere | 0/2 | 2/4 | 0/1 | partial |
| Tasks | 1/3 | 6/6 | 0/2 | partial |
| Users | 1/3 | 6/7 | — | partial |
| Wallets | 2/3 | 7/7 | 0/2 | partial |
| Webhooks | 0/2 | 4/4 | — | partial |

## In Progress (`partial`)

- Auth · `auth.md` — 8/12 deferred
- GitHub · `github.md` — 5/8 partial
- Attachments · `attachments.md` — 1/2 partial
- Auth · `auth.md` — 1/5 partial
- Invitations · `invitations.md` — 1/3 partial
- Notifications · `notifications.md` — 1/2 partial
- Roles · `roles.md` — 1/2 partial
- Webhooks · `webhooks.md` — 1/2 partial
- Activity · `activity.md` — 2/2 partial
- Admin · `admin.md` — 4/4 partial
- Auth · `auth.md` — 2/5 partial
- Board · `board.md` — 1/1 partial
- GitHub · `github.md` — 1/1 partial
- Invitations · `invitations.md` — 2/2 partial
- Mind Map · `mindmap.md` — 1/1 partial
- Notifications · `notifications.md` — 1/1 partial
- Profile · `profile.md` — 1/2 partial
- Projects · `projects.md` — 2/3 partial
- Shell · `shell.md` — 2/2 partial
- Sphere · `sphere.md` — 1/1 partial
- Tasks · `tasks.md` — 2/2 partial
- Wallets · `wallets.md` — 2/2 partial

## Next Up (roadmap, ordered)

1. GitHub (`github.md`) — 3 planned
2. Offers & Negotiation (`offers.md`) — 3 planned
3. Sphere (`sphere.md`) — 2 planned
4. linda · Auth pages — 3 planned route(s)
5. linda · Profile pages — 1 planned route(s)
6. linda · Projects pages — 1 planned route(s)

## Deferred (`deferred`)

| Artifact | App · Module | Reason | Revisit when |
|----------|--------------|--------|--------------|
| EP-003–EP-006 (refresh / logout / password reset) | backend · Auth | Core JWT login/register works; refresh tokens and password reset not implemented | auth hardening sprint |
| EP-008–EP-011 (OAuth login) | backend · Auth | Google/GitHub OAuth endpoints not wired | auth hardening sprint |
| Password reset + OAuth callback pages | linda · Auth | Frontend routes not registered yet | auth hardening sprint |

## Sync command

Re-run after code changes:

```bash
node .royascaff/scripts/sync-build-status.mjs
```
