# Endpoints — Webhooks

## Module: Webhooks

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-113 | GET | /admin/webhooks | role:admin | — | `200 WebhookEndpointDto[]` | `WebhooksService.listEndpoints()` | done | — |
| EP-114 | POST | /admin/webhooks | role:admin | `body: CreateWebhookDto` | `201 WebhookEndpointDto` | `WebhooksService.createEndpoint()` | done | — |
| EP-115 | PATCH | /admin/webhooks/:id | role:admin | `param: id, body: UpdateWebhookDto` | `200 WebhookEndpointDto` | `WebhooksService.updateEndpoint()` | done | — |
| EP-116 | DELETE | /admin/webhooks/:id | role:admin | `param: id` | `204` | `WebhooksService.deleteEndpoint()` | done | — |
