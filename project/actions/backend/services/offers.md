# Services — Offers & Negotiation

## Module: Offers & Negotiation

### SVC-024 · TaskOffersService [domain, internal, Offers & Negotiation]

- Methods:
  - `createOffer(userId, taskId, dto): TaskOfferDto` — offeredTo must be in Sphere
  - `listForTask(userId, taskId): TaskOfferDto[]`
  - `accept(userId, offerId): TaskOfferDto` — set assignee, task status `accepted`
  - `reject(userId, offerId): TaskOfferDto`
  - `supersedePending(taskId): void` — when new offer sent
- Deps: `TaskOffersRepository`, `TasksService`, `SphereGraphService`, `NotificationsService`
- Side effects: notifications
- Rules: RULE-004; one pending offer per task (data-model validation)

### SVC-025 · NegotiationService [domain, internal, Offers & Negotiation]

- Methods:
  - `counterOffer(userId, offerId, dto): NegotiationHistoryDto` — update offer terms, task status `negotiating`
  - `listHistory(userId, offerId): NegotiationHistoryDto[]`
- Deps: `NegotiationHistoriesRepository`, `TaskOffersRepository`, `TasksService`, `NotificationsService`
- Side effects: notifications on counter-offer
- Rules: RULE-004 no live chat; append-only history

### SVC-026 · TaskOffersRepository [domain, internal, Offers & Negotiation]

- Methods: CRUD, find pending by task
- Deps: MongoDB `taskOffers`, `negotiationHistories`
