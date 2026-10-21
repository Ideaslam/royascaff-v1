# change-080 — implementation contracts (shared between work streams)

All API responses use the existing `ApiResponse<T>` envelope.

## Limits sentinel (Stream Q owns backend; Stream F renders)
- Package/plan limit fields (`maxDashboards`, `maxDataUploads`, `maxDataUpdates`, `maxSyncedRows`, `maxSyncsPerDay`, plan mirrors `maxDataUploadsPerMonth`, …): `-1` = unlimited, `0` = blocked, `>0` = cap.
- `GET /subscriptions/me` usage envelope keeps `limits.<key>: number` and adds sibling `unlimited: { <sameKey>: boolean }` (true when the limit is -1).
- Admin package/plan forms send `-1` for unlimited; DTO `@Min(-1)`.

## New / changed endpoints
- `POST /subscriptions/renew` (JWT + WorkspaceRole OWNER, body `{ idempotencyKey?: string }`) → `{ invoice: BillingInvoice }` (status `open`, action `renewal`). The client then calls the existing `POST /subscriptions/invoices/:invoiceId/pay`.
  - Errors: `409 SUBSCRIPTION_RENEW_WINDOW_CLOSED` (use Upgrade), `409 SUBSCRIPTION_RENEW_NOT_AVAILABLE` (free plan without recent paid period / plan cannot renew), `403 SUBSCRIPTION_ADMIN_LOCKED`.
- `GET /subscriptions/me` response gains `renewal: { available: boolean; deadline: string | null; planId: string | null }` (deadline = last moment renew is allowed).
- `POST /subscriptions/invoices/:invoiceId/pay` → `403 SUBSCRIPTION_ADMIN_LOCKED` when subscription INACTIVE; `409 PAYMENT_IDEMPOTENCY_KEY_REUSED` on reused key whose attempt cannot continue; returns the existing open attempt's redirect when one is PENDING for the invoice.
- `GET /payments/review` (admin, `@Roles(ADMIN)`, query `page`, `limit`) → paginated list of payment attempts needing review: `{ items: [{ _id, invoiceId, workspaceId, amount, currency, status, failureCode, createdAt, invoiceStatus }], total, page, limit }`, where failureCode ∈ `refund_required | duplicate_payment` OR status VERIFIED_PAID with invoice not PAID.
- `POST /payments/manual-settlement` → `reason` required (string, non-empty).
- Admin `GET /subscriptions` items expose `previousStatus`, `reviewRequired`, `reviewReason`.
- Admin `POST /subscriptions/:id/activate` → `409 SUBSCRIPTION_NOT_INACTIVE` unless status is `inactive`.
- Admin `PUT /subscriptions/:id` → body `{ notes }` only.
- Admin `POST /subscriptions` (create) → body `{ workspaceId|userId…, planId, notes? }` (existing required ids kept); `startDate/status/endDate` removed.

## Error codes (customer UI must translate, EN/AR)
`SUBSCRIPTION_LOCKED`, `SUBSCRIPTION_ADMIN_LOCKED`, `SUBSCRIPTION_LIMIT_EXCEEDED`, `SUBSCRIPTION_USAGE_PERIOD_MISSING`, `SUBSCRIPTION_RENEW_WINDOW_CLOSED`, `SUBSCRIPTION_RENEW_NOT_AVAILABLE`, `PAYMENT_IDEMPOTENCY_KEY_REUSED`.

## Cross-stream service hooks
- Stream P adds to `BillingMailService` (best-effort, never throws):
  - `sendRenewalExpired(workspaceId: string, planName: string, endedAt: Date): Promise<void>` — paid period ended without renewal (auto-renew off).
  - `sendSuccessorNotice(workspaceId: string, fromPlanName: string, toPlanName: string, price: number, currency: string, effectiveAt: Date): Promise<void>`.
- Stream P adds `PaymentCheckoutService.reverifyPendingAttempts(now = new Date(), maxAgeMs = 3 days, limit = 100): Promise<{ checked: number; settled: number }>`; the lifecycle owner wires the `payment-attempt-reverify` repeatable job (every 10 min) in `subscriptions.module.ts` + `subscription-lifecycle.processor.ts`.
- Stream P, on refund/chargeback of an **applied** invoice: sets on the subscription `autoRenew=false`, `reviewRequired=true`, `reviewReason='refund'|'chargeback'`, and supersedes open renewals. Access period untouched.
- Stream Q adds `SubscriptionLimitService.release(workspaceId: string, key: SubscriptionLimitKey, amount = 1): Promise<void>` (best-effort, never below 0) and `SubscriptionLimitService.checkSyncAllowed(workspaceId, { scheduled?: boolean })` (scheduled → no `syncsToday` reservation).
