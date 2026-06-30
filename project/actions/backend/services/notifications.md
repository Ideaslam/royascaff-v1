# Services — Notifications

## Module: Notifications

### SVC-N01 · EventBus [domain, internal, Notifications]
- Methods: `emit(eventType, payload)` — enqueue dispatch job
- Deps: `ContextBuilderRegistry`, `ChannelRegistry`, BullMQ

### SVC-N02 · WebhookEndpointService [domain, internal, Notifications]
- Methods: `createEndpoint`, `getEndpoint`, `listEndpoints`, `listWebhookEndpointsPaginated`, `updateEndpoint`, `deleteEndpoint`, `rollSecret`, `getSecret`
- Deps: `WebhookEndpointRepository`, AES encryption for secrets

### SVC-N03 · ChannelRegistry [domain, internal, Notifications]
- Registers: WebhookChannel, EmailChannel, PushChannel

### SVC-N04 · WebhookChannel [integration, external, Notifications]
- Methods: `resolveTarget`, `render`, `send` — HMAC-SHA256 signed HTTP POST, SSRF protection
- Deps: axios, encrypted secrets

### SVC-N05 · EmailChannel [integration, external, Notifications]
- Methods: `resolveTarget`, `render`, `send`
- Deps: `EmailService`, templates

### SVC-N06 · PushChannel [integration, external, Notifications]
- Methods: `resolveTarget`, `render`, `send` — provider-ready stub

### SVC-N07 · RecipientResolver [domain, internal, Notifications]
- Methods: `resolveFromPayment`, `getMerchantContacts`, `resolveFromCustomer`

### SVC-N08 · ContextBuilderRegistry + builders [domain, internal, Notifications]
- PaymentContextBuilder, CustomerContextBuilder — normalize event payloads

### SVC-N09 · initializeNotifications [domain, internal, Notifications]
- Bootstraps registries, channels, workers on app start

**Workers:** `notif-dispatch.worker` (fan-out rules → deliveries), `notif-delivery.worker` (send + retry + auto-disable)
