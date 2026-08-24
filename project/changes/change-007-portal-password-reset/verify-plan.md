# Pre-Build Plan Verification — change-007

## 1. Feature coverage
- Password Reset has endpoints EP-AU19–21 and pages `/auth/forgot-password`, `/auth/reset-password`. PASS

## 2. Service coverage
- Endpoints call `PasswordResetService`; step-up uses `TotpService` + `PasskeyService`. PASS

## 3. Data model consistency
- Reuses `User.passwordResetTokenHash` / `passwordResetExpires`. No new entities. PASS

## 4. Endpoint–page linking
- Forgot → EP-AU19; reset → EP-AU21 then EP-AU20; passkey options → EP-AU15 only. PASS

## 5. Auth declarations
- All three password routes public + rate-limited; pages have no guard. PASS

## 6. Custom rules
- RULE-012 (Mailjet link + `APP_BASE_URL` = portal) and RULE-021 (step-up, no JWT). PASS
