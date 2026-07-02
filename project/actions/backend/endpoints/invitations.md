# Endpoints — Invitations

## Module: Invitations

| ID | Method | Route | Auth | Input | Return | Service | Status | Notes |
| ---- | ------- | ------ | ----- | ------ | ------- | -------- | ------- | ------ |
| EP-013 | POST | /invitations/request | authenticated | `body: RequestInvitationDto` | `201 InvitationDto` | `InvitationsService.requestInvitation()` | done | — |
| EP-014 | GET | /invitations/mine | authenticated | `?page,limit,status` | `200 PaginatedInvitations` | `InvitationsService.listMine()` | done | — |
| EP-015 | GET | /invitations/pending | role:admin | `?page,limit` | `200 PaginatedInvitations` | `InvitationsService.listPending()` | done | — |
| EP-016 | POST | /invitations/:id/approve | role:admin | `param: id` | `200 InvitationDto` | `InvitationsService.approve()` | done | — |
| EP-017 | POST | /invitations/:id/reject | role:admin | `param: id, body: { reason? }` | `200 InvitationDto` | `InvitationsService.reject()` | done | — |
| EP-018 | GET | /invitations/:id | authenticated | `param: id` | `200 InvitationDto` | `InvitationsService.findOne()` | done | — |
