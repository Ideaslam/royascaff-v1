# Endpoints — Webhooks

## Module: Webhooks

| ID | Method | Route | Auth | Input | Return | Service | Notes |
|----|--------|-------|------|-------|--------|---------|-------|
| EP-113 | GET | /admin/webhooks | role:admin | — | `200 WebhookEndpointDto[]` | `WebhooksService.listEndpoints()` | — |
| EP-114 | POST | /admin/webhooks | role:admin | `body: CreateWebhookDto` | `201 WebhookEndpointDto` | `WebhooksService.createEndpoint()` | — |
| EP-115 | PATCH | /admin/webhooks/:id | role:admin | `param: id, body: UpdateWebhookDto` | `200 WebhookEndpointDto` | `WebhooksService.updateEndpoint()` | — |
| EP-116 | DELETE | /admin/webhooks/:id | role:admin | `param: id` | `204` | `WebhooksService.deleteEndpoint()` | — |
