## Module: Subscriptions & Plans

### Subscriptions Page
- Route: `/app/subscriptions`
- Components: SubscriptionsPage (Tab 1: user subscriptions table with assign/change/cancel/activate/deactivate + create/change dialogs with "Mark as paid" checkbox; Tab 2: plans table with CRUD including free plans, create/edit dialog with Free Users Limit + Price Per Extra User fields)
- Service: ClientsService.list() → `GET /api/v1/users`; SubscriptionsAdminService.listSubscriptions() → `GET /api/v1/subscriptions`; SubscriptionsAdminService.create() → `POST /api/v1/subscriptions`; SubscriptionsAdminService.update() → `PUT /api/v1/subscriptions/:id`; SubscriptionsAdminService.change() → `POST /api/v1/subscriptions/change`; SubscriptionsAdminService.cancel() → `PATCH /api/v1/subscriptions/:userId/cancel`; SubscriptionsAdminService.activate() → `POST /api/v1/subscriptions/:id/activate`; SubscriptionsAdminService.deactivate() → `POST /api/v1/subscriptions/:id/deactivate`; SubscriptionsAdminService.listAllPlans() → `GET /api/v1/subscriptions/plans/all`; SubscriptionsAdminService.createPlan() → `POST /api/v1/subscriptions/plans`; SubscriptionsAdminService.updatePlan() → `PUT /api/v1/subscriptions/plans/:id`; SubscriptionsAdminService.deletePlan() → `DELETE /api/v1/subscriptions/plans/:id`
- Guard: authGuard + adminGuard
- Notes: Create/change dialogs include "Mark as paid" checkbox (default off → pending invoice). Plans table includes Free Users Limit and Price Per Extra User columns. Status filter includes `inactive`.
