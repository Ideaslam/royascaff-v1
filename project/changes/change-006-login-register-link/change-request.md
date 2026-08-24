# Change Request

## Metadata
- **date**: 2026-08-24
- **change-type**: modify-page
- **target-app**: customer-portal
- **affected-repos**: frontend
- **priority**: medium

## Scope
- Module(s): Auth
- Feature(s): User Registration & Login
- Endpoint(s): none (reuse `POST /api/merchant/v1/auth/register`)
- Page(s)/View(s): customer-portal: Login `/auth/login`
- Service(s): none

## Description
Anyone should be able to open registration from the merchant portal login page. The register page, route, and API already exist. Login already has a footer link to `/auth/register`, but the copy says **Request an account here** / **اطلب حساب من هنا**, which reads as invite-only.

Change that link to an explicit self-serve register action: **Create an account** / **إنشاء حساب**. No new endpoint, page, or backend change.

## Acceptance Criteria
1. Login (credentials step) shows a visible register link next to “Don't have an account?”
2. The link label is Create an account (EN) and إنشاء حساب (AR), not “request an account”.
3. The link navigates to `/auth/register`.
4. Existing register form and login ← register “Sign in” link keep working.
5. No backend or admin-panel change.

## Notes
Fast-Track: frontend-only copy/link on an existing page. Register route `auth.routes.ts` and `Register` component already implement self-serve signup.
