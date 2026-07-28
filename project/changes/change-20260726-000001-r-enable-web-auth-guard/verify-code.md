# Verification — change-20260726-000001-r-enable-web-auth-guard

## Code Verification

| Check | Result |
|-------|--------|
| MainLayout `canActivate: [authGuard]` active | PASS — `app.routes.ts` |
| Public `/login`, `/register`, `/verify-email`, `/reset-password`, `/maintenance`, `/client/proposals/:id` outside MainLayout | PASS |
| `authGuard` redirects to `/login` when no session | PASS — existing guard logic |

## Acceptance Criteria

1. MainLayout uses authGuard — PASS  
2. Unauthenticated → `/login` — PASS (guard behavior)  
3. Public routes remain open — PASS  
4. Authenticated users reach children — PASS (unchanged guard allow path)  

## Result: **PASS**

## Manual smoke
- [ ] Logged out → open `/dashboard` → lands on `/login`
- [ ] Log in → `/dashboard` loads
- [ ] `/client/proposals/:id` still works without session
