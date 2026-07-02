# Services — Notifications

## Module: Notifications

### SVC-033 · NotificationsService [domain, internal, Notifications]

- Methods:
  - `list(userId, query): PaginatedResponse`
  - `markRead(userId, id): NotificationDto`
  - `markAllRead(userId): void`
  - `create(recipientId, event): Notification` — internal helper for other modules
  - `notifyCriticalEmail(event): void` — delegate to mail for select types
- Deps: `NotificationsRepository`, `MailjetEmailProvider`
- Side effects: in-app record; optional email
- Rules: RULE-009 in-app primary

### SVC-034 · MailjetEmailProvider [integration, external, Notifications]

- Methods:
  - `sendTemplate(to, templateId, vars): void`
  - `sendInviteEmail(to, inviteUrl): void`
  - `sendPasswordReset(to, resetUrl): void`
- Deps: Mailjet API, env config
- Side effects: email
- Rules: RULE-015 server-side only
