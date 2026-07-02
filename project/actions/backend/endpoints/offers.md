# Endpoints — Offers & Negotiation

## Module: Offers & Negotiation

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-059 | GET | /tasks/:taskId/offers | authenticated | `param: taskId` | `200 TaskOfferDto[]` | `TaskOffersService.listForTask()` | done | — |
| EP-060 | POST | /tasks/:taskId/offers | authenticated | `param: taskId, body: CreateOfferDto` | `201 TaskOfferDto` | `TaskOffersService.createOffer()` | done | — |
| EP-061 | POST | /offers/:id/accept | authenticated | `param: id` | `200 TaskOfferDto` | `TaskOffersService.accept()` | done | — |
| EP-062 | POST | /offers/:id/reject | authenticated | `param: id` | `200 TaskOfferDto` | `TaskOffersService.reject()` | done | — |
| EP-063 | POST | /offers/:id/counter | authenticated | `param: id, body: CounterOfferDto` | `201 NegotiationHistoryDto` | `NegotiationService.counterOffer()` | done | — |
| EP-064 | GET | /offers/:id/history | authenticated | `param: id` | `200 NegotiationHistoryDto[]` | `NegotiationService.listHistory()` | done | — |
