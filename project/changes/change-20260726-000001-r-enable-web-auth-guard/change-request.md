# Change Request

## Metadata
- **date**: 2026-07-26
- **change-type**: bug-fix
- **target-app**: web
- **affected-repos**: frontend
- **priority**: high
- **request-id**: REQ-R
- **part**: 1/3
- **depends-on**: —
- **blocks**: change-20260726-000002
- **pack-status**: merged

## Scope
- Module(s): Auth
- Feature(s): Route Protection (Web)
- Endpoint(s): —
- Page(s)/View(s): web: MainLayout children
- Service(s): —

## Description
MainLayout in `app.routes.ts` has `canActivate: [authGuard]` commented out. Unauthenticated users can load the app shell until an API 401 redirects. Restore the guard so protected routes require a valid session.

## Acceptance Criteria
1. MainLayout route uses `canActivate: [authGuard]`
2. Unauthenticated navigation to `/dashboard` (and other children) redirects to `/login`
3. Public routes (`/login`, `/client/proposals/:id`, `/maintenance`) remain reachable without session
4. Authenticated users still reach MainLayout children normally

## Notes
From Phase R drift report — HIGH severity.
