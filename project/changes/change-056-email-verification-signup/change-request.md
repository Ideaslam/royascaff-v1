# Change Request

## Metadata
- **date**: 2026-07-13
- **change-type**: modify-feature
- **target-app**: customer-portal
- **affected-repos**: backend+frontend
- **priority**: medium

## Scope
- Module(s): Auth (1), Email integration (S7)
- Feature(s): User Registration, Transactional Email Service
- Endpoint(s): EP-AUTH-01 (register, modified), EP-AUTH-07 (verify-email, new), EP-AUTH-08 (resend-verification, new); guarded mutating endpoints for projects, dashboards, data, workspace invites
- Page(s)/View(s): customer-portal: Register (modified), Check Email (new), Verify Email (new), app-shell banner (new)
- Service(s): AuthService, MailProvider + email template renderer (new/extended)

## Description

### Problem
Customer Portal email/password signups are not verified, allowing fake signups with invalid or throwaway emails.

### Who is affected
- **Customer Portal** email/password registration only
- **Not affected**: Admin Panel registration, OAuth signups (Google/Microsoft treated as already verified)

### Desired behavior

**Registration happy path:**
1. User submits register form on Customer Portal
2. Account + workspace created; JWT issued (user stays logged in)
3. Verification email sent immediately (language from `languagePreference`: EN or AR)
4. User redirected to `/auth/check-email` (“Check your email” page)
5. User clicks link → `/auth/verify-email?token=...` → email marked verified → welcome email sent → success → redirect to app

**While unverified (limited access):**
- User may log in and complete onboarding
- User sees persistent verify banner in app shell
- **Backend-enforced blocks** on all mutating actions: create dashboard, create project, upload/sync data, workspace invites
- Read-only access otherwise (view existing content, settings, subscription pages)

**After verification:**
- Welcome email sent (EN/AR)
- Banner removed; full access restored
- `emailVerified: true` on user profile returned by `/auth/me`

**OAuth users:** `emailVerified: true` set automatically on first OAuth login/register — no verification step.

**Existing users:** Migration backfills all existing users with `emailVerified: true`.

### Out of scope
- Admin Panel email verification
- SMS or other verification channels
- Admin “force verify” UI
- Retroactive re-verification of existing users
- Email verification for password reset (unchanged)

### Constraints
- Verification token expiry: **24 hours**
- Resend cooldown: **5 minutes** per user
- EN + AR email templates and UI strings
- Branded HTML emails: Roya brand style (purple `#5922ea` header, coral `#ff6043` CTA, responsive layout)
- Email failure must not fail registration (fire-and-forget, log + continue)
- Templates live in `src/integrations/mail/templates/` per project rules

### Data model changes (User)
| Field | Type | Default | Notes |
|-------|------|---------|-------|
| `emailVerified` | Boolean | `false` (new users) | `true` for OAuth + migrated existing users |
| `emailVerificationToken` | String (hashed) | null | bcrypt hash of raw token |
| `emailVerificationExpiry` | Date | null | 24h from issue |
| `emailVerificationSentAt` | Date | null | for resend cooldown |

### New endpoints
| Method | Route | Auth | Purpose |
|--------|-------|------|---------|
| POST | `/api/v1/auth/verify-email` | public | Accept `{ token }`, mark verified, send welcome email |
| POST | `/api/v1/auth/resend-verification` | authenticated | Resend verification email; 429 if within 5-min cooldown |

### Modified endpoints / services
- `POST /auth/register` — set `emailVerified: false`, generate token, send verification email (not welcome), redirect to check-email
- `GET /auth/me` — include `emailVerified` in profile
- OAuth login — set `emailVerified: true` for new OAuth users
- Guard or middleware on mutating endpoints: projects create, dashboards create, data upload/sync, workspace invite — return `403 EMAIL_NOT_VERIFIED` when unverified

### Edge cases
| Scenario | Behavior |
|----------|----------|
| Invalid/expired token | Error on verify page; offer resend (if logged in) or login link |
| Already verified + verify again | Success: “Email already verified” |
| Resend while verified | 400: “Email already verified” |
| Resend within 5 min | 429: “Please wait before requesting another email” |
| Email send failure | Registration succeeds; user can resend later |
| Token reuse | Single-use; cleared after successful verify |

### Security
- Verify endpoint: public (token-based)
- Resend: authenticated, own account only
- Rate-limited per existing auth limits + 5-min resend cooldown
- Audit log: `USER_EMAIL_VERIFIED` on successful verify
- Never expose token hash in API responses

### Frontend (Customer Portal)
- **New pages**: `/auth/check-email`, `/auth/verify-email`
- **Modified**: register redirect → check-email; app shell persistent banner when logged in + unverified
- **Design**: match existing auth card layout (PrimeNG, Roya brand tokens); full EN/AR i18n + RTL
- **Register flow**: after signup → check-email (not onboarding directly unless invitation flow unchanged)

## Acceptance Criteria
1. Email/password registration sets `emailVerified: false` and sends a branded verification email in the user's language (EN/AR)
2. User is logged in after registration and lands on `/auth/check-email`
3. Clicking a valid verification link within 24h marks the user verified, sends welcome email, and redirects with success
4. Expired or invalid verification tokens show a clear error with path to resend or login
5. Authenticated unverified users can call `POST /auth/resend-verification`; requests within 5 minutes return 429
6. Resend while already verified returns 400
7. `/auth/me` returns `emailVerified` boolean; app shell shows banner when false
8. Unverified users are blocked at API level from: create project, create dashboard, data upload/sync, workspace invite — with `403 EMAIL_NOT_VERIFIED`
9. Unverified users can still log in, complete onboarding, and browse read-only content
10. OAuth (Google/Microsoft) new users get `emailVerified: true` automatically
11. Migration sets `emailVerified: true` for all existing users
12. HTML email templates exist for verification + welcome in EN and AR with Roya brand styling
13. All new UI strings are translated (EN/AR) with RTL support on new auth pages

## Notes
- Invitation signup flow: preserve existing invitation redirect after register; verification banner still applies until verified
- Welcome email sent only after successful verification (not at registration)
- Verification email replaces the current inline welcome email at registration time
