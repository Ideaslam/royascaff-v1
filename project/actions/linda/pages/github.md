# Pages — GitHub

## Module: GitHub

### GitHub Settings Page

- Route: `/settings/github`
- Status: partial
- Components: `GithubConnectionCardComponent`, `ConnectGithubButtonComponent`
- Service: `GithubApiService` → EP-100, EP-101, EP-102, EP-103
- Guard: `AuthGuard`
- UI states: connected/disconnected states; connect redirects OAuth
- Notes: RULE-010 single OAuth app

### Project GitHub Links Panel

- Route: embedded on `/projects/:id` and `/projects/:id/board`
- Components: `ProjectGithubLinksComponent`, `GithubLinkFormComponent`, `GithubRefsPickerComponent`
- Service: `GithubApiService` → EP-104, EP-105, EP-106, EP-107
- Guard: `AuthGuard` + PM/owner
- Notes: read-focused branch/commit display on board cards (RULE-011)
