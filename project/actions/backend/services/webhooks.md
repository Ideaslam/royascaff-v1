# Services — Webhooks

## Module: Webhooks

### SVC-042 · WebhooksService [domain, internal, Webhooks]

- Status: partial

- Methods:
  - `createEndpoint(adminId, dto): WebhookEndpointDto`
  - `listEndpoints(adminId): WebhookEndpointDto[]`
  - `updateEndpoint(adminId, id, dto): WebhookEndpointDto`
  - `deleteEndpoint(adminId, id): void`
  - `emit(eventType, payload): void` — enqueue deliveries for active matching endpoints
- Deps: `WebhookEndpointsRepository`, `WebhookDeliveryService`, `ActivityLogService`
- Side effects: async delivery jobs
- Rules: RULE-013 admin-configured; async BullMQ

### SVC-043 · WebhookDeliveryService [application, internal, Webhooks]

- Status: planned

- Methods:
  - `enqueue(delivery): void`
  - `processDelivery(deliveryId): void` — HTTP POST with signature header
  - `retryFailed(): void` — worker cron
- Deps: `WebhookDeliveriesRepository`, HTTP client, BullMQ
- Side effects: outbound HTTP
- Rules: RULE-013 signed payloads; retry policy
