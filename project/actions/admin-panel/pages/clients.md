## Module: Client Management

### Clients Page
- Route: `/app/clients`
- Components: ClientsPage (users table with filters, create/edit dialog, suspend/reactivate toggle, delete confirm)
- Service: ClientsService.list() → `GET /api/v1/users`; ClientsService.create() → `POST /api/v1/users`; ClientsService.update() → `PUT /api/v1/users/:id`; ClientsService.suspend() → `PATCH /api/v1/users/:id/suspend`; ClientsService.reactivate() → `PATCH /api/v1/users/:id/reactivate`; ClientsService.delete() → `DELETE /api/v1/users/:id`
- Guard: authGuard + adminGuard
