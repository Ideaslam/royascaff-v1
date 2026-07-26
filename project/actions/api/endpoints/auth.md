# Endpoints — Safqa API · Auth

> Auth default: `WorkspaceAuthGuard` (JWT Bearer + workspace). Only deviations noted.
> Prefix: `/api` (not `/api/v1`).

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
|----|--------|-------|------|-------|--------|---------|--------|-------|
| EP-AUTH-01 | POST | /api/auth/login | public | body: email,password | tokens + user | AuthActionsService.login | done | |
| EP-AUTH-02 | POST | /api/auth/refresh | public | body: refreshToken | tokens | AuthActionsService.refresh | done | |
| EP-AUTH-03 | POST | /api/auth/logout | public | body: refreshToken | ok | AuthActionsService.logout | done | |
| EP-AUTH-04 | POST | /api/auth/register | public | body: register dto | result | AuthRegistrationService.register | done | |
| EP-AUTH-05 | GET | /api/auth/verify-email | public | query: token | ok | VerificationService | done | |
| EP-AUTH-06 | POST | /api/auth/resend-verification | public | body: email | ok | VerificationService | done | |
| EP-AUTH-07 | POST | /api/auth/password-reset | public | body: email | ok | PasswordService | done | |
| EP-AUTH-08 | POST | /api/auth/reset-password | public | body: token,password | ok | PasswordService | done | |
| EP-AUTH-09 | GET | /api/auth/bootstrap | authenticated | — | user+permissions+workspace | UserContextService.bootstrap | done | |
| EP-AUTH-10 | GET | /api/auth/profile | authenticated | — | profile | ProfileService | done | |
| EP-AUTH-11 | PATCH | /api/auth/profile | authenticated | body: profile | profile | ProfileService | done | |
| EP-AUTH-12 | POST | /api/auth/profile/avatar | authenticated | body: base64 file | profile | ProfileService | done | |
| EP-AUTH-13 | DELETE | /api/auth/profile/avatar | authenticated | — | profile | ProfileService | done | |
