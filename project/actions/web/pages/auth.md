# Pages — Safqa Web · Auth

### Login `PG-AUTH-01`
- Route: `/login`
- Status: done
- Components: AuthShell, login form
- Service: AuthService → EP-AUTH-01, EP-AUTH-09
- Guard: maintenanceGuard
- Notes: stores session in localStorage `auth_session_v1`

### Register `PG-AUTH-02`
- Route: `/register`
- Status: done
- Components: AuthShell, register form
- Service: AuthService → EP-AUTH-04
- Guard: maintenanceGuard

### Verify Email `PG-AUTH-03`
- Route: `/verify-email`
- Status: done
- Components: AuthShell
- Service: AuthService → EP-AUTH-05, EP-AUTH-06
- Guard: maintenanceGuard

### Reset Password `PG-AUTH-04`
- Route: `/reset-password`
- Status: done
- Components: AuthShell
- Service: AuthService → EP-AUTH-07, EP-AUTH-08
- Guard: maintenanceGuard

### MainLayout shell (routing)
- Route: `''` → `MainLayoutComponent` (all authenticated app children)
- Status: done
- Guard: `authGuard` (REQ-R change-001) — unauthenticated → `/login`
- Notes: public auth + `/client/proposals/:id` + `/maintenance` stay outside this shell
