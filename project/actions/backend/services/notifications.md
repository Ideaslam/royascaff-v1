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
- `whitelistPaymentFields` emits `Money` for amount and product prices; `currencyConversion` is `{ original, converted, exchangeRate }`

### SVC-N09 · initializeNotifications [domain, internal, Notifications]
- Bootstraps registries, channels, workers on app start

### SVC-N10 · NotificationCatalogService [domain, internal, Notifications]
- Methods: `listActiveEventTypes`, `listAvailableChannels`
- Deps: `EventTypeRepository`, `ChannelRegistry`

### SVC-N11 · NotificationRuleService [domain, internal, Notifications]
- Methods: `createRule`, `listRulesByApp`, `getRuleById`, `updateRule`, `deleteRule`
- Deps: `NotificationRuleRepository`

### SVC-N12 · NotificationTemplateService [domain, internal, Notifications]
- Methods: `createTemplate`, `listTemplatesByApp`, `getTemplateById`, `updateTemplate`, `deleteTemplate`
- Deps: `NotificationTemplateRepository`

### SVC-N13 · NotificationDeliveryService [domain, internal, Notifications]
- Methods: `listDeliveries`, `getDeliveryById`, `redeliver`
- Deps: `DeliveryRepository`, `NotificationRuleRepository`, `AppService`, `ChannelRegistry`, `RecipientResolver`, `notifDeliveriesQueue`
- Side effects: manual redelivery enqueues BullMQ job on `notif-deliveries`

### SVC-N14 · NotificationInboxService [domain, internal, Notifications]
- Methods: `listInbox`, `getUnreadCount`, `markAsViewed`, `markAllAsViewed`
- Deps: `NotificationRepository`

**Workers:** `notif-dispatch.worker` (fan-out rules → deliveries), `notif-delivery.worker` (send + retry + auto-disable)
