# Project Status

_Last updated: 2026-07-26 — after Phase R (reverse-engineer)_

## Snapshot

| App | Services | Endpoints | Pages/Views | Overall |
|-----|----------|-----------|-------------|---------|
| api | 34/35 | 99/100 | — | partial |
| web | — | — | 24/24 | partial |

> Web pages are implemented, but overall is `partial` because MainLayout route auth is disabled (security gap tracked in REQ-R).

## By Module

| Module | Services | Endpoints | Pages/Views | Status |
|--------|----------|-----------|-------------|--------|
| Auth | 9/9 | 13/13 | 4/4 | partial |
| Users | 1/1 | 7/7 | 1/1 | done |
| Clients | 1/1 | 8/8 | 1/1 | done |
| Services | 1/1 | 6/6 | 2/2 | done |
| Service Categories | 1/1 | 6/6 | 1/1 | done |
| Proposals | 3/3 | 14/14 | 4/4 | done |
| Creative / AI Jobs | 3/3 | 5/5 | 2/2 | done |
| AI | 3/4 | 3/4 | 1/1 | partial |
| Contracts | 1/1 | 9/9 | 2/2 | done |
| Roles | 1/1 | 7/7 | 1/1 | done |
| Permissions | 1/1 | 6/6 | (w/ roles) | done |
| Settings | 2/2 | 2/2 | 1/1 | done |
| Config | — | 1/1 | — | done |
| Public | 1/1 | 2/2 | 1/1 | done |
| Admin | 2/2 | 11/11 | — | done |
| Integrations | 5/5 | — | — | done |
| Infrastructure | 3/3 | — | — | done |
| Dashboard | — | — | 1/1 | done |
| Maintenance | — | — | 1/1 | done |
| Profile | — | — | 1/1 | done |

## In Progress (`partial`)

- api · AI · SVC-AI-04 / EP-AI-02 — OpenAI stub throws "not configured"
- web · Auth · MainLayout — `authGuard` commented out (REQ-R change-001)
- api · Clients/Proposals/Roles/… — FE permission keys not fully enforced server-side (REQ-R change-002)

## Next Up (roadmap, ordered)

1. **REQ-R** `change-001-r-enable-web-auth-guard` — restore route protection
2. **REQ-R** `change-002-r-api-permission-parity` — PermissionGuard on data mutations
3. **REQ-R** `change-003-r-env-example` — API env template
4. Product: proposal-generator refactor (separate Phase 5 from `docs/refactor-proposal-generator.md`) — not REQ-R

## Deferred (`deferred`)

| Artifact | App · Module | Reason | Revisit when |
|----------|--------------|--------|--------------|
| OpenAI / Gemini providers | api · AI | stubs / not configured | product decides multi-provider |
| Server-side PDF | api/web · Proposals | FE print only today | pipeline v3 / refactor plan |
| Creative pipeline v3 (DNA, templates) | api · Creative | v2 implemented; v3 is new scope | Phase 5 feature program |
| Remove unused FE pdf deps | web | investigate first | cleanup sprint |
`)