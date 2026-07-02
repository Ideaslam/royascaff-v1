# Pages — Tasks

## Module: Tasks

### Task Detail Page

- Route: `/tasks/:id`
- Components: `TaskDetailComponent`, `TaskStatusBadgeComponent`, `OffersPanelComponent`, `NegotiationHistoryComponent`, `CommentThreadComponent`, `AttachmentListComponent`, `GitHubRefsBadgeComponent`
- Service: `TasksApiService` → EP-052, EP-054; `OffersApiService` → EP-059–EP-064; `CommentsApiService` → EP-083–EP-086; `AttachmentsApiService` → EP-095–EP-097
- Guard: `AuthGuard`
- UI states: loading; counter-offer form inline; accept/reject actions for assignee
- Notes: RULE-004 negotiation via fields + comments; link to pay from project wallet when `done`

### Create Task Page (optional dialog)

- Route: `/projects/:projectId/tasks/new`
- Components: `TaskFormComponent`
- Service: `TasksApiService` → EP-051
- Guard: `AuthGuard`
- Notes: may be modal on project detail instead of standalone route
